const tap = require('tap');

const mockFetchModule = require('../mocks/mock-fetch.js');


// Call this separately from each test to ensure that metadata gets reset.
// This is especially important when parallelizing tests!
const setupModules = () => {
    /**
     * This instance of scratchFetch will be shared between this file and FetchTool.
     * By sharing the same instance, the test can affect the metadata that FetchTool will use.
     */
    const scratchFetchModule = tap.mock('../../src/scratchFetch', {
        'cross-fetch': mockFetchModule
    });

    /**
     * This is the real FetchTool, but the 'cross-fetch' module has been replaced with the mockFetch function.
     * @type {typeof import('../../src/FetchTool')}
     */
    const FetchTool = tap.mock('../../src/FetchTool', {
        'cross-fetch': mockFetchModule,
        // Make sure FetchTool uses the same scratchFetch instance
        '../../src/scratchFetch': scratchFetchModule
    });

    return {scratchFetchModule, FetchTool};
};

tap.test('get without metadata', async t => {
    const {FetchTool} = setupModules();

    const tool = new FetchTool();

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};
    const result = await tool.get({url: '200', mockFetchTestData});

    t.type(result, Uint8Array);
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');
    t.equal(mockFetchTestData.headersCount, 0);
});

tap.test('get with metadata', async t => {
    const {scratchFetchModule, FetchTool} = setupModules();
    const {RequestMetadata, setMetadata} = scratchFetchModule;

    const tool = new FetchTool();

    setMetadata(RequestMetadata.ProjectId, 1234);
    setMetadata(RequestMetadata.RunId, 5678);

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};
    const result = await tool.get({url: '200', mockFetchTestData});

    t.type(result, Uint8Array);
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');
    t.equal(mockFetchTestData.headersCount, 2);
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.ProjectId), '1234');
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.RunId), '5678');
});

tap.test('send without metadata', async t => {
    const {FetchTool} = setupModules();

    const tool = new FetchTool();

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};
    const result = await tool.send({url: '200', mockFetchTestData});

    t.type(result, 'string');
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');
    t.equal(mockFetchTestData.headersCount, 0);
});

tap.test('send with metadata', async t => {
    const {scratchFetchModule, FetchTool} = setupModules();
    const {RequestMetadata, setMetadata} = scratchFetchModule;

    const tool = new FetchTool();

    setMetadata(RequestMetadata.ProjectId, 4321);
    setMetadata(RequestMetadata.RunId, 8765);

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};
    const result = await tool.send({url: '200', mockFetchTestData});

    t.type(result, 'string');
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');
    t.equal(mockFetchTestData.headersCount, 2);
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.ProjectId), '4321');
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.RunId), '8765');
});

tap.test('selectively delete metadata', async t => {
    const {scratchFetchModule, FetchTool} = setupModules();
    const {RequestMetadata, setMetadata, unsetMetadata} = scratchFetchModule;

    // verify that these special values are preserved and not interpreted as "delete"
    setMetadata(RequestMetadata.ProjectId, null);
    setMetadata(RequestMetadata.RunId, void 0); // void 0 = undefined

    const tool = new FetchTool();

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};

    const result1 = await tool.send({url: '200', mockFetchTestData});
    t.type(result1, 'string');
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');

    t.equal(mockFetchTestData.headersCount, 2);
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.ProjectId), 'null'); // string "null" means it's present
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.RunId), 'undefined');

    // remove the Project ID from metadata
    unsetMetadata(RequestMetadata.ProjectId);

    const result2 = await tool.send({url: '200', mockFetchTestData});
    t.type(result2, 'string');
    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');

    t.equal(mockFetchTestData.headersCount, 1);
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.ProjectId), null); // value `null` means it's missing
    t.equal(mockFetchTestData.headers?.get(RequestMetadata.RunId), 'undefined');
});

tap.test('metadata has case-insensitive keys', async t => {
    const {scratchFetchModule, FetchTool} = setupModules();
    const {setMetadata} = scratchFetchModule;

    setMetadata('foo', 1);
    setMetadata('FOO', 2);

    const tool = new FetchTool();

    /** @type import('../mocks/mock-fetch.js').MockFetchTestData */
    const mockFetchTestData = {};
    await tool.get({url: '200', mockFetchTestData});

    t.ok(mockFetchTestData.headers, 'mockFetch did not report headers');
    t.equal(mockFetchTestData.headersCount, 1);
    t.equal(mockFetchTestData.headers?.get('foo'), '2');
});
