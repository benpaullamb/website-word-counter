const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
    entry: ['@babel/polyfill', './src/index.jsx'],
    output: {
        filename: 'bundle.js',
        path: `${__dirname}/public`
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: 'file-loader'
            }
        ]
    },
    mode: 'development',
    devServer: {
        contentBase: `${__dirname}/public`
    },
    plugins: [
        new MomentLocalesPlugin()
    ]
};