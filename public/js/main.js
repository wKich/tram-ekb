//vehicle = [150, 376, 591, 777, 807];

var socket = io('http://localhost:3000');
  socket.on('route', function (data) {
    console.log(data);
  });

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