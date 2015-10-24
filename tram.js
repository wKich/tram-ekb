let http = require('http')

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

module.exports = (routes) => {
    //get cookie
    const hostname = 'edu-ekb.ru'
    let trams = []
    let routesCoordinatesCache = {}
    let cookie
    let headers = {}

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
      let coordinates = routesCoordinatesCache[routeNumber]
      if (!coordinates)
        return new Promise((resolve, reject) => {
          _getCoordinates(routeNumber).then(JSON.parse).then((coordinates) => {
            routesCoordinatesCache[routeNumber] = coordinates
            resolve(coordinates)
          })
        })
      return coordinates
    }

    setInterval(async function () {
      trams = JSON.parse(await _getRoute(routes))
        .map(({latitude, longitude, marshrut, vehicle}) => {
          let number = marshrut.slice(5)
          console.log(` -> Route #${number} with tram #${vehicle} getted`)
          return {number, latitude, longitude, vehicle}
        })
        .reduce((p, v) => p[v.number].push(v), Array.from(routes, () => []))
      console.log(trams)
    }, 10000)

    return {
        getTramsByRoutes,
        getTramsByNumbers,
        getRouteCoordinates
    }
}
