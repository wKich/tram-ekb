import eduekb from './edu-ekb'
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
  let routesCollection
  let dataCollection
  let tramsByNumber = {}
  let tramsByRoute = {}

  console.log(` -> Connecting to mongoDB`)
  MongoClient.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`)
    .then(async function (db) {
      routesCollection = db.collection('routes')
      dataCollection = db.collection('data')

      await eduekb.getCookie()
      await _updateRoutesCoordinates()
  })
    .catch((err) => console.log(` -> Failed to connect to mongoDB: ${err.message}`))

  async function _updateRoutesCoordinates () {
    console.log(` -> Updating routes coordinates`)
    let routesCoordinates = (
      await Promise.all(
        routes.map(eduekb.getCoordinates)
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

  let getTramsByRoutes = (routeNumbers) => routeNumbers.map((route) => tramsByRoute[route])
  let getTramsByNumbers = (tramNumbers) => tramNumbers.map((number) => tramsByNumber[number])

  let getRouteCoordinates = (routeNumber) => {
    return new Promise((resolve, reject) => {
      if (routesCollection)
        routesCollection.find({ route: routeNumber }).limit(1).next().then(({coordinates}) => resolve(coordinates))
      else
        reject(new Error(`DB is unavailable`))
    })
  }

  setInterval(async function () {
    let trams = JSON.parse(await eduekb.getRoutes(routes))
      .map(({latitude, longitude, marshrut, vehicle}) => {
        let route = marshrut.slice(5)
        return {route, latitude, longitude, vehicle}
      })
    tramsByNumber = trams.reduce((p, v) => { p[v.vehicle] = v; return p; }, {})
    tramsByRoute = trams.reduce((p, v) => { if (!p[v.route]) p[v.route] = []; p[v.route].push(v); return p }, {})
  }, 5000)

  setInterval(_updateRoutesCoordinates, 1000*60*60*24)

  return {
    getTramsByRoutes,
    getTramsByNumbers,
    getRouteCoordinates
  }
}
