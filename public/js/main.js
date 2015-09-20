//vehicle = [150, 376, 591, 777, 807];

var socket = io('http://localhost:3000');
socket.on('route', console.log.bind(console));

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
        google.maps.drawing.OverlayType.RECTANGLE
      ]
    },
    markerOptions: {icon: 'images/beachflag.png'},
    circleOptions: {
      fillColor: '#ffff00',
      fillOpacity: 1,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1
    }
  });
  drawingManager.setMap(map);
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