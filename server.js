import Tram from './tram'
import express from 'express'
import { Server } from 'http'
import socket from 'socket.io'

const app = express()
const http = Server(app)
const io = socket(http)

const routesList = Array.from({length: 34}, (v, k) => k+1)
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
      if (number < 1 && number > 999)
        return socket.emit('error', 'Tram number sould be in range [1, 999]')

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

export default http
