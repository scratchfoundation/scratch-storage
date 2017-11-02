const BuiltinHelper = require('./BuiltinHelper');
const LocalHelper = require('./LocalHelper');
const WebHelper = require('./WebHelper');

const _Asset = require('./Asset');
const _AssetType = require('./AssetType');
const _DataFormat = require('./DataFormat');

class ScratchStorage {
    constructor () {
        this.defaultAssetId = {};

        this.builtinHelper = new BuiltinHelper(this);
        this.webHelper = new WebHelper(this);
        this.localHelper = new LocalHelper(this);

        this.builtinHelper.registerDefaultAssets(this);
    }

    /**
     * @return {Asset} - the `Asset` class constructor.
     * @constructor
     */
    get Asset () {
        return _Asset;
    }

    /**
     * @return {AssetType} - the list of supported asset types.
     * @constructor
     */
    get AssetType () {
        return _AssetType;
    }

    /**
     * @return {DataFormat} - the list of supported data formats.
     * @constructor
     */
    get DataFormat () {
        return _DataFormat;
    }

    /**
     * @deprecated Please use the `Asset` member of a storage instance instead.
     * @return {Asset} - the `Asset` class constructor.
     * @constructor
     */
    static get Asset () {
        return _Asset;
    }

    /**
     * @deprecated Please use the `AssetType` member of a storage instance instead.
     * @return {AssetType} - the list of supported asset types.
     * @constructor
     */
    static get AssetType () {
        return _AssetType;
    }

    /**
     * Synchronously fetch a cached asset from built-in storage. Assets are cached when they are loaded.
     * @param {string} assetId - The id of the asset to fetch.
     * @returns {?Asset} The asset, if it exists.
     */
    get (assetId) {
        return this.builtinHelper.get(assetId);
    }

    /**
     * Cache an asset for future lookups by ID.
     * @param {AssetType} assetType - The type of the asset to cache.
     * @param {DataFormat} dataFormat - The dataFormat of the data for the cached asset.
     * @param {Buffer} data - The data for the cached asset.
     * @param {string} id - The id for the cached asset.
     * @returns {string} The calculated id of the cached asset, or the supplied id if the asset is mutable.
     */
    cache (assetType, dataFormat, data, id) {
        return this.builtinHelper.cache(assetType, dataFormat, data, id);
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
     * @param {DataFormat} [dataFormat] - Optional: load this format instead of the AssetType's default.
     * @return {Promise.<Asset>} A promise for the requested Asset.
     *   If the promise is fulfilled with non-null, the value is the requested asset or a fallback.
     *   If the promise is fulfilled with null, the desired asset could not be found with the current asset sources.
     *   If the promise is rejected, there was an error on at least one asset source. HTTP 404 does not count as an
     *   error here, but (for example) HTTP 403 does.
     */
    load (assetType, assetId, dataFormat) {
        /** @type {Helper[]} */
        const helpers = [this.builtinHelper, this.localHelper, this.webHelper];
        const errors = [];
        let helperIndex = 0;
        dataFormat = dataFormat || assetType.runtimeFormat;

        return new Promise((fulfill, reject) => {
            const tryNextHelper = () => {
                if (helperIndex < helpers.length) {
                    const helper = helpers[helperIndex++];
                    helper.load(assetType, assetId, dataFormat)
                        .then(
                            asset => {
                                if (asset === null) {
                                    tryNextHelper();
                                } else {
                                    // TODO? this.localHelper.cache(assetType, assetId, asset);
                                    if (helper !== this.builtinHelper && assetType.immutable) {
                                        asset.assetId = this.builtinHelper.cache(
                                            assetType,
                                            asset.dataFormat,
                                            asset.data,
                                            assetId
                                        );
                                    }
                                    // Note that other attempts may have caused errors, effectively suppressed here.
                                    fulfill(asset);
                                }
                            },
                            error => {
                                errors.push(error);
                                // TODO: maybe some types of error should prevent trying the next helper?
                                tryNextHelper();
                            }
                        );
                } else if (errors.length === 0) {
                    // Nothing went wrong but we couldn't find the asset.
                    fulfill(null);
                } else {
                    // At least one thing went wrong and also we couldn't find the asset.
                    reject(errors);
                }
            };

            tryNextHelper();
        });
    }
}

module.exports = ScratchStorage;
