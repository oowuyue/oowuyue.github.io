const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {

    const folder = "./data/"
    const browser = await puppeteer.launch({ headless: false, });

    let taskPage = async (name, site, pageUrl, apiSub) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })

        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.text()
                    resolve({ name: name, siteInfo: [site, pageUrl, apiSub], resdata: resdata })
                    page.close()
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })

        const element = await page.waitForSelector('div[data-id="KKE_tab_kd"] > a');
        await element.click(); // Just an example.

        
        return promise1
    }


    //铜连续  螺纹连续
    let dataName = "螺纹连续"
    let res = await taskPage(dataName, "sina", "https://finance.sina.com.cn/futures/quotes/RB0.shtml", "InnerFuturesNewService.getDailyKLine?symbol=")
    try {
        let resStr = res.resdata.match(/\[.*\]/sg)
        let fileStr = `let ${dataName} = ` + JSON.stringify(JSON.parse(resStr), null, 4)  + "\r\n"
        fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
        console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `)
    } catch (error) {
        console.error(error);
    }

})()