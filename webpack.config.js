const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
        publicPath: "/dist/"
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                use: "awesome-typescript-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(css|less)?$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader?modules&localIdentName=[local]--[hash:base64:5]"
                }, {
                    loader: "less-loader"
                }]
            },
        ]
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".less"]
    }
};