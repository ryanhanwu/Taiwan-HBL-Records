var request = require('request'),
    flow = require('flow'),
    path = require('path'),
    http = require('http'),
    Buffer = require('buffer').Buffer,
    fs = require('fs'),
    Iconv = require('iconv').Iconv,
    urls = [];

var names = fs.readdirSync(path.resolve(__dirname, '..', 'p2'));

fs.writeFile(path.resolve(__dirname, '..', 'db', 'html.json'), JSON.stringify(names), function(err) {
    if(err) {
        console.log(err);
    }
});

function getScrapAll() {
    for(var i = 0; i < 2181; i++) {
        for(var j = 88; j < 101; j++) {
            var requestPath = '/hbl/HBL_ScheduleRecord.asp?themainyear=' + j + '&themaingender=%A8k&themainEventID=' + i;
            urls.push({
                url: 'apps.shssf.edu.tw',
                id: i,
                year: j,
                path: requestPath
            });
        }
    }
}
var iconv = new Iconv('Big5', 'UTF8');
for(var i = names.length; i--;) {
    var htmlName = names[i];
    if(htmlName.indexOf('html') !== -1) {
        var fn = htmlName.split('.')[0];
        var fns = fn.split('-');
        urls.push({
            id: fns[1],
            year: fns[0],
            path: '/hbl/HBL_ScheduleRecord.asp?themainyear=' + fns[0] + '&themaingender=%A8k&themainEventID=' + fns[1]
        });
    }
}
flow.serialForEach(urls, function(urlObj) {
    var that = this,
        opts = {
            hostname: 'apps.shssf.edu.tw',
            path: '/hbl/HBL_ScheduleRecord.asp?themainyear=' + urlObj.year + '&themaingender=%A8k&themainEventID=' + urlObj.id,
            method: 'GET'
        };
        
    var req = http.request(opts, function(res) {
        var bodyData = '';
        console.dir(opts);
        res.on('data', function(data) {
            try {
                var buffer = iconv.convert(data);
                bodyData += buffer.toString('utf-8');
            } catch (e) {
                console.dir(e);
            }
            
        });
        res.on('end', function() {
            fs.writeFile(path.resolve(__dirname, '..', 'pages_new', urlObj.year + '-' + urlObj.id + '.html'), bodyData, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    that();
                }
            });
        });
    });
    req.end();
});