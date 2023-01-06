const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {

    const folder = "./data/"
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
                return date.slice(0, 4) + "-" + date.slice(5, 7) + "-" + date.substring(8, 10);
            return date.slice(0, 4) + "-" + date.slice(5, 7) + '-28';
        }
    }
    function formatAndSave(value) {
        let dataName = value.name
        let chartId = "c:" + value.siteInfo[2].split("/")[3]
        let chartLineId = value.siteInfo[3]
        let dataValue = value.resdata.data[chartId].s[chartLineId].map(item => {
            //item[0] = formatDate("macromicro", item[0]); 
            return item
        })
        let fileStr = `let ${dataName} = ` + JSON.stringify(dataValue, null, 4);
        try {
            fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
            console.log(`${dataName} JSON data is saved`);
        } catch (error) {
            console.error(error);
        }
        return true
    }
    let taskApi = async (name, apiUrl, dataFormat, save = true) => {
        const promise1 = new Promise((resolve, reject) => {
            const req2 = http.request(apiUrl, function (res) {
                res.setEncoding('utf-8')
                let allchunk = ""
                res.on('data', function (chunk) {
                    allchunk += chunk
                });
                res.on("end", () => {
                    resdata = dataFormat == "json" ? JSON.parse(allchunk) : allchunk
                    save == true ?
                        resolve(formatAndSave({ name: name, apiUrl: apiUrl, resdata: resdata })) :
                        resolve({ name: name, apiUrl: apiUrl, resdata: resdata })
                })
            });
            req2.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            req2.end();
        })
        return promise1
    }
    let taskPage = async (name, site, pageUrl, apiSub, chartLine = 0, save = true) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.json()
                    save == true ?
                        resolve(formatAndSave({ name: name, siteInfo: [site, pageUrl, apiSub, chartLine], resdata: resdata })) :
                        resolve({ name: name, siteInfo: [site, pageUrl, apiSub, chartLine], resdata: resdata })
                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }
    let taskFileDownload = async (dataNames, site = "fred.stlouisfed", pageUrl) => {

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

        let csvFile = `${folder}fredgraph.csv`  //多个数据下载文件名是fredgraph.csv
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
                        newArr[0] = item.split(",")[0]
                        newArr[1] = parseFloat(item.split(",")[index + 1])
                        return newArr
                    })
                    fileStr += `let ${dataName} = ` + JSON.stringify(dataValue, null, 4) + "\r\n"
                }

                try {
                    fs.writeFileSync(`${folder}${dataNames}.js`, fileStr);
                    console.log(`${dataNames} JSON data is saved`);
                } catch (error) {
                    console.error(error);
                }
                fs.unlink(csvFile, (err) => { })
            }
        })//readfile
    }

    // await taskPage("标普500", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/402/us-optimus-prime-index-gspc", "/charts/data/402", 1)
    // await taskPage("CPI", "macromicro", "https://sc.macromicro.me/collections/5/us-price-relative/10/cpi", "/charts/data/10", 1)
    // await taskPage("PCE", "macromicro", "https://sc.macromicro.me/collections/5/us-price-relative/25/pce-price", "/charts/data/25", 0)
    // await taskPage("失业率", "macromicro", "https://sc.macromicro.me/collections/4/us-employ-relative/6/employment-condition", "/charts/data/6", 1)
    // await taskPage("产能利用率", "macromicro", "https://sc.macromicro.me/collections/3261/sector-industrial/45/production", "/charts/data/45", 1)
    // await taskPage("MM美股基本指数", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/444/us-mm-gspc", "/charts/data/444")
    // await taskPage("MM制造业周期指标", "macromicro", "https://sc.macromicro.me/collections/3261/sector-industrial/47492/mm-manufacturing-cycle-index", "/charts/data/47492")
    // await taskPage("标普股利国债差", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/3231/sp500-dividendyield-2yr-bondyield-spread", "/charts/data/3231", 2)
    // await taskFileDownload("PCE-CPI-PCEPI", "fred.stlouisfed", "https://fred.stlouisfed.org/graph/?g=XmVr")
    await taskFileDownload("CPI_realGdpQ-realGdpQ", "fred.stlouisfed", " https://fred.stlouisfed.org/graph/?g=Y8fk")
    // await taskFileDownload("Rate-Yield10 -Assets", "fred.stlouisfed", "https://fred.stlouisfed.org/graph/?g=XBS2")

})()