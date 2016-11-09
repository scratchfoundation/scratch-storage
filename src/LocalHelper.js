const Helper = require('./Helper');

/**
 * Implements storage on the local device, available even when the device has no network connection.
 * TODO: use one or more of the following APIs for the web, and files under `app.getPath('userData')` for Node.
 *       Maybe there's an existing Node module that would do that for us...?
 * Web storage APIs include:
 * - Local file system API:
 *     https://dev.w3.org/2009/dap/file-system/file-dir-sys.html
 *     https://developer.mozilla.org/en-US/docs/Web/API/LocalFileSystem
 * - IndexedDB:
 *     https://www.w3.org/TR/IndexedDB/
 *     https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * - Web SQL Database:
 *     https://www.w3.org/TR/webdatabase/
 * - Local Web Storage:
 *     https://www.w3.org/TR/webstorage/
 *     https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 */
class LocalHelper extends Helper {

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType, assetId) { // eslint-disable-line no-unused-vars
        return Promise.reject(new Error('LocalHelper not yet implemented'));
    }
}

module.exports = LocalHelper;
