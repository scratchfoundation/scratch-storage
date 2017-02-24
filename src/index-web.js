/* eslint-env browser */
require('babel-polyfill');

/**
 * Scratch namespace.
 * @type {Object}
 */
self.Scratch = self.Scratch || {};

/**
 * Export for use on a web page.
 * @type {ScratchStorage}
 */
self.Scratch.Storage = require('./index');
