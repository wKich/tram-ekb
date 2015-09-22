let Tram = require('./tram')
let express = require('express')
let io = require('socket.io')(3000)
let app = express()

let routesList = [10, 15]
let tram = Tram(routesList)

io.on('connection', (socket) => {
    let routes = []
    socket.on('start', async function (number) {
        if (number < 1 && number > 34)
            socket.emit('error', 'Route number out of range [1, 34]')

        if (routes.indexOf(number) != -1)
            socket.emit('error', 'Route is already listening')

        routes.push(number)
    })
    socket.on('stop', async function (number) {
        let index = routes.indexOf(number)
        if (index == -1)
            socket.emit('error', 'Don\'t have that route number')

        routes.splice(index, 1)
    })

    setInterval(() => {
        socket.emit('route', tram.getTrams(routes))
    }, 5000)
})

app.use(express.static('public'))

app.listen(process.env.PORT || 5000)