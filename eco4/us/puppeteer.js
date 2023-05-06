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
            console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `);
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


    // await taskPage("CPI", "macromicro", "https://sc.macromicro.me/collections/5/us-price-relative/10/cpi", "/charts/data/10", 1)
    // await taskPage("失业率", "macromicro", "https://sc.macromicro.me/collections/4/us-employ-relative/6/employment-condition", "/charts/data/6", 1)


    await taskPage("标普500", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/402/us-optimus-prime-index-gspc", "/charts/data/402", 1)

    await taskPage("铜金比", "macromicro", "https://sc.macromicro.me/charts/2272/coppergoldbond", "/charts/data/2272", 0)

    await taskPage("MM美股基本指数", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/444/us-mm-gspc", "/charts/data/444")
    await taskPage("MM制造业周期指标", "macromicro", "https://sc.macromicro.me/collections/3261/sector-industrial/47492/mm-manufacturing-cycle-index", "/charts/data/47492")
    await taskPage("咨商领先指标", "macromicro", "https://sc.macromicro.me/charts/752/us-bond-cb-leading-index", "/charts/data/752", 0)


    await taskPage("标普股利国债差", "macromicro", "https://sc.macromicro.me/collections/34/us-stock-relative/3231/sp500-dividendyield-2yr-bondyield-spread", "/charts/data/3231", 2)

    await taskPage("usm1", "macromicro", "https://sc.macromicro.me/charts/23858/us-m2", "/charts/data/23858", 2)
    await taskPage("usm2", "macromicro", "https://sc.macromicro.me/charts/23858/us-m2", "/charts/data/23858", 1)


    await taskPageArr(["Y10", "Y2", "Y10_2"], "macromicro", "https://sc.macromicro.me/charts/46/bonds-rate", "/charts/data/46", [0, 1, 2])


    await taskFileDownload("Rate-Yield10-Assets", "fred.stlouisfed", "https://fred.stlouisfed.org/graph/?g=XBS2")

    // await taskFileDownload("PCE-CPI-PCEPI", "fred.stlouisfed", "https://fred.stlouisfed.org/graph/?g=XmVr")
    // await taskFileDownload("CPI_realGdpQ-realGdpQ", "fred.stlouisfed", " https://fred.stlouisfed.org/graph/?g=Y8fk")


    // await taskPage("恒生科技指数", "macromicro", "https://sc.macromicro.me/collections/1658/hk-stock-relative/28089/hk-hang-seng-tech-index", "/charts/data/28089")

    // await taskPage("恒生指数", "macromicro", "https://sc.macromicro.me/collections/1658/hk-stock-relative/14068/k-loans-and-advances-for-use-in-hong-kong-yoy-vs-hsi", "/charts/data/14068",2)

    // await taskPage("香港银行体系余额", "macromicro", "https://sc.macromicro.me/collections/1626/hk-finance-relative/3766/hk-monetary-base", "/charts/data/3766")
    // await taskPageArr(["香港M1","香港M1_M2"], "macromicro", "https://sc.macromicro.me/collections/1626/hk-finance-relative/13964/hk-m1-and-m2", "/charts/data/13964",[0,2])

})()