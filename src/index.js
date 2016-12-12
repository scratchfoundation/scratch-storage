const Asset = require('./Asset');
const AssetType = require('./AssetType');
const ScratchStorage = require('./ScratchStorage');

/**
 * Export for use with NPM & Node.js.
 * @type {ScratchStorage}
 */
module.exports = Object.assign(ScratchStorage, {
    Asset: Asset,
    AssetType: AssetType
});
