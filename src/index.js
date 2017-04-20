const Asset = require('./Asset');
const AssetType = require('./AssetType');
const ScratchStorage = require('./ScratchStorage');

/**
 * Export for use with NPM & Node.js.
 * @type {ScratchStorage}
 */
module.exports = Object.assign(ScratchStorage, {
    /**
     * Please use the `Asset` member of a storage instance instead.
     * @deprecated
     */
    Asset: Asset,

    /**
     * Please use the `AssetType` member of a storage instance instead.
     * @deprecated
     */
    AssetType: AssetType
});
