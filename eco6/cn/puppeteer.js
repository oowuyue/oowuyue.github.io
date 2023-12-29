// const puppeteer = require('puppeteer-extra') ////防止被检测方式2：https://www.npmjs.com/package/puppeteer-extra
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

const puppeteer = require('puppeteer')

const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
    const folder = "./data/"
    let fileNameDelimiter = ","
    const browser = await puppeteer.launch({ headless: false, });

    function formatDate(site, date, period = "month") {

        var current_date = new Date();
        var current_y = current_date.getFullYear(),
            current_m = current_date.getMonth() + 1,
            current_d = current_date.getDate();
        if (current_m < 10)
            current_m = '0' + current_m;
        if (current_d < 10)
            current_d = '0' + current_d;


        if (site.includes("macromicro")) {
            if (date.substring(0, 7) == (current_y + '-' + current_m))
                return date.substring(0, 8) + (parseInt(current_d) - 1)
            else
                return date.substring(0, 8) + "28"
        }
        if (site.includes("woniu500")) {
            return date.slice(0, 4) + "-" + date.slice(4, 6) + '-28';
        }
        if (site.includes("legulegu")) {
            var date = new Date(date);
            var y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            if (m < 10)
                m = '0' + m;
            if (d < 10)
                d = '0' + d;

            if ((y + '-' + m) == (current_y + '-' + current_m)) { //当月不处理
                var t = y + '-' + m + '-' + d;
            }
            else if (period == "day") { //日度数据
                var t = y + '-' + m + '-' + d;
            }
            else {
                var t = y + '-' + m + '-28';
            }
            return t;

        }
        if (site.includes("value500")) {
            if (date.includes("日")) return date.slice(0, 4) + "-" + date.split("年")[1].split("月")[0] + "-" + date.substring(8, 10)
            if (date.includes("年")) {
                let month = date.split("年")[1].split("月")[0]
                if (month.length == 1) month = '0' + month
                return date.slice(0, 4) + "-" + month + '-28';
            }

            if (date.includes("/")) { //2023/8/21

                return date.replaceAll('/', '-')
            }

        }
    }

    let task_macromicro = async (datasInfo, pageUrl, apiUrl) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

        //防止被检测方式1：登陆网站后 通过editthiscookie插件复制cookie 
        let macromicro_cookie = [
            {
                "domain": ".macromicro.me",
                "expirationDate": 1730169700.281683,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_ga",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "GA1.2.835986011.1666600353",
                "id": 1
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1730169698.614691,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_ga_4CS94JJY2M",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "GS1.1.1695609698.70.0.1695609698.0.0.0",
                "id": 2
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1695609760,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_gat_gtag_UA_66285376_3",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1",
                "id": 3
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1695696100,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_gid",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "GA1.2.1407857323.1695609700",
                "id": 4
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1695611500,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_hjAbsoluteSessionInProgress",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "1",
                "id": 5
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1695609820,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_hjIncludedInSessionSample_1543609",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "0",
                "id": 6
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1695611500,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_hjSession_1543609",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "eyJpZCI6ImJmNDRjZTA1LTM3YzQtNGMwOC05MWJmLTVmZTM3MjJkYWYyOSIsImNyZWF0ZWQiOjE2OTU2MDk3MDAwNjQsImluU2FtcGxlIjpmYWxzZX0=",
                "id": 7
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1727145700,
                "hostOnly": false,
                "httpOnly": false,
                "name": "_hjSessionUser_1543609",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "eyJpZCI6IjZlNjQ3YzI2LTZmNmMtNTZiZS05YzUyLTYyMDFmYjc2M2QzNiIsImNyZWF0ZWQiOjE2NjY2MDAzNTUyMjcsImV4aXN0aW5nIjp0cnVlfQ==",
                "id": 8
            },
            {
                "domain": ".macromicro.me",
                "expirationDate": 1727145699.9213,
                "hostOnly": false,
                "httpOnly": true,
                "name": "cf_clearance",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "UL0dG6S9_FndBlv.mnAEum8FTXOwpDQcBz4vkoDthRE-1695609699-0-1-faf38a57.54c15689.adf2d5b7-0.2.1695609699",
                "id": 9
            },
            {
                "domain": ".sc.macromicro.me",
                "expirationDate": 1720771651.344802,
                "hostOnly": false,
                "httpOnly": false,
                "name": "__lt__cid",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "280e5225-6c4f-43c0-bd34-5d36c49c7ca1",
                "id": 10
            },
            {
                "domain": ".sc.macromicro.me",
                "expirationDate": 1724894990.581712,
                "hostOnly": false,
                "httpOnly": true,
                "name": "bvt",
                "path": "/",
                "sameSite": "lax",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "0",
                "id": 11
            },
            {
                "domain": ".sc.macromicro.me",
                "expirationDate": 1696214495.317304,
                "hostOnly": false,
                "httpOnly": true,
                "name": "mmt",
                "path": "/",
                "sameSite": "lax",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "269572%7C102aa7fe2c6a8f49825",
                "id": 12
            },
            {
                "domain": ".sc.macromicro.me",
                "expirationDate": 1710814906.325083,
                "hostOnly": false,
                "httpOnly": true,
                "name": "mmu",
                "path": "/",
                "sameSite": "lax",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "bbf338252b1f344f257335be5418fca7",
                "id": 13
            },
            {
                "domain": ".sc.macromicro.me",
                "expirationDate": 1695638495.317157,
                "hostOnly": false,
                "httpOnly": true,
                "name": "PHPSESSID",
                "path": "/",
                "sameSite": "no_restriction",
                "secure": true,
                "session": false,
                "storeId": "0",
                "value": "7n75vvemr0tesd0rlif1nshlpe",
                "id": 14
            },
            {
                "domain": "sc.macromicro.me",
                "hostOnly": true,
                "httpOnly": false,
                "name": "app_ui_newbie_btn",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": true,
                "storeId": "0",
                "value": "1",
                "id": 15
            },
            {
                "domain": "sc.macromicro.me",
                "expirationDate": 1695692956,
                "hostOnly": true,
                "httpOnly": false,
                "name": "btn_meo_230907",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1695260956",
                "id": 16
            },
            {
                "domain": "sc.macromicro.me",
                "hostOnly": true,
                "httpOnly": false,
                "name": "mm_sess_pages",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": true,
                "storeId": "0",
                "value": "1",
                "id": 17
            },
            {
                "domain": "sc.macromicro.me",
                "expirationDate": 1695692949,
                "hostOnly": true,
                "httpOnly": false,
                "name": "mm230919meo",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1695260950",
                "id": 18
            }
        ]
        for (let i = 0; i < macromicro_cookie.length; i++) {
            await page.setCookie(macromicro_cookie[i]);
        }

        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiUrl)) {

                    resdata = await response.json()
                    let chartId = "c:" + apiUrl.split("/")[3]
                    let fileName = ""
                    let fileStr = ""
                    for (let dataName in datasInfo) {
                        let dataIndex = datasInfo[dataName]
                        let dataValue = resdata.data[chartId].series[dataIndex].map(item => {
                            if (dataName.includes("Day")) return item //按日保留原日期格式
                            item[0] = formatDate("macromicro", item[0])
                            return item
                        })
                        fileName += `${fileNameDelimiter}${dataName}`
                        fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                    }
                    try {
                        fileName = fileName.substring(1)
                        fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                        console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
                    } catch (error) {
                        resolve(false)
                        console.error(error);
                    }

                    setTimeout(() => { resolve(true) }, "1000")
                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }


    let task_value500 = async (datasInfo, pageUrl) => {
        const promise1 = new Promise((resolve, reject) => {
            const req2 = http.request(pageUrl, function (res) {
                res.setEncoding('utf-8')
                let allchunk = ""
                res.on('data', function (chunk) {
                    allchunk += chunk
                });
                res.on("end", () => {
                    resdata = allchunk //html string

                    let fileName = ""
                    let fileStr = ""
                    for (let dataName in datasInfo) {
                        let option
                        let colors
                        const regex = /option = ([\s\S]*?)};/g;
                        const found = resdata.match(regex);
                        eval(found[datasInfo[dataName].chartOptionId])

                        let date = option.xAxis[0].data
                        let dataValue = option.series[datasInfo[dataName].chartSerieId].data

                        dataValue = date.map((item, index) => {
                            let newDate = formatDate("value500", item);
                            return [newDate, dataValue[index] ? dataValue[index] : ""]
                        }).filter(item => {
                            return parseFloat(item[0].substring(0, 4)) >= 2000
                        })

                        fileName += `${fileNameDelimiter}${dataName}`
                        fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                    }

                    try {
                        fileName = fileName.substring(1)
                        fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                        console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
                    } catch (error) {
                        resolve(false)
                        console.error(error);
                    }
                    resolve(true)

                }) //end
            })
            req2.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            })
            req2.end()
        })
        return promise1
    }


    let task_macroview = async (datasInfo, pageUrl, apiUrl) => {

        const page = await browser.newPage();
        await page.setRequestInterception(true)

        page.on('request', (request) => { request.continue() })
        const promise = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiUrl)) {

                    resdata = await response.json()
                    let chartId = pageUrl.split("=")[1]
                    let fileName = ""
                    let fileStr = ""
                    for (let dataName in datasInfo) {
                        let dataIndex = datasInfo[dataName]
                        let dataValue = resdata[chartId].data[dataIndex].map(item => {
                            //item[0] = formatDate("macroview", item[0])
                            return item
                        })
                        fileName += `${fileNameDelimiter}${dataName}`
                        fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                    }
                    try {
                        fileName = fileName.substring(1)
                        fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                        console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
                    } catch (error) {
                        resolve(false)
                        console.error(error);
                    }
                    resolve(true)
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise
    }


    let task_legulegu = async (datasInfo, pageUrl, apiUrl) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiUrl)) {
                    resdata = await response.json()

                    let fileName = ""
                    let fileStr = ""
                    for (let dataName in datasInfo) {
                        let dataIndex = datasInfo[dataName]
                        let dataValue = resdata.map(item => {
                            let newArr = []
                            newArr[0] = formatDate("legulegu", item.date)
                            newArr[1] = item[dataIndex] == 0 ? "" : item[dataIndex]

                            if (dataName == "十年期国债利率倒数")
                                newArr[1] = item[dataIndex] ? (1 / item.debtInterestRate * 100).toFixed(2) : ""

                            return newArr;
                        })
                        fileName += `${fileNameDelimiter}${dataName}`
                        fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                    }

                    try {
                        fileName = fileName.substring(1)
                        fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                        console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
                    } catch (error) {
                        resolve(false)
                        console.error(error);
                    }
                    resolve(true)

                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }


    let task_woniu500 = async (datasInfo) => {
        let woniu500Root = "http://www.woniu500.com/"

        function httpPromise(dataName, dataJsonApi) {
            const promise1 = new Promise((resolve, reject) => {
                const req2 = http.request(woniu500Root + dataJsonApi, function (res) {
                    res.setEncoding('utf-8')
                    let allchunk = ""
                    res.on('data', function (chunk) { allchunk += chunk })
                    res.on("end", () => {
                        resdata = JSON.parse(allchunk)
                        resolve({
                            [dataName]: resdata
                        }) //使用变量作为object的key
                    })
                })
                req2.on('error', function (e) {
                    reject(e.message);
                    console.log(e.message)
                })
                req2.end()
            })
            return promise1
        }
        let httpPromiseArr = []
        for (let dataName in datasInfo) {
            httpPromiseArr.push(httpPromise(dataName, datasInfo[dataName]))
        }
        Promise.all(httpPromiseArr).then((values) => {
            let fileName = ''
            let fileStr = ''
            values.forEach(objItem => {

                for (let dataName in objItem) {
                    let dataValue = objItem[dataName].map(function (item) {
                        let newItem = []
                        newItem[0] = formatDate("woniu500", item[0])
                        newItem[1] = item[1][3]
                        return newItem
                    }) //map
                    fileName += `${fileNameDelimiter}${dataName}`
                    fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                } //forin


            }) //forEach

            try {
                fileName = fileName.substring(1)
                fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
            } catch (error) {
                console.error(error);
            }

        })
    }

    let task_xueqiu = async (datasInfoArr) => {

        if (datasInfoArr.length == 0) return

        //先访问页面?
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })
        page.on('load', () => { })
        await page.goto("https://xueqiu.com/", { waitUntil: 'networkidle2' })



        let task_xueqiu_data = async (datasInfo) => {

            let nowTimestamp = new Date().getTime();
            let pageUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${datasInfo.symbol}&begin=${nowTimestamp}&period=${datasInfo.period}&type=before&count=-30000&indicator=kline`

            const page2 = await browser.newPage();
            await page2.setRequestInterception(true)
            page2.on('request', (request) => { request.continue() })
            const promise1 = new Promise((resolve, reject) => {
                page2.on('response', async (response) => {
                    if (response.url().includes(pageUrl)) {
                        resdata = await response.json()
                        let fileStr = `var ${datasInfo.name} = ` + JSON.stringify(resdata, null, 4) + "\r\n"
                        try {
                            fs.writeFileSync(`${folder}雪球行情/${datasInfo.name}.js`, fileStr);
                            console.log(`${datasInfo.name} JSON data is saved   ${folder}${datasInfo.name}.js `)
                        } catch (error) {
                            resolve(false)
                            console.error(error);
                        }
                        resolve(true)
                    }
                })
            }) //Promise
            await page2.goto(pageUrl, { waitUntil: 'networkidle2' })
            page2.close()
            return promise1
        }

        let datasInfoResArr = datasInfoArr.map((datasInfo) => {
            return task_xueqiu_data(datasInfo)
        })

        Promise.all(datasInfoResArr).then((values) => {
            console.log(values)
        })
    }

    let task_csindex = async (datasInfoArr) => {

        if (datasInfoArr.length == 0) return
        let getDay = () => {
            var date = new Date();
            var y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            if (m < 10)
                m = '0' + m
            if (d < 10)
                d = '0' + d

            var t = y + m + d
            return t
        }

        let task_csindex_data = async (datasInfo) => {

            let currentDay = getDay()
            let pageUrl = `https://www.csindex.com.cn/csindex-home/perf/index-perf?indexCode=${datasInfo.indexCode}&startDate=20000101&endDate=${currentDay}`

            const page2 = await browser.newPage();
            await page2.setRequestInterception(true)
            page2.on('request', (request) => { request.continue() })
            const promise1 = new Promise((resolve, reject) => {
                page2.on('response', async (response) => {
                    if (response.url().includes(pageUrl)) {
                        resdata = await response.json()
                        let fileStr = `let ${datasInfo.name} = ` + JSON.stringify(resdata, null, 4) + "\r\n"
                        try {
                            fs.writeFileSync(`${folder}中证行情/${datasInfo.name}.js`, fileStr);
                            console.log(`${datasInfo.name} JSON data is saved   ${folder}${datasInfo.name}.js `)
                        } catch (error) {
                            resolve(false)
                            console.error(error);
                        }
                        resolve(true)
                    }
                })
            }) //Promise

            await page2.goto(pageUrl, { waitUntil: 'networkidle2' })
            page2.close()
            return promise1
        }

        let datasInfoResArr = datasInfoArr.map((datasInfo) => {
            return task_csindex_data(datasInfo)
        })
        Promise.all(datasInfoResArr).then((values) => {
            console.log(values)
        })
    }


    let taskApi = async (name, site, apiUrl, dataFormat) => {
        const promise1 = new Promise((resolve, reject) => {
            const req2 = http.request(apiUrl, function (res) {
                res.setEncoding('utf-8')
                let allchunk = ""
                res.on('data', function (chunk) {
                    allchunk += chunk
                });
                res.on("end", () => {
                    resdata = dataFormat == "json" ? JSON.parse(allchunk) : allchunk
                    resolve({ name: name, siteInfo: [site, apiUrl, dataFormat], resdata: resdata })
                })
            });
            req2.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            req2.end();
        })
        return promise1
    }
    let taskPage = async (name, site, pageUrl, apiSub) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })

        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.json()
                    resolve({ name: name, siteInfo: [site, pageUrl, apiSub], resdata: resdata })
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }



   await task_xueqiu([
       { "name": "沪深300_xueqiu_day", "symbol": "SH000300", "period": "day" },
       { "name": "上证指数_xueqiu_day", "symbol": "SH000001", "period": "day" },
       { "name": "Ａ股指数_xueqiu_day", "symbol": "SH000002", "period": "day" }, //上证除b股
       { "name": "恒生指数_xueqiu_day", "symbol": "HKHSI", "period": "day" }, 
       { "name": "沪深300_xueqiu_week", "symbol": "SH000300", "period": "week" },
  
   ])

    await task_csindex([                                                      
          { "name": "科技龙头_csi_day", "indexCode": "931524", "period": "day" },   //蓝筹白马                 流动性    SHS科技龙头   SHS消费龙头
    //    { "name": "科技龙头_csi_day", "indexCode": "931524", "period": "day" },   //中小红低 大宗能粮 ppi     业绩性    沪港深通中小  上证商品  
    //    { "name": "科技龙头_csi_day", "indexCode": "931524", "period": "day" },   //         消费白马 cpi                           SHS消费龙头
    ])


    await task_macromicro({ "CPI": 0, "PPI": 1, "CPI_PPI": 2 }, "https://sc.macromicro.me/collections/24/cn-price-relative/38939/china-cpi-vs-ppi", "/charts/data/38939")

    await task_macromicro({ "财新制造业PMI": 0, "官方制造业PMI": 1 }, "https://sc.macromicro.me/collections/25/cn-industry-relative/232/cn-pmi-caixin", "/charts/data/232")
    await task_macroview({ "利润同比": "industryindicator_profit", "亏损增减": "industryindicator" }, "https://www.macroview.club/charts?name=cn_industry_indicator", "/get-chart")
    await task_macromicro({ "零售汽车": 1 }, "https://sc.macromicro.me/collections/23/cn-consumption/294/cn-china-retail-sales-of-enterprises-above-designated-size-automobile", "/charts/data/294")
    await task_macromicro({ "商品房销售": 1 }, "https://sc.macromicro.me/collections/26/cn-house-relative/273/cn-commercialized-buildings-sold", "/charts/data/273")
    await task_macromicro({ "出口": 1 }, "https://sc.macromicro.me/collections/27/cn-trade-finance-relative/279/cn-china-trade-export-growth-rate", "/charts/data/279")

    await task_value500({ "股债差300平均": { "chartOptionId": 0, "chartSerieId": 0 } }, "http://value500.com/CSI300.asp")
    await task_value500({ "股债差上证平均": { "chartOptionId": 0, "chartSerieId": 0 } }, "http://value500.com/ep.asp")
    await task_legulegu({ "沪深300PE中位数": "hs300PeMiddle", "全A股PE中位数": "marketPe", "十年期国债利率倒数": "debtInterestRate" }, "https://legulegu.com/stockdata/china-10-year-bond-yield", "china-10-year-bond-yield-data?token")
    await task_value500({ "沪深300同比": { "chartOptionId": 0, "chartSerieId": 3 }, "上证同比": { "chartOptionId": 0, "chartSerieId": 2 }, }, "http://value500.com/SH000001.asp")

    await task_value500({ "M1": { "chartOptionId": 0, "chartSerieId": 0 }, "M1_M2": { "chartOptionId": 0, "chartSerieId": 2 } }, "http://value500.com/M1.asp")
    await task_value500({ "社融存量": { "chartOptionId": 1, "chartSerieId": 0 } }, "http://value500.com/srzl.asp")
    await task_macromicro({ "信贷脉冲": 0, "房价同比": 1, "沪深300Day": 2, }, "https://sc.macromicro.me/collections/31/cn-finance-relative/35559/china-credit-impulse-index", "/charts/data/35559")
    //await task_macromicro({ "MSCI中国指数Day": 0, "MSCI中国收益率": 1 }, "https://sc.macromicro.me/charts/48170/msci-china-index-dividend-yield", "/charts/data/48170")


    taskPage("恐贪指数", "funddb", "https://api.jiucaishuo.com/v2/kjtl/kjtlconnect", "https://api.jiucaishuo.com/v2/kjtl/kjtlconnect").then((values) => {
        try {
            let dataName = "恐贪指数" 
            let fileStr = `let ${dataName} = "${values.resdata}" `  //默认加密了 html里解密  https://app.jiucaishuo.com/pagesA/highchart/greedy?kt_type=1
            fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
            console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `)
        } catch (error) {
            console.error(error);
        }
    })

})()

