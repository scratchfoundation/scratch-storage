const AssetType = require('./AssetType');
const DataFormat = require('./DataFormat');

class DependencyParser {
    /**
     * Parse an asset for dependencies.
     * @param {Asset} asset - The asset to parse.
     * @return {Asset[]} - The list of dependencies. These may or may not contain their data.
     */
    static getDependencies (asset) {
        switch (asset.assetType) {
        case AssetType.Project:
            return DependencyParser.getProjectDependencies(asset);
        case AssetType.Sprite:
            return DependencyParser.getSpriteDependencies(asset);
        default:
            return asset.dependencies;
        }
    }

    /**
     * Parse a project asset for dependencies.
     * @param {Asset} projectAsset - The project asset to parse.
     * @return {Asset[]} - The list of dependencies. These may or may not contain their data.
     */
    static getProjectDependencies (projectAsset) {
        switch (projectAsset.dataFormat) {
        case DataFormat.SB2:
            // TODO: unzip to retrieve JSON, then build dependency assets WITH data.
            return projectAsset.dependencies;
        case DataFormat.JSON:
            // TODO: parse JSON for sprites, etc. WITHOUT data.
            return projectAsset.dependencies;
        }
        return projectAsset.dependencies;
    }

    /**
     * Parse a sprite asset for dependencies.
     * @param {Asset} spriteAsset - The sprite asset to parse.
     * @return {Asset[]} - The list of dependencies. These may or may not contain their data.
     */
    static getSpriteDependencies (spriteAsset) {
        // TODO: parse JSON, return list of sounds & costumes
        return spriteAsset.dependencies;
    }
}

module.exports = DependencyParser;
