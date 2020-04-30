const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.ts',
        'index.min': './src/index.ts',
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'bundles/[name].js',
        libraryTarget: 'umd',
        library: 'webgl-game-engine',
        umdNamedDefine: true,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendor.min',
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                include: /\.min\.js$/,
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            { test: /\.js$/, exclude: /node_modules/ },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            root: __dirname,
            src: path.resolve(__dirname, 'src'),
        },
    },
    plugins: [],
    devServer: {
        contentBase: './dist',
    },
};
