let Tram = require('./tram')
let express = require('express')
let app = express()
var http = require('http').Server(app)
let io = require('socket.io')(http)
http.listen(process.env.PORT || 5000)

let routesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
let tram = Tram(routesList)

io.on('connection', (socket) => {
    let routes = []
    let trams = []
    socket.on('startRoute', async function (number) {
        if (number < 1 && number > 34)
            return socket.emit('error', 'Route number out of range [1, 34]')

        if (routes.indexOf(number) != -1)
            return socket.emit('error', 'Route is already listening')

        routes.push(number)
    })
    socket.on('stopRoute', async function (number) {
        let index = routes.indexOf(number)
        if (index == -1)
            return socket.emit('error', 'Don\'t have that route number')

        routes.splice(index, 1)
    })

    socket.on('startNumber', async function (number) {
      if (number < 100 && number > 999)
        return socket.emit('error', 'Tram number sould be in range [100, 999]')

      if (trams.indexOf(number) != -1)
        return socket.emit('error', 'Tram is already listening')

      trams.push(number)
    })

    socket.on('stopNumber', async function (number) {
      let index = trams.indexOf(number)
      if (index == -1)
        return socket.emit('error', 'Don\'t have that tram number')

      trams.splice(index, 1)
    })

    socket.on('routeCoordinates', async function (number) {
      if (number < 1 && number > 34)
        return socket.emit('error', 'Route number out of range [1, 34]')

      socket.emit('routeCoordinates', {number, path: await tram.getRouteCoordinates(number)})
    })

    setInterval(() => {
        socket.emit('route', tram.getTramsByRoutes(routes))
        socket.emit('number', tram.getTramsByNumbers(trams))
    }, 5000)
})

app.use(express.static('public'))

//app.listen(process.env.PORT || 5000)
