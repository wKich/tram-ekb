let http = require('http')

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
    let cookie

    async function _httpRequest ({
            path = '/',
            method = 'GET',
            headers = {}
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

    function _getCookie () {
        console.log(' -> Getting cookie')
        //use find instead of index
        return _httpRequest({path: '/gmap/', method: 'HEAD'}, (res, callback) => callback(res.headers['set-cookie'][0].split(';', 1)[0]))
    }

    async function _getRoute (routeNum) {
        console.log(' -> Check cookie')
        if (!cookie) {
            cookie = await _getCookie()
            console.log(' -> Cookie getted: %s', cookie)
        }

        console.log(' -> Getting route')
        return _httpRequest({
            path: `/gmap/resources/entities.vgeopoint/mar/,tram_${routeNum},`,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Cookie': cookie,
                'Host': `www.${hostname}`,
                'Referer': `http://www.${hostname}/gmap/`
            }
        }, (res, callback) => {
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
          route.forEach((t) => { if (t.number == number) tram = t })
        })
        if (tram)
          resultTrams.push(tram)
      })
      return resultTrams
    }

    setInterval(async function () {
        trams = await Promise.all(routes.map(async function (number) {
            console.log(` -> Start getting route #${number}`)
            return JSON.parse((await _getRoute(number)))
                            .map(({latitude, longitude, vehicle}) => {
                                console.log(` -> Route #${number} with tram #${vehicle} getted`)
                                return {number, latitude, longitude, vehicle}
                            })
        }))
    }, 10000)

    return {
        getTramsByRoutes,
        getTramsByNumbers
    }
}
