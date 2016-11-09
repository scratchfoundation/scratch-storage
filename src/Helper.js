/**
 * Base class for asset load/save helpers.
 * @abstract
 */
class Helper {
    constructor (parent) {
        this.parent = parent;
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType, assetId) {
        return Promise.reject(new Error(`No asset of type ${assetType} for ID ${assetId}`));
    }
}

module.exports = Helper;
