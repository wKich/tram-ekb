var favoriteTrams = [150, 376, 591, 777, 807];

var socket = io('http://localhost:3000');
var map;

function initMap() {
    var markers = [];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.833333, lng: 60.583333},
        zoom: 13
    });

    socket.on('route', function(data) {
        //console.log(data);
        markers.forEach(function (routeMarkers) { routeMarkers.forEach(function (marker) { marker.setMap(null); marker = null; }); });
        markers = data.map(function (route) {
            return route.map(function (tram) {
                //if (favoriteTrams.indexOf(tram.vehicle) != -1)
                    return new google.maps.Marker({
                        position: new google.maps.LatLng(tram.latitude/600000.0, tram.longitude/600000.0),
                        title: 'Route #' + tram.number + ' tram #' + tram.vehicle,
                        map: map
                    });
            });
        });
    });
}

//setTimeout(function () {
    //var req = new XMLHttpRequest();
    //req.open('GET', 'http://edu-ekb.ru/gmap/resources/entities.vgeopoint/mar/,tram_15,');
    //req.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    //req.setRequestHeader('Cookie', 'JSESSIONID=f1411664d4d1e116fbfeeae2cf32; EDUEKB=563722F6A');
    //req.setRequestHeader('Host', 'www.edu-ekb.ru');
    //req.setRequestHeader('Referer', 'http://www.edu-ekb.ru/gmap/');
    //req.onreadystatechange = function () {
    //    if (req.readyState === 4)
    //        console.log(req.response);
    //}
    //req.send();
    //get ajaxs tram
    //parse
    //print
//}, 5000);