const superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    apiFunc = require('../common/apiFunc');

const website = 'http://www.kxdaili.com';
let url = website + '/dailiip/1/';

let getIp = async function() {
    let tasks = []; //promise存放的数组
    // 读取 ip.js 本身存储的ip
    let ips = await apiFunc.readFile('./aboutIp/ip.js');
    ips = JSON.parse(ips);

    for (let page = 1; page <= 10; page++) {
        let res = await superagent.get(url + page + '.html');
        let $ = cheerio.load(res.text);
        let tr = $('tbody>tr');

        for (let i = 0; i < tr.length; i++) {
            let td = $(tr[i]).children('td');
            let proxy = 'http://' + $(td[0]).text() + ':' + $(td[1]).text();
            let pro = apiFunc.filterIp(proxy);
            tasks.push(pro);
            console.log(tasks);
        }
    }

    Promise.all(tasks).then((arr) => {
        let usefulIp = arr.filter((item) => {
            return (item !== undefined)
        })
        ips = JSON.stringify(ips.concat(usefulIp));
        console.log(ips);
        apiFunc.writeFile('./aboutIp/ip.js', ips)
    })
}

getIp();

module.exports = getIp;