const jsdom = require('jsdom');
const test = require('tap').test;

const virtualConsole = jsdom.createVirtualConsole();
virtualConsole.on('jsdomError', error => {
    throw error;
});

/**
 * Run `tests` in a jsdom environment built with the provided options.
 * Note that any "done" callback in your options will be replaced by a call to `tests`.
 * @param {function} tests - the tests to run in the jsdom environment. This will be called with one "window" argument.
 * @param {object} options - the jsdom options; see `jsdom.env` documentation.
 * @example
 *   jsdomTest(
 *     (window) => {
 *       test('test1', t => { window.foo.doStuff(); t.end(); });
 *       test('test2', t => { window.foo.doOther(); t.end(); });
 *     },
 *     '<html><body>Web page for tests</body></html>',
 *     [require.resolve('path/to/script/under/test')]
 *   );
 */
const jsdomTest = function (tests, ...options) {
    test('jsdomTest', () => new Promise((resolve, reject) => {
        // The 0 is here to suppress "optimization" in jsdom's getConfigFromArguments.
        // It can be anything that isn't a string, function, or object.
        options.unshift(0, {virtualConsole});
        options.push((err, window) => {
            if (err) {
                reject(err);
            } else {
                tests(window);
                resolve();
            }
        });
        jsdom.env.apply(null, options);
    }));
};

module.exports = jsdomTest;
