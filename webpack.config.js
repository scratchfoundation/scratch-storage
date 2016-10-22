const path = require('path');
const webpack = require('webpack');

const base = {
    module: {
        loaders: [
            {
                include: [
                    path.resolve(__dirname, 'src')
                ],
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
};

module.exports = [
    // Web-compatible
    Object.assign({}, base, {
        entry: {
            'scratch-storage': './src/index-web.js',
            'scratch-storage.min': './src/index-web.js'
        },
        output: {
            path: __dirname,
            filename: 'dist/web/[name].js'
        }
    }),

    // Webpack-compatible
    Object.assign({}, base, {
        entry: {
            'scratch-storage': './src/index.js'
        },
        output: {
            library: 'ScratchStorage',
            libraryTarget: 'commonjs2',
            path: __dirname,
            filename: 'dist/node/[name].js'
        }
    })
];
