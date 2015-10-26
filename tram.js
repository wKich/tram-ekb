import http from 'http'
import { MongoClient } from 'mongodb'

/*
 * Запписывать данные по ходу движения трамвая на маршруте
 * Коллекция с маршрутами (конечные точки, координаты остановок, координаты для отрисовки)
 * Коллекция со статистикой, где каждая запись это массив данных полученных в равные промежутки времени от одной коннечной точки маршрута до другой (кроме этого номер трамвая, маршрут)
 * Появился новый трамвай, записываем данные в специальный массив до тех пор пока трамвай не достигнет одной из коннечных точек маршрута
 * При старте трамвая из конечной точки, данные перемещаются в окончательную запись только после того как трамвай достиг другой конечной точки, если трамвай перестал фигурировать в данных до этого момента, то поместить в специальный массив
 */

//{
//  "marshrut":"tram_10",
//  "azimuth":20600,
//  "latitude":34116691,
//  "longitude":36329283,
//  "speed":"7",
//  "vehicle":"557"
//}
//
//routeNums 1..34

export default (routes) => {
    //get cookie
    const hostname = 'edu-ekb.ru'
    let routesCollection
    let dataCollection
    let trams = []
    let cookie
    let headers = {}

    console.log(` -> Connecting to mongoDB`)
    MongoClient.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`)
      .then(async function (db) {
        routesCollection = db.collection('routes')
        dataCollection = db.collection('data')

        console.log(' -> Check cookie')
        if (!cookie) {
            await _getCookie()
            console.log(' -> Cookie getted: %s', cookie)
        }
        try {
          await _updateRoutesCoordinates()
        } catch (err) { console.log(err.message) }
    })
      .catch((err) => console.log(` -> Failed to connect to mongoDB: ${err.message}`))

    async function _httpRequest ({
            path = '/',
            method = 'GET'
        }, callback)
    {
        let options = { hostname, path, method, headers }
        console.log(` -> Making ${method} request http://${hostname}${path}`)
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => callback(res, resolve))
            req.on('error', reject)
            req.write('')
            req.end()
        })
    }

    async function _getCookie () {
        console.log(' -> Getting cookie')
        //use find instead of index
        cookie = await _httpRequest({path: '/gmap/', method: 'HEAD'}, (res, callback) => callback(res.headers['set-cookie'][0].split(';', 1)[0]))
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Cookie': cookie,
            'Host': `www.${hostname}`,
            'Referer': `http://www.${hostname}/gmap/`
        }
    }

    async function _getRoute (routeNums) {
        console.log(' -> Check cookie')
        if (!cookie) {
            await _getCookie()
            console.log(' -> Cookie getted: %s', cookie)
        }

        console.log(' -> Getting route')
        return _httpRequest({ path: `/gmap/resources/entities.vgeopoint/mar/,tram_${routeNums.join(',tram_')},`},
          (res, callback) => {
            let body = ''
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                body += chunk
            })
            res.on('end', () => callback(body))
        })
    }

    async function _getCoordinates (routeNum) {
      console.log(' -> Check cookie')
      if (!cookie) {
        await _getCookie()
        console.log(' -> Cookie getted: %s', cookie)
      }

      console.log(' -> Getting route')
      return _httpRequest({ path: `/gmap/resources/entities.marshlatlong/names/${routeNum}/tram`},
        (res, callback) => {
          let body = ''
          res.setEncoding('utf8')
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', () => callback(body))
      })
    }

    async function _updateRoutesCoordinates () {
      console.log(` -> Updating routes coordinates`)
      let routesCoordinates = (
        await Promise.all(
          routes.map(_getCoordinates)
        ))
        .map(JSON.parse)
        .reduce((p, v, i) => {
          p[i + 1] = v
          return p
        }, {})
      let dbRoutes = (await routesCollection.find({}).toArray()).reduce((p, v) => { p[v.route] = v.coordinates; return p; }, {})
      for (let route in routesCoordinates) {
        console.log(` -> Compare route coordinates for route ${route}`)
        if (!dbRoutes[route] ||
            !dbRoutes[route].every((coordinate, index) => {
              let flag = true
              for (let key in coordinate) {
                if (routesCoordinates[route][key] != coordinate[key])
                  flag = false
              }
              return flag
            }))
          await routesCollection.updateOne({ route }, { $set: { coordinates: routesCoordinates[route] } }, { upsert: true })
      }
    }

    let getTramsByRoutes = (routeNumbers) => {
        let resultTrams = []
        routeNumbers.forEach((route) => {
            let index = routes.indexOf(route)
            if (index != -1) {
                resultTrams.push(trams[index])
            }
        })
        return resultTrams
    }

    let getTramsByNumbers = (tramNumbers) => {
      let resultTrams = []
      tramNumbers.forEach((number) => {
        let tram
        trams.forEach((route) => {
          route.forEach((t) => { if (t.vehicle == number) tram = t })
        })
        if (tram)
          resultTrams.push(tram)
      })
      return resultTrams
    }

    let getRouteCoordinates = (routeNumber) => {
      return new Promise((resolve, reject) => {
        if (routesCollection)
          routesCollection.find({ route: routeNumber }).limit(1).next().then(({coordinates}) => resolve(coordinates))
        else
          reject(new Error(`DB is unavailable`))
      })
    }

    setInterval(async function () {
      trams = JSON.parse(await _getRoute(routes))
        .map(({latitude, longitude, marshrut, vehicle}) => {
          let number = marshrut.slice(5)
          console.log(` -> Route #${number} with tram #${vehicle} getted`)
          return {number, latitude, longitude, vehicle}
        })
        .reduce((p, v) => { p[v.number-1].push(v); return p; }, Array.from(routes, () => []))
    }, 10000)

    setInterval(_updateRoutesCoordinates, 1000*60*60*24)

    return {
        getTramsByRoutes,
        getTramsByNumbers,
        getRouteCoordinates
    }
}
