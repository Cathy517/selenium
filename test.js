var http = require('http');
var data = "";
var req = http.request(url, function(res) {
    res.setEncoding('utf-8');
    res.on('data', function(chunk) {
        data += chunk
    });
    res.on('end', function() {
        console.log(data);
    })
})
req.end();