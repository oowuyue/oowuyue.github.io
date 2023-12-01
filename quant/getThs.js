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
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()
        return promise1
    }



    let dataName = "大叶股份"
    let res = await taskPage(dataName, "同花顺", `https://search.10jqka.com.cn/unifiedwap/result?w=${dataName}`, "last1800.js")
    try {
        let resStr = res.resdata.match(/\{.*\}/sg)
        let resObj = JSON.parse(resStr)
        resObj.data = resObj.data.split(';').map(ele=>{ 
                let eleArr =  ele.split(",")
                let newEle = []
                newEle[0] = eleArr[0].substring(0,4)+"-"+eleArr[0].substring(4,6)+"-"+eleArr[0].substring(6,8)
                newEle[1] = parseFloat( eleArr[1] ) 
                newEle[2] = parseFloat( eleArr[2] ) 
                newEle[3] = parseFloat( eleArr[3] ) 
                newEle[4] = parseFloat( eleArr[4] ) 
                newEle[5] = parseFloat( eleArr[5] ) 
                return newEle
        })

        let fileStr = `let ${dataName} = ` + JSON.stringify(resObj, null, 4) + "\r\n"
        fs.writeFileSync(`${folder}${dataName}.js`, fileStr);
        console.log(`${dataName} JSON data is saved   ${folder}${dataName}.js `)
    } catch (error) {
        console.error(error);
    }


    //https: //search.10jqka.com.cn/unifiedwap/result?w=%E7%9B%8A%E7%9B%9B%E8%8D%AF%E4%B8%9A

})()