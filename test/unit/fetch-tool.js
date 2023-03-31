const tap = require('tap');
const TextDecoder = require('util').TextDecoder;

const mockFetch = require('../mocks/mock-fetch.js');

/**
 * This is the real FetchTool, but the 'cross-fetch' module has been replaced with the mockFetch function.
 * @type {typeof import('../../src/FetchTool')}
 */
const FetchTool = tap.mock('../../src/FetchTool', {
    'cross-fetch': mockFetch
});

tap.test('send success returns response.text()', t => {
    const tool = new FetchTool();

    return t.resolves(
        tool.send({url: '200'}).then(result => {
            t.equal(result, mockFetch.successText);
        })
    );
});

tap.test('send failure returns response.status', t => {
    const tool = new FetchTool();

    return t.rejects(tool.send({url: '500'}), 500);
});

tap.test('get success returns Uint8Array.body(response.arrayBuffer())', t => {
    const encoding = 'utf-8';
    const decoder = new TextDecoder(encoding);

    const tool = new FetchTool();

    return t.resolves(
        tool.get({url: '200'}).then(result => {
            t.equal(decoder.decode(result), mockFetch.successText);
        })
    );
});

tap.test('get with 404 response returns null data', t => {
    const tool = new FetchTool();

    return t.resolves(
        tool.get({url: '404'}).then(result => {
            t.equal(result, null);
        })
    );
});

tap.test('get failure returns response.status', t => {
    const tool = new FetchTool();

    return t.rejects(tool.get({url: '500'}), 500);
});
