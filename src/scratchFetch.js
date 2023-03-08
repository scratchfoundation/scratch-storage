const {fetch} = require('cross-fetch');

/**
 * Make a network request.
 * This will be a wrapper for the global fetch method, adding some Scratch-specific functionality.
 * @param {RequestInfo|URL} resource - the resource to fetch.
 * @param {RequestInit} [options] - optional object containing custom settings for this request.
 * @see {@link https://developer.mozilla.org/docs/Web/API/fetch} for more about the fetch API.
 * @returns {Promise<Response>} - a promise for the response to the request.
 */
const scratchFetch = (resource, options) => fetch(resource, options);

module.exports = {
    default: scratchFetch,
    scratchFetch
};
