//python -m aktools  akshare AKTools http://127.0.0.1:8080/api/public/stock_zh_a_hist?symbol=000001&period=daily&start_date=%2020211109&end_date=%2020211209&adjust=h
// 000905
const http = require('http')
const fs = require('fs')
const path = require('path')

let taskApi = async (name, apiUrl, dataFormat) => {
    const promise1 = new Promise((resolve, reject) => {
        const req2 = http.request(apiUrl, function (res) {
            res.setEncoding('utf-8')
            let allchunk = ""
            res.on('data', function (chunk) {
                allchunk += chunk
            });
            res.on("end", () => {
                resdata = dataFormat == "json" ? JSON.parse(allchunk) : allchunk
                resolve({ name: name, resdata: resdata })
            })
        });
        req2.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        req2.end();
    })
    return promise1
}