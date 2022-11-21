const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');

(async () => {

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

    let folder = "./data/"

    function formatAndSave(value) {
        if (value.name == "mm_manucycle") {
            let resdata = value.resdata;
            let mm_manucycle = resdata.data["c:47492"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            mm_manucycle = "let mm_manucycle = " + JSON.stringify(mm_manucycle, null, 4);
            try {
                fs.writeFileSync(folder + 'mm_manucycle.js', mm_manucycle);
                console.log("mm_manucycle JSON data is saved.");
            } catch (error) {
                console.error(err);
            }
        }
        if (value.name == "mm_uscycle") {
            let resdata = value.resdata;
            let mm_uscycle = resdata.data["c:444"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            mm_uscycle = "let mm_uscycle = " + JSON.stringify(mm_uscycle, null, 4);
            try {
                fs.writeFileSync(folder + 'mm_uscycle.js', mm_uscycle);
                console.log("mm_uscycle JSON data is saved.");
            } catch (error) {
                console.error(err);
            }
        }
        return true
    }

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

    let taskPage = async (name, pageUrl, apiSub) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.json()
                    resolve({ name: name, pageUrl: pageUrl, apiSub: apiSub, resdata: resdata })
                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        return promise1
    }

    let taskMacromicroPage = async (name, pageUrl, apiSub) => {
        let value = await taskPage(name, pageUrl, apiSub)
        return formatAndSave(value)
    }

    await taskMacromicroPage("mm_manucycle", "https://sc.macromicro.me/collections/3261/sector-industrial/47492/mm-manufacturing-cycle-index", "/charts/data/47492")
    await taskMacromicroPage("mm_uscycle", "https://sc.macromicro.me/collections/34/us-stock-relative/444/us-mm-gspc", "/charts/data/444")

})()