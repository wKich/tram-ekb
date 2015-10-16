var favoriteTrams = [150, 376, 591, 777, 807, 980, 991];

var socket = io.connect('ws://' + window.location.host);
var map;

function initMap() {
    var markers = [];
    var nmarkers = [];
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

    socket.on('number', function(data) {
      nmarkers.forEach(function (marker) { marker.setMap(null); marker = null; });
      nmarkers = data.map(function (tram) {
        var m = new google.maps.Marker({
          position: new google.maps.LatLng(tram.latitude/600000, tram.longitude/600000),
          title: 'Tram #' + tram.vehicle,
          map: map
        });

        var boxText = document.createElement("div");
        boxText.style.cssText = "border: 1px solid black; -moz-border-radius:10px; border-radius: 10px; margin-top: 8px; background: white; padding: 5px;";
        boxText.innerHTML = "Маршрут "+tram.number+"<BR>Гос.№ "+tram.vehicle;
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
