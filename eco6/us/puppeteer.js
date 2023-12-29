const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');
const { isNull } = require('util');

(async () => {

    const folder = "./data/"
    const browser = await puppeteer.launch({ headless: false, });

    function formatDate(site, date) {
        if (site.includes("macromicro")) {
            return date.substring(0, 8) + "28"
        }
        if (site.includes("investing")) {
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
    }
    function formatAndSave(value) {
        if (value.siteInfo[0] == "macromicro") {
            let dataName = value.name
            let chartId = "c:" + value.siteInfo[2].split("/")[3]
            let chartLineId = value.siteInfo[3]
            let dataValue = value.resdata.data[chartId].series[chartLineId].map(item => {
                //item[0] = formatDate("macromicro", item[0]); 
                return item
            })
            let fileStr = `let ${dataName} = ` + JSON.stringify(dataValue, null, 0);
            try {
                fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
                console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `);
            } catch (error) {
                console.error(error);
            }
            return true
        }

        if (value.siteInfo[0] == "investing") {
            let dataValue = value.resdata.data.map(item => {
                item[0] = formatDate("investing", item[0]);
                return item
            })

            let dataName = value.name
            let fileStr = `let ${dataName} = ` + JSON.stringify(dataValue, null, 0);
            try {
                fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
                console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `);
            } catch (error) {
                console.error(error);
            }
            return true
        }


    }

    let taskPage = async (name, site, pageUrl, apiSub = null, chartLine = 0, save = true) => {

        apiSub = apiSub ?? pageUrl;
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
    let taskPageArr = async (names = [], site, pageUrl, apiSub, chartLines = [], save = true) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.json()

                    let res = true
                    for (var i = names.length - 1; i >= 0; i--) {
                        res = res && formatAndSave({ name: names[i], siteInfo: [site, pageUrl, apiSub, chartLines[i]], resdata: resdata })
                    }
                    resolve(res)

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
        }) //readfile
    }


    
    await taskPage("全球股市大于200日均线比例", "macromicro", "https://sc.macromicro.me/charts/50191/world-equities-200ma-breadth", "/charts/data/50191")
    await taskPage("VIX波动率指数", "macromicro", "https://sc.macromicro.me/charts/47/vix", "/charts/data/47")

   
    await taskPageArr(["MM美元基本面", "美元指数"], "macromicro", "https://sc.macromicro.me/collections/1767/us-dollar/14948/mm-dxy-expectation-index", "/charts/data/14948", [0, 1])


    await taskPage("us白糖", "investing", "https://api.investing.com/api/financialdata/8869/historical/chart/?period=MAX&interval=P1M&pointscount=110")
    await taskPage("us原油", "investing", "https://api.investing.com/api/financialdata/8849/historical/chart/?period=MAX&interval=P1M&pointscount=110")
    await taskPage("铜金比", "macromicro", "https://sc.macromicro.me/charts/2272/coppergoldbond", "/charts/data/2272", 0)


    await taskPage("MM制造业周期指标", "macromicro", "https://sc.macromicro.me/collections/3261/sector-industrial/47492/mm-manufacturing-cycle-index", "/charts/data/47492")
    await taskPage("MM美股基本指数", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/444/us-mm-gspc", "/charts/data/444")


    await taskPageArr(["Y10", "Y2", "Y10_2"], "macromicro", "https://sc.macromicro.me/charts/46/bonds-rate", "/charts/data/46", [0, 1, 2])
    await taskFileDownload("Rate-Yield10-Assets", "fred.stlouisfed", "https://fred.stlouisfed.org/graph/?g=XBS2")


})()