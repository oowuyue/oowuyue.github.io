const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
    const folder = "./data/"
    let fileNameDelimiter = ","
    const browser = await puppeteer.launch({ headless: false, });
    function formatDate(site, date) {
        if (site.includes("macromicro")) {
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

            if (d >= 28)
                var t = y + '-' + m + '-28';
            else
                var t = y + '-' + m + '-' + d;
            return t;

        }
        if (site.includes("value500")) {

            if (date.includes("日"))
                return date.slice(0, 4) + "-" + date.split("年")[1].split("月")[0] + "-" + date.substring(8, 10);
            return date.slice(0, 4) + "-" + date.split("年")[1].split("月")[0] + '-28';
        }
    }

    let task_macromicro = async (datasInfo, pageUrl, apiUrl) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

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
                        let dataValue = resdata.data[chartId].s[dataIndex].map(item => {
                            if (dataName == "沪深300") return item //按日不格式时间
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
                    resolve(true)
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

                })//end
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
                        resolve({ [dataName]: resdata }) //使用变量作为object的key
                    })
                })
                req2.on('error', function (e) { reject(e.message); console.log(e.message) })
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
                    })//map
                    fileName += `${fileNameDelimiter}${dataName}`
                    fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                }//forin


            })//forEach

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
                        let fileStr = `let ${datasInfo.name} = ` + JSON.stringify(resdata, null, 4) + "\r\n"
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
            })//Promise
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



    // await task_xueqiu([
    //     // { "name": "沪深300Week", "symbol": "SH000300", "period": "week" },
    //     //{ "name": "沪深300Month", "symbol": "SH000300", "period": "month" },

    //     // { "name": "大宗商品", "symbol": "SH000979", "period": "month" },
    //     // { "name": "上证消费", "symbol": "SH000036", "period": "month" },
    //     // { "name": "中证红利", "symbol": "SH000922", "period": "month" },

    //     // { "name": "中国银行", "symbol": "SH601988", "period": "day" },
    //     // { "name": "工商银行", "symbol": "SH601398", "period": "day" },
    //     // { "name": "光大证券", "symbol": "SH601788", "period": "day" },
    //     // { "name": "中信证券", "symbol": "SH600030", "period": "day" }
    // ])


    // await task_woniu500({ "化工": "data/z801030_zhg.json", "有色": "data/z801050_zysjs.json" })

    // await task_legulegu({ "沪深300PE中位数": "hs300PeMiddle", "全A股PE中位数": "marketPe", "十年期国债利率倒数": "debtInterestRate" }, "https://legulegu.com/stockdata/china-10-year-bond-yield", "china-10-year-bond-yield-data?token")

    // await task_value500({ "上证同比": { "chartOptionId": 0, "chartSerieId": 2 }, "沪深300同比": { "chartOptionId": 0, "chartSerieId": 3 }, "M2": { "chartOptionId": 1, "chartSerieId": 1 } }, "http://value500.com/SH000001.asp")

    // await task_value500({ "股债差300平均": { "chartOptionId": 0, "chartSerieId": 0 } }, "http://value500.com/CSI300.asp")

    // await task_macromicro({ "CPI": 0, "PPI": 1, "CPI_PPI": 2 }, "https://sc.macromicro.me/collections/24/cn-price-relative/38939/china-cpi-vs-ppi", "/charts/data/38939")

    // await task_macroview({ "利润同比": "industryindicator_profit", "亏损增减": "industryindicator" }, "https://www.macroview.club/charts?name=cn_industry_indicator", "/get-chart")

    // await task_macromicro({ "财新制造业PMI": 0, "官方制造业PMI": 1}, "https://sc.macromicro.me/collections/25/cn-industry-relative/232/cn-pmi-caixin", "/charts/data/232")

    // await task_macromicro({ "M1": 1, "M1_M2": 2, "沪深300": 3 }, "https://sc.macromicro.me/collections/55/cn-shanghai-shengzhen-csi-300-index/260/cn-china-m1-m2", "/charts/data/260")

    // await task_macromicro({ "信贷脉冲": 0 }, "https://sc.macromicro.me/collections/31/cn-finance-relative/35559/china-credit-impulse-index", "/charts/data/35559")

})()