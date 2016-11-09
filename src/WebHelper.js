const Asset = require('./Asset');
const Helper = require('./Helper');
const xhr = require('xhr');

/**
 * @typedef {function} UrlFunction - A function which computes a URL from asset information.
 * @param {Asset} - The asset for which the URL should be computed.
 */

class WebHelper extends Helper {
    constructor (parent) {
        super(parent);

        /**
         * @type {Array.<SourceRecord>}
         * @typedef {object} SourceRecord
         * @property {Array.<AssetType>} types - The types of asset provided by this source.
         * @property {UrlFunction} urlFunction - A function which computes a URL from an Asset.
         */
        this.sources = [];
    }

    /**
     * Register a web-based source for assets. Sources will be checked in order of registration.
     * @param {Array.<AssetType>} types - The types of asset provided by this source.
     * @param {UrlFunction} urlFunction - A function which computes a URL from an Asset.
     */
    addSource (types, urlFunction) {
        this.sources.push({
            types: types.slice(),
            urlFunction: urlFunction
        });
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType, assetId) {

        /** @type {Array.<{url:string, result:*}>} List of URLs attempted & errors encountered. */
        const errors = [];
        const sources = this.sources.slice();
        const asset = new Asset(assetType, assetId);
        let sourceIndex = 0;

        return new Promise((fulfill, reject) => {

            const tryNextSource = () => {

                /** @type {UrlFunction} */
                let urlFunction;

                for (; sourceIndex < sources.length; ++sourceIndex) {
                    const source = sources[sourceIndex];
                    if (source.types.indexOf(assetType) >= 0) {
                        urlFunction = source.urlFunction;
                        break;
                    }
                }

                if (urlFunction) {
                    const url = urlFunction(asset);
                    xhr({
                        uri: url
                    }, (error, response, body) => {
                        if (error) {
                            errors.push({url: url, result: error});
                            tryNextSource();
                        } else if (response.status < 200 || response.status >= 300) {
                            errors.push({url: url, result: response});
                            tryNextSource();
                        } else {
                            asset.data = body;
                            fulfill(asset);
                        }
                    });
                } else if (errors.length > 0) {
                    reject(errors);
                } else {
                    reject(new Error('No sources matching asset'));
                }
            };

            tryNextSource();
        });
    }
}

module.exports = WebHelper;
