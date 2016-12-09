const BuiltinHelper = require('./BuiltinHelper');
const LocalHelper = require('./LocalHelper');
const WebHelper = require('./WebHelper');

class ScratchStorage {
    constructor () {
        this.defaultAssetId = {};

        this.builtinHelper = new BuiltinHelper(this);
        this.webHelper = new WebHelper(this);
        this.localHelper = new LocalHelper(this);

        this.builtinHelper.registerDefaultAssets(this);
    }

    /**
     * Register a web-based source for assets. Sources will be checked in order of registration.
     * @param {Array.<AssetType>} types - The types of asset provided by this source.
     * @param {UrlFunction} urlFunction - A function which computes a URL from an Asset.
     */
    addWebSource (types, urlFunction) {
        this.webHelper.addSource(types, urlFunction);
    }

    /**
     * TODO: Should this be removed in favor of requesting an asset with `null` as the ID?
     * @param {AssetType} type - Get the default ID for assets of this type.
     * @return {?string} The ID of the default asset of the given type, if any.
     */
    getDefaultAssetId (type) {
        if (this.defaultAssetId.hasOwnProperty(type.name)) {
            return this.defaultAssetId[type.name];
        }
    }

    /**
     * Set the default ID for a particular type of asset. This default asset will be used if a requested asset cannot
     * be found and automatic fallback is enabled. Ideally this should be an asset that is available locally or even
     * one built into this module.
     * TODO: Should this be removed in favor of requesting an asset with `null` as the ID?
     * @param {AssetType} type - The type of asset for which the default will be set.
     * @param {string} id - The default ID to use for this type of asset.
     */
    setDefaultAssetId (type, id) {
        this.defaultAssetId[type.name] = id;
    }

    /**
     * Fetch an asset by type & ID.
     * @param {AssetType} assetType - The type of asset to fetch. This also determines which asset store to use.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @return {Promise.<Asset>} A promise for the requested Asset.
     */
    load (assetType, assetId) {
        /** @type {Helper[]} */
        const helpers = [this.builtinHelper, this.localHelper, this.webHelper];
        const errors = [];
        let helperIndex = 0;

        return new Promise((fulfill, reject) => {
            const tryNextHelper = () => {
                if (helperIndex < helpers.length) {
                    helpers[helperIndex++].load(assetType, assetId)
                        .then(
                            asset => {
                                // TODO? this.localHelper.cache(assetType, assetId, asset);
                                fulfill(asset);
                            },
                            error => {
                                errors.push(error);
                                // TODO: maybe some types of error should prevent trying the next helper?
                                tryNextHelper();
                            }
                        );
                } else {
                    reject(errors);
                }
            };

            tryNextHelper();
        });
    }
}

module.exports = ScratchStorage;
