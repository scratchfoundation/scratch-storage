const webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        'scratch-storage': './src/index-web.js',
        'scratch-storage.min': './src/index-web.js'
    },
    module: {
        rules: [
            {
                test: /[\\/]+scratch-[^\\/]+[\\/]+src[\\/]+.+\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }
        ]
    },
    output: {
        path: __dirname,
        filename: 'dist/web/[name].js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            sourceMap: true
        })
    ]
};
