const localforage = require('localforage');

const Asset = require('./Asset');
const Helper = require('./Helper');

/**
 * Implements storage on the local device, available even when the device has no network connection.
 */
class LocalHelper extends Helper {

    constructor (parent) {
        super(parent);

        localforage.config({
            name: 'Scratch 3.0',
            size: 100 * 1024 * 1024
        });
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @param {DataFormat} dataFormat - The file format / file extension of the asset to fetch: PNG, JPG, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType, assetId, dataFormat) {
        return new Promise((fulfill, reject) => {
            const fileName = [assetId, dataFormat].join('.');
            localforage.getItem(fileName).then(
                data => {
                    if (data === null) {
                        fulfill(null);
                    } else {
                        fulfill(new Asset(assetType, assetId, dataFormat, data));
                    }
                },
                error => {
                    reject(error);
                });
        });
    }
}

module.exports = LocalHelper;
