let http = require('http')

module.exports = () => {
    //get cookie
    const hostname = 'edu-ekb.ru'
    let cookie;

    async function _getCookie () {
        let options = {
            hostname,
            path: '/gmap/',
            port: 80,
            method: 'HEAD'
        }
        console.log(' -> Getting cookie')
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                let c = res.headers['set-cookie'][0].split(';', 1)[0]
                console.log(' -> Cookie getted: %s', c)
                return resolve(c)
            })
            req.on('error', reject)
            req.write('')
            req.end()
        })
    }

    let getRoute = async function (routeNum) {
        console.log(' -> Check cookie')
        if (!cookie)
            cookie = await _getCookie()

        let options = {
            hostname,
            path: `/gmap/resources/entities.vgeopoint/mar/,tram_${routeNum},`,
            port: 80,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Cookie': cookie,
                'Host': `www.${hostname}`,
                'Referer': `http://www.${hostname}/gmap/`
            }
        }
        console.log(' -> Getting route')
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                let body = ''
                console.log(' -> Route getted')
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    body += chunk
                })
                res.on('end', () => resolve(body))
            })
            req.on('error', reject)
            req.write('')
            req.end()
        })
    }

    return {
        getRoute
    }
}