var favoriteTrams = [150, 376, 591, 777, 807, 980, 991];

var socket = io.connect(location.origin.replace(/^http/, 'ws'));
var map;

function initMap() {
    var markers = [];
    var nmarkers = [];
    var routesPaths = {};
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.833333, lng: 60.583333},
        zoom: 13
    });

    var myOptions = {
      disableAutoPan: false,
      maxWidth: 0,
      pixelOffset: new google.maps.Size(-75, 5),
      zIndex: null,

      boxStyle: {
         opacity: 0.75,
         width: "120px"
      },
      closeBoxURL: "",
      infoBoxClearance: new google.maps.Size(1, 1),
      isHidden: false,
      pane: "floatPane",
      enableEventPropagation: false
    };
    var ib = new InfoBox(myOptions);

    socket.on('route', function(data) {
      markers.forEach(function (routeMarkers) { if (routeMarkers) routeMarkers.forEach(function (marker) { marker.setMap(null); marker = null; }); });
      markers = data.map(function (route) {
        if (!route)
          return null
        return route.map(function (tram) {
          return new google.maps.Marker({
            position: new google.maps.LatLng(tram.latitude/600000.0, tram.longitude/600000.0),
            title: 'Route #' + tram.route + ' tram #' + tram.vehicle,
            map: map
          });
        });
      });
    });

    socket.on('number', function(data) {
      nmarkers.forEach(function (marker) { if (marker) marker.setMap(null); marker = null; });
      nmarkers = data.map(function (tram) {
        if (!tram)
          return null;

        var m = new google.maps.Marker({
          position: new google.maps.LatLng(tram.latitude/600000, tram.longitude/600000),
          title: 'Tram #' + tram.vehicle,
          map: map
        });

        if (!routesPaths[tram.route])
          socket.emit('routeCoordinates', tram.route);

        var boxText = document.createElement("div");
        boxText.style.cssText = "border: 1px solid black; -moz-border-radius:10px; border-radius: 10px; margin-top: 8px; background: white; padding: 5px;";
        boxText.innerHTML = "Маршрут "+tram.route+"<BR>Гос.№ "+tram.vehicle;
        m._infobox = boxText;
        google.maps.event.addListener(m, 'mouseover', function () {
          ib.setContent(this._infobox);
          ib.open(map, this);
        });
        google.maps.event.addListener(m, 'mouseout', function () {
          ib.close();
        });
        return m;
      });
    });

    socket.on('routeCoordinates', function (routePath) {
      if (routesPaths[routePath.number])
        return;

      Math.seedrandom(routePath.number)
      var r = Math.floor(Math.random() * 256).toString(16)
      var g = Math.floor(Math.random() * 256).toString(16)
      var b = Math.floor(Math.random() * 256).toString(16)
      if (r.length == 1) r = '0' + r;
      if (g.length == 1) g = '0' + g;
      if (b.length == 1) b = '0' + b;
      routesPaths[routePath.number] = new google.maps.Polyline({
        path: routePath.path.map(function (point) { return new google.maps.LatLng(point.latitude, point.longitude)}),
        strokeColor: '#'+r+g+b,
        strokeOpacity: 0.8,
        strokeWeight: 4
      });
      routesPaths[routePath.number].setMap(map);
    });

    favoriteTrams.forEach(function(tram) {
      socket.emit('startNumber', tram);
    });
    socket.on('error', console.log.bind(console));
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
