var fs = require('fs');

module.exports = {
    entry: './index.js',
    target: 'node',
    module: {
        loaders: [
            {
                test: /.js$/,
                loader: 'babel',
                query: {
                    whitelist: [
                        'es6.destructuring',
                        'asyncToGenerator',
                        'strict'
                    ]
                }
            }
        ]
    },
    output: {
        libraryTarget: 'commonjs2',
        path: __dirname,
        filename: 'bundle.js'
    },
    externals: fs.readdirSync('node_modules').filter(function(x) { return x !== '.bin'; })
}