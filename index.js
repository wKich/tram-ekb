require('babel-core/register')
var http = require('./server.js')
http.listen(process.env.PORT || 5000)
