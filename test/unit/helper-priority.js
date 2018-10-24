const test = require('tap').test;

const ScratchStorage = require('../../dist/node/scratch-storage');

let storage;
test('constructor', t => {
    storage = new ScratchStorage();
    t.type(storage, ScratchStorage);
    t.end();
});

const logEntries = [];
class FakeHelper {
    constructor (label, shouldSucceed) {
        this.label = label;
        this.shouldSucceed = shouldSucceed;
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @param {DataFormat} dataFormat - The file format / file extension of the asset to fetch: PNG, JPG, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType, assetId, dataFormat) {
        logEntries.push(this.label);
        return this.shouldSucceed ?
            Promise.resolve(new storage.Asset(assetType, assetId, dataFormat, Buffer.from(this.label))) :
            Promise.reject(`This is an expected failure from ${this.label}`);
    }
}

test('addHelper', t => {
    storage.addHelper(new FakeHelper('third', true), -50);
    storage.addHelper(new FakeHelper('first', false), 50);
    storage.addHelper(new FakeHelper('second', false), 0);
    t.end();
});

test('priorities', t => {
    t.deepEqual(logEntries, []);
    return storage.load('fakeAssetType', 'fakeAssetId', 'fakeDataFormat').then(() => {
        t.deepEqual(logEntries, [
            'first',
            'second',
            'third'
        ]);
    });
});
