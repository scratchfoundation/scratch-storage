class Asset {
    /**
     * Construct an Asset.
     * @param {AssetType} assetType - The type of this asset (sound, image, etc.)
     * @param {string} assetId - The ID of this asset.
     * @param {DataFormat} [dataFormat] - The format of the data (WAV, PNG, etc.); required iff `data` is present.
     * @param {Buffer} [data] - The in-memory data for this asset; optional.
     */
    constructor (assetType, assetId, dataFormat, data) {
        this.assetType = assetType;
        this.assetId = assetId;
        if (data && !dataFormat) {
            throw new Error('Data provided without specifying its format');
        }
        this.dataFormat = dataFormat;
        this.data = data || new Buffer();
        this.dependencies = [];
    }
}

module.exports = Asset;
