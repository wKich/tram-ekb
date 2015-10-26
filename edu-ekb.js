import { request } from 'http'

let hostname = 'edu-ekb.ru'
let headers

async function httpRequest ({
    path = '/',
    method = 'GET'
  })
{
  let options = { hostname, path, method, headers }
  console.log(` -> Making ${method} request http://${hostname}${path}`)
  return new Promise((resolve, reject) => {
    let req = request(options, (res) => {
      let headers = res.headers
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => resolve({headers, body}))
    })
    req.on('error', reject)
    req.write('')
    req.end()
  })
}

async function getCookie () {
  console.log(' -> Getting cookie')
  //use find instead of index
  let cookie = (await httpRequest({path: '/gmap/', method: 'HEAD'})).headers['set-cookie'][0].split(';', 1)[0]
  headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Cookie': cookie,
    'Host': `www.${hostname}`,
    'Referer': `http://www.${hostname}/gmap/`
  }
}

async function getRoutes (routeNums) {
  console.log(' -> Getting trams')
  return (await httpRequest({ path: `/gmap/resources/entities.vgeopoint/mar/,tram_${routeNums.join(',tram_')},` })).body
}

async function getCoordinates (routeNum) {
  console.log(' -> Getting route path')
  return (await httpRequest({ path: `/gmap/resources/entities.marshlatlong/names/${routeNum}/tram` })).body
}

export default {
  hostname,
  headers,

  httpRequest,
  getCookie,
  getRoutes,
  getCoordinates
}
