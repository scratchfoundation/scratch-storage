const crypto = require('crypto');
const test = require('tap').test;

const jsdomTest = require('../fixtures/jsdomTest');

/**
 * These tests will run inside the jsdom "window" after loading the script under test.
 * @param {object} window - the jsdom window.
 */
const hostedTests = function (window) {
    const ScratchStorage = window.Scratch.Storage;
    const {Asset, AssetType} = ScratchStorage;

    const defaultAssetTypes = [AssetType.ImageBitmap, AssetType.ImageVector, AssetType.Sound];
    const defaultIds = {};

    let storage;
    test('constructor', t => {
        storage = new ScratchStorage();
        t.type(storage, ScratchStorage);
        t.end();
    });

    test('getDefaultAssetId', t => {
        for (let i = 0; i < defaultAssetTypes.length; ++i) {
            const assetType = defaultAssetTypes[i];
            const id = storage.getDefaultAssetId(assetType);
            t.type(id, 'string');
            defaultIds[assetType.name] = id;
        }
        t.end();
    });

    test('load', t => {
        const promises = [];
        for (let i = 0; i < defaultAssetTypes.length; ++i) {
            const assetType = defaultAssetTypes[i];
            const id = defaultIds[assetType.name];

            const promise = storage.load(assetType, id);
            t.type(promise, 'Promise');

            promises.push(promise);

            promise.then(asset => {
                t.type(asset, Asset);
                t.strictEqual(asset.assetId, id);
                t.strictEqual(asset.assetType, assetType);
                t.ok(asset.data.length);

                const hash = crypto.createHash('md5');
                hash.update(asset.data);
                t.strictEqual(hash.digest('hex'), id);
            });
        }

        return Promise.all(promises);
    });
};

jsdomTest(
    hostedTests,
    '<html><body></body></html>',
    [require.resolve('../../dist/web/scratch-storage')]
);
