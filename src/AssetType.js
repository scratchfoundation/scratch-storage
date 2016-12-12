const DataFormat = require('./DataFormat');

/**
 * Enumeration of the supported asset types.
 * @type {Object.<String,AssetType>}
 * @typedef {Object} AssetType - Information about a supported asset type.
 * @property {string} name - The human-readable name of this asset type.
 * @property {DataFormat} runtimeFormat - The format used for runtime, in-memory storage of this asset. For example, a
 *     project stored in SB2 format on disk will be returned as JSON when loaded into memory.
 */
const AssetType = {
    ImageBitmap: {
        name: 'ImageBitmap',
        runtimeFormat: DataFormat.PNG
    },
    ImageVector: {
        name: 'ImageVector',
        runtimeFormat: DataFormat.SVG
    },
    Project: {
        name: 'Project',
        runtimeFormat: DataFormat.JSON
    },
    Sound: {
        name: 'Sound',
        runtimeFormat: DataFormat.WAV
    },
    Sprite: {
        name: 'Sprite',
        runtimeFormat: DataFormat.JSON
    }
};

module.exports = AssetType;
