const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {
    wait
} = require("./eco7/ajslib/my.js")
const nodemailer = require("nodemailer");




/*
时间戳定义为从格林威治时间1970年01月01日00时00分00秒起至现在的总秒数。
因此，严格来说，不管你处在地球上的哪个地方，任意时间点的时间戳都是相同的。这点有利于线上和客户端分布式应用统一追踪时间信息。
但是不同的时区，当前时间戳对应的当前时间是不同的。
*/
console.log("时间戳：", new Date().getTime())
console.error("fdfddf") //githubAction 不通知




async function xqTest(msg) {

    async function getXueQiu() {
        var browser
        var visitXqIndex = async () => {
            if (await wait(10) && browser && indexPage) return

            if (os.platform() == "win32") browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] })
            else browser = await puppeteer.launch({ headless: true })
            browser.on('disconnected', () => { browser = undefined; indexPage = undefined; })

            indexPage = await browser.newPage();
            await indexPage.setRequestInterception(true)
            indexPage.on('request', (request) => { request.continue() })
            indexPage.on('load', () => { })
            await indexPage.goto("https://xueqiu21212.com/", { waitUntil: 'networkidle2' })
        }
        await visitXqIndex()

        var getDataFromUrlFunc = async (dataName, dataCode) => {
            let startTime = 31813200000
            getXueQiuNowTimestamp = new Date().getTime()
            if (os.platform() != "win32") getXueQiuNowTimestamp = getXueQiuNowTimestamp + 8 * 60 * 60 * 1000 //github Action utc
            let pageUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${dataCode}&begin=${startTime}&end=${getXueQiuNowTimestamp}&period=day&type=before&indicator=kline`
            await visitXqIndex()
            const page = await browser.newPage();
            await page.setRequestInterception(true)
            page.on('request', (request) => { request.continue() })
            const promise1 = new Promise((resolve, reject) => {
                page.on('response', async (response) => {
                    if (response.url().includes(pageUrl)) {
                        resdata = await response.json()
                        resolve(resdata)
                    }
                })
            })//promise1
            await page.goto(pageUrl, { waitUntil: 'networkidle2' })
            page.close()
            return promise1
        }
        return getDataFromUrlFunc
    }
    var getDataFromUrlFunc = getDataFromUrlFunc ?? await getXueQiu()
    dayDatas = await getDataFromUrlFunc("沪深300_xueqiu_day", "SH000300")
    return dayDatas[0].date
}

async function mailTest(msg) {
    let promise = new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                pool: true,
                host: "smtp.163.com",
                port: 465,
                secure: true, // Use `true` for port 465, `false` for all other ports
                secureConnection: true,
                auth: {
                    user: "o111owuyue@163.com",
                    pass: "AEUORGVIOHTDGDGZ",  //qq8516 的：swvwmndqaedjbfii 
                },
            });
            transporter.sendMail({
                from: '"oowuyue" <oowuyue@163.com>', // sender address
                to: "3434384699@qq.com, 851616860@qq.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: msg, // plain text body
                html: msg, // html body
            }, (err, info) => {
                if (err) reject(err)
                else resolve(info)
            });

        } catch (error) {
            reject(error)
        }
    });
    return promise
}

(async () => {
    let mailRes = await xqTest()
})()








