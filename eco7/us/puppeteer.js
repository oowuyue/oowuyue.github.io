const puppeteer = require('puppeteer-extra'); ////防止被检测方式2：https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
// const puppeteer = require('puppeteer');

const http = require('http');
const fs = require('fs');
const path = require('path');
const {
    unifyDate,
    wait
} = require("../ajslib/my.js");

(async () => {

    //const folder = path.join(__dirname, "/data/")
    const folder = "data/"
    let fileNameDelimiter = ","
    const browser = await puppeteer.launch({ headless: false, })

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
                            //if (dataName.includes("Day")) return item //按日保留原日期格式
                            //item[0] = formatDate("macromicro", item[0])
                            item[0] = unifyDate("macromicro", item[0], dataName)
                            return item
                        })
                        fileName += `${fileNameDelimiter}${dataName}`
                        fileStr += `var ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                    }
                    try {
                        fileName = fileName.substring(1)
                        fs.writeFileSync(`${folder}${fileName}.js`, fileStr);
                        console.log(`${fileName} JSON data is saved   ${folder}${fileName}.js `)
                    } catch (error) {
                        console.error(error)
                        resolve(false)
                    }

                    setTimeout(() => { resolve(true) }, "1000")
                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }

    let task_fredDown = async (dataNames, pageUrl) => {

        const page = await browser.newPage()
        const client = await page.target().createCDPSession()
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: path.resolve(folder)
        });
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        await page.click('#download-button')
        await page.waitForSelector('#download-data-csv')
        await page.click('#download-data-csv')

        function wait(ms) {
            return new Promise(resolve => setTimeout(() => resolve(), ms))
        }
        await wait(1000)

        let csvFile = `${folder}fredgraph.csv` //多个数据下载文件名是fredgraph.csv
        fs.readFile(csvFile, "utf-8", (err, data) => {
            if (err) console.log(err)
            else {
                const lines = data.split(/\r?\n/)
                lines.shift()
                let dataNameArr = dataNames.split("-")
                let fileStr = ""

                for (let index = 0; index < dataNameArr.length; index++) {
                    const dataName = dataNameArr[index]
                    let dataValue = lines.map(item => {
                        let newArr = []
                        //newArr[0] = item.split(",")[0]
                        newArr[0] = unifyDate("fredDown", item.split(",")[0], dataName)
                        newArr[1] = parseFloat(item.split(",")[index + 1])
                        return newArr
                    })
                    if (!dataValue[dataValue.length - 1][1]) dataValue.pop()
                    fileStr += `var ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                }

                try {
                    fs.writeFileSync(`${folder}${dataNames}.js`, fileStr);
                    console.log(`${dataNames} JSON data is saved`);
                } catch (error) {
                    console.error(error);
                }
                fs.renameSync(`${folder}fredgraph.csv`, `${folder}${dataNames}.csv`)
                //fs.unlink(csvFile, (err) => { }) 
            }
        }) //readfile
    }

    let taskPage = async (dataName, pageUrl, apiSub, saveFormat = "json") => {
        apiSub = apiSub ?? pageUrl
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })

        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    let resData = await response.json()
                    try {
                        let fileStr = saveFormat == "json" ? `var ${dataName} = ${JSON.stringify(resData, null, 4)}` : `var ${dataName} = "${resData}" `
                        fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
                        console.log(`${dataName} data is saved   ${folder}${dataName}.js `)
                        resolve(true)
                    } catch (error) {
                        console.error(error)
                        resolve(false)
                    }
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }

    await task_fredDown("UnemploymentRate-Cpi", "https://fred.stlouisfed.org/graph/?g=1ezfN")
    await task_fredDown("UnPlusNoncyclical季-CpiPlusRealGdp季-RealGdp季", "https://fred.stlouisfed.org/graph/?g=1ezgg")///

    await taskPage("us白糖", "https://api.investing.com/api/financialdata/8869/historical/chart/?period=MAX&interval=P1M&pointscount=110")
    await taskPage("us原油", "https://api.investing.com/api/financialdata/8849/historical/chart/?period=MAX&interval=P1M&pointscount=110")
    await task_macromicro({ "铜金比Day": 0 }, "https://sc.macromicro.me/charts/2272/coppergoldbond", "/charts/data/2272")
    await task_macromicro({ "MM美股基本指数": 0 }, "https://sc.macromicro.me/collections/34/us-stock-relative/444/us-mm-gspc", "/charts/data/444")

    await task_fredDown("Wilshire5000-Wilshire500YoY-Vix", "https://fred.stlouisfed.org/graph/?g=1ezhO")
    await task_macromicro({ "全球股市大于200日均线比例Day": 0 }, "https://sc.macromicro.me/charts/50191/world-equities-200ma-breadth", "/charts/data/50191")

    await task_macromicro({ "MM制造业指标": 0 }, "https://sc.macromicro.me/collections/3261/sector-industrial/47492/mm-manufacturing-cycle-index", "/charts/data/47492")
    await task_macromicro({ "PMI_ISM": 0, "金融脉动增速": 1 }, "https://sc.macromicro.me/charts/84511/us-ism-manufuacturing-pmi-vs-fed-fcig", "/charts/data/84511")
    await task_macromicro({ "金融压力Day": 0, "美元指数Day": 1 }, "https://sc.macromicro.me/charts/88114/us-fsu-vs-dxy", "/charts/data/88114")

    await task_fredDown("Rate周-Assets周", "https://fred.stlouisfed.org/graph/?g=1eGAC")
    await task_macromicro({ "Y10日": 0, "Y2日": 1 }, "https://sc.macromicro.me/charts/46/bonds-rate", "/charts/data/46")
})()