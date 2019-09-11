const path = require("path");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

module.exports = [{
    name: 'samples',
    mode: 'production',
    target: 'web',
    entry: {
        "pages": "./src/demo/samples/jsonConfig/pages.json",
    },
    module: {
        rules: [{
            test: /\.(json)$/,
            type: 'javascript/auto',
            use: [ 
                {
                    loader: 'file-loader',
                    options: { name: 'samples/xtml/[name]/[name].[ext]' }
                },
             "./dist/lib/webpack/loader.js"
            ]
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin({ extensions:['json'] })
    ],
}];