const test = require('tap').test;
const TextEncoder = require('util').TextEncoder;
const TextDecoder = require('util').TextDecoder;

const FetchTool = require('../../src/FetchTool');

test('send success returns response.text()', t => {
    global.fetch = () => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('successful response')
    });

    const tool = new FetchTool();
    
    return t.resolves(
        tool.send('url').then(result => {
            t.equal(result, 'successful response');
        })
    );
});

test('send failure returns response.status', t => {
    global.fetch = () => Promise.resolve({
        ok: false,
        status: 500
    });

    const tool = new FetchTool();

    return t.rejects(tool.send('url'), 500);
});

test('get success returns Uint8Array.body(response.arrayBuffer())', t => {
    const text = 'successful response';
    const encoding = 'utf-8';
    const encoded = new TextEncoder().encode(text);
    const decoder = new TextDecoder(encoding);

    global.fetch = () => Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(encoded.buffer)
    });

    const tool = new FetchTool();
    
    return t.resolves(
        tool.get({url: 'url'}).then(result => {
            t.equal(decoder.decode(result), text);
        })
    );
});

test('get with 404 response returns null data', t => {
    global.fetch = () => Promise.resolve({
        ok: false,
        status: 404
    });

    const tool = new FetchTool();

    return t.resolves(
        tool.get('url').then(result => {
            t.equal(result, null);
        })
    );
});

test('get failure returns response.status', t => {
    global.fetch = () => Promise.resolve({
        ok: false,
        status: 500
    });

    const tool = new FetchTool();

    return t.rejects(tool.get({url: 'url'}), 500);
});
