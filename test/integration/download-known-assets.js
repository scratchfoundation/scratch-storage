const md5 = require('js-md5');
const test = require('tap').test;

const ScratchStorage = require('../../dist/node/scratch-storage');

let storage;
test('constructor', t => {
    storage = new ScratchStorage();
    t.type(storage, ScratchStorage);
    t.end();
});

/**
 *
 * @type {AssetTestInfo[]}
 * @typedef {object} AssetTestInfo
 * @property {AssetType} type - The type of the asset.
 * @property {string} id - The asset's unique ID.
 * @property {string} md5 - The asset's MD5 hash.
 * @property {DataFormat} [ext] - Optional: the asset's data format / file extension.
 */
const testAssets = [
    // TODO: mock project download, since we can no longer download projects directly
    // {
    //     type: storage.AssetType.Project,
    //     id: '117504922',
    //     md5: null // don't check MD5 for project without revision ID
    // },
    // {
    //     type: storage.AssetType.Project,
    //     id: '117504922.d6ae1ffb76f2bc83421cd3f40fc4fd57',
    //     md5: '1225460702e149727de28bff4cfd9e23'
    // },
    {
        type: storage.AssetType.ImageVector,
        id: 'f88bf1935daea28f8ca098462a31dbb0', // cat1-a
        md5: 'f88bf1935daea28f8ca098462a31dbb0'
    },
    {
        type: storage.AssetType.ImageVector,
        id: '6e8bd9ae68fdb02b7e1e3df656a75635', // cat1-b
        md5: '6e8bd9ae68fdb02b7e1e3df656a75635',
        ext: storage.DataFormat.SVG
    },
    {
        type: storage.AssetType.ImageBitmap,
        id: '7e24c99c1b853e52f8e7f9004416fa34', // squirrel
        md5: '7e24c99c1b853e52f8e7f9004416fa34'
    },
    {
        type: storage.AssetType.ImageBitmap,
        id: '66895930177178ea01d9e610917f8acf', // bus
        md5: '66895930177178ea01d9e610917f8acf',
        ext: storage.DataFormat.PNG
    },
    {
        type: storage.AssetType.ImageBitmap,
        id: 'fe5e3566965f9de793beeffce377d054', // building at MIT
        md5: 'fe5e3566965f9de793beeffce377d054',
        ext: storage.DataFormat.JPG
    },
    {
        type: storage.AssetType.Sound,
        id: '83c36d806dc92327b9e7049a565c6bff', // meow
        md5: '83c36d806dc92327b9e7049a565c6bff' // wat
    }
];

test('addWebStore', t => {
    t.doesNotThrow(() => {
        storage.addWebStore(
            [storage.AssetType.Project],
            asset => {
                const idParts = asset.assetId.split('.');
                return idParts[1] ?
                    `https://cdn.projects.scratch.mit.edu/internalapi/project/${idParts[0]}/get/${idParts[1]}` :
                    `https://cdn.projects.scratch.mit.edu/internalapi/project/${idParts[0]}/get/`;
            });
    });
    t.doesNotThrow(() => {
        storage.addWebStore(
            [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound],
            asset => `https://cdn.assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`
        );
    });
    t.end();
});

test('load', t => {
    const assetChecks = testAssets.map(async assetInfo => {
        const asset = await storage.load(assetInfo.type, assetInfo.id, assetInfo.ext)
            .catch(e => {
                // tap's output isn't great if we just let it catch the unhandled promise rejection
                // wrapping it like this makes a failure much easier to read in the test output
                throw new Error(`failed to load ${assetInfo.type.name} asset with id=${assetInfo.id} (e=${e})`);
            });
        t.type(asset, storage.Asset);
        t.equal(asset.assetId, assetInfo.id);
        t.equal(asset.assetType, assetInfo.type);
        t.ok(asset.data.length);

        // Web assets should come back as clean
        t.ok(asset.clean);

        if (assetInfo.md5) {
            t.equal(md5(asset.data), assetInfo.md5);
        }
    });

    return Promise.all(assetChecks);
});
