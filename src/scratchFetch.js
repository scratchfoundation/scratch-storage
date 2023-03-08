const {fetch, Headers} = require('cross-fetch');

/**
 * Metadata header names
 * @enum {string}
 * @readonly
 */
const RequestMetadata = {
    /** The ID of the project associated with this request */
    ProjectId: 'X-ProjectId',
    /** The ID of the project run associated with this request */
    RunId: 'X-RunId'
};

/**
 * Metadata for requests
 * @type {Map<string, string>}
 */
const metadata = new Map();

/**
 * Make a network request.
 * This will be a wrapper for the global fetch method, adding some Scratch-specific functionality.
 * @param {RequestInfo|URL} resource The resource to fetch.
 * @param {RequestInit} [options] Optional object containing custom settings for this request.
 * @see {@link https://developer.mozilla.org/docs/Web/API/fetch} for more about the fetch API.
 * @returns {Promise<Response>} A promise for the response to the request.
 */
const scratchFetch = (resource, options) => {
    let augmentedOptions;
    if (metadata.size > 0) {
        augmentedOptions = Object.assign({}, options);
        augmentedOptions.headers = new Headers(Array.from(metadata));
        if (options?.headers) {
            const overrideHeaders =
                options.headers instanceof Headers ? options.headers : new Headers(options.headers);
            for (const [name, value] of overrideHeaders.entries()) {
                augmentedOptions.headers.set(name, value);
            }
        }
    } else {
        augmentedOptions = options;
    }
    return fetch(resource, augmentedOptions);
};

/**
 *
 * @param {RequestMetadata} name The name of the metadata item to set.
 * @param {any} value The value to set (will be converted to a string)
 */
const setMetadata = (name, value) => {
    metadata.set(name, value);
};

module.exports = {
    RequestMetadata,
    default: scratchFetch,
    scratchFetch,
    setMetadata
};
