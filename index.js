require('chromedriver');
var webdriver = require('selenium-webdriver'),
    http = require('http'),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    eventproxy = require('eventproxy'),
    async = require('async'),
    url = require('url');

var By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

driver.get('http://www.google.com');
driver.findElement(By.name('q')).sendKeys('Azure OR Cloud OR 云 site:cnblogs.com');
driver.findElement(By.name('btnK')).click();
// driver.wait(until.titleIs('webdriver - Google Search'), 1000);
// driver.quit();

var ep = new eventproxy(),
    pageUrls = [],
    urlArray = [],
    pageNum = 2;

for (var i = 0; i < pageNum; i++) {
    pageUrls.push('https://www.google.com.sg/search?q=Azure+OR+Cloud+OR+%E4%BA%91+site:cnblogs.com&ei=E6o4WtnFK8fJ0ATnlgs&start=' + i * 10 + '&sa=N&biw=1920&bih=949');
}

function getUrl(_url) {
    let newUrl = url.parse(_url);
    let hostname = "http://www.google.com";
    if (newUrl.hostname == null) {
        newUrl = hostname + _url;
    }
    return newUrl;
}

function start() {
    function onRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });

        pageUrls.forEach(function(pageUrl) {
            superagent.get(pageUrl).end(function(err, pres) {
                var $ = cheerio.load(pres.text);
                $('.g .r').each(function() {
                    var eachUrl = $(this).find('a').attr('href'); // var eachUrl = driver.findElements(By.xpath("//*[@class='g']/div/div/h3/a"));
                    let _url = getUrl(eachUrl);
                    // console.log('eachUrl:' + _url + '<br/>');
                    res.write('__eachUrl:' + _url + '<br/>')
                    let eachArt = $(this).find('a').html();
                    res.write('__eachArt:' + eachArt + '<br/>')
                    urlArray.push(_url);
                    ep.emit('eachUrls', _url);
                })
            })
        });

        ep.after('eachUrls', pageUrls.length * 10, function(articleUrls) {
            var reptileMove = function(url, callback) {
                var delay = parseInt((Math.random() * 300000000) % 1000, 10);
                superagent.get(url).end(function(err, sres) {
                    var $ = cheerio.load(sres.text);
                    var headerTitle = $('#Header1_HeaderTitle').html();
                    res.write('__headerTitle:' + headerTitle + '<br/>')
                })
                setTimeout(function() {
                    callback(null, url)
                }, delay)
            }
            async.mapLimit(articleUrls, 5, function(url, callback) {
                reptileMove(url, callback)
            }, function(err, result) {
                res.write("__result:" + result + '<br/>')
            })
        });

    }
    http.createServer(onRequest).listen(3200, "127.0.0.1")
}
start();
var test = new webdriver.Builder()
    .forBrowser('chrome')
    .build();
test.get('http://127.0.0.1:3200');