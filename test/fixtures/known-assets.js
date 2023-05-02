const fs = require('fs');
const path = require('path');

const md5 = require('js-md5');

const projects = [
    '117504922'
];
const assets = [
    '66895930177178ea01d9e610917f8acf.png',
    '6e8bd9ae68fdb02b7e1e3df656a75635.svg',
    '7e24c99c1b853e52f8e7f9004416fa34.png',
    '83c36d806dc92327b9e7049a565c6bff.wav',
    'f88bf1935daea28f8ca098462a31dbb0.svg',
    'fe5e3566965f9de793beeffce377d054.jpg'
];

const loadSomething = filename => {
    const fullPath = path.join(__dirname, 'assets', filename);
    const content = fs.readFileSync(fullPath);

    return {
        content,
        hash: md5(content)
    };
};

const loadProject = id => {
    const filename = `${id}.json`;
    const result = loadSomething(filename);

    // throw if not a valid JSON string
    JSON.parse(result.content.toString());

    return result;
};

const loadAsset = filename => {
    const result = loadSomething(filename);

    const expectedHash = filename.split('.', 1)[0];
    if (expectedHash !== result.hash) {
        throw new Error(`Asset has wrong hash: ${filename}`);
    }

    return result;
};

const knownAssets = Object.assign({},
    projects.reduce((bag, id) => {
        bag[id] = loadProject(id);
        return bag;
    }, {}),
    assets.reduce((bag, filename) => {
        bag[filename] = loadAsset(filename);
        return bag;
    }, {})
);

module.exports = knownAssets;
