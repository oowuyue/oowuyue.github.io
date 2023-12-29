const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');

const myjs = require("../cn/jslib/my.js");
const isMonthLastDay = myjs.isMonthLastDay
const pre5Month = myjs.pre5Month
const isSameWeek = myjs.isSameWeek
const dayToPeriod = myjs.dayToPeriod
const xueqiuFormatDate = myjs.xueqiuFormatDate
const getDayPercent = myjs.getDayPercent

const folder = "./data/"
async function writeToFile(dataName, dayDatas) {

    fs.writeFile(`${folder}${dataName}.js`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, 2), 'utf8', (err) => {
        if (err) {
            console.log(`${dataName}写入失败${err}`);
            return;
        }
        console.log(`${dataName}写入成功`);
    });
}
async function getDataFromFile(dataName, dataCode) {

    let promise1 = new Promise((resolve, reject) => {
        fs.readFile(`${folder}${dataName}.js`, 'utf8', (err, data) => {
            if (err) {
                resolve(false);
                return;
            }
            console.log(`\r\n${dataName} getDataFromFile`);
            if (data.indexOf("=") >= 0) {
                data = data.substring(data.indexOf("=") + 1)
            }
            resolve(JSON.parse(data))//返回json
        })
    })
    return promise1
}
async function getDataFromUrl(dataName, dataCode) {

    let task_xueqiu = async (datasInfo) => {
        //先访问页面?
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })
        page.on('load', () => { })
        await page.goto("https://xueqiu.com/", { waitUntil: 'networkidle2' })

        let task_xueqiu_data = async (datasInfo) => {
            let startTime = 31813200000;
            let nowTimestamp = new Date().getTime();
            //let pageUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${datasInfo.symbol}&begin=${nowTimestamp}&period=${datasInfo.period}&type=before&count=-30000&indicator=kline`
            let pageUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${datasInfo.symbol}&begin=${startTime}&end=${nowTimestamp}&period=day&type=before&indicator=kline`
            const page2 = await browser.newPage();
            await page2.setRequestInterception(true)
            page2.on('request', (request) => { request.continue() })
            const promise1 = new Promise((resolve, reject) => {
                page2.on('response', async (response) => {
                    if (response.url().includes(pageUrl)) {
                        resdata = await response.json()
                        resolve(resdata)
                    }
                })
            }) //Promise
            await page2.goto(pageUrl, { waitUntil: 'networkidle2' })
            //page2.close()
            return promise1
        }

        return task_xueqiu_data(datasInfo)
    }
    let res = await task_xueqiu({ "name": dataName, "symbol": dataCode, "period": "day" })
    console.log(`\r\n${dataName} getDataFromUrl`);
    return res;
}


let logDay5 = []
let logDay5percent = ""
let logDates = []

function backTest(dataName, dayDatas) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow5 = false
    let monthPre5Jlow0 = false

    function restAction() {
        dayCross = false
        dayNlowM = false
        weekJup = false
        monthLowMa = false
        monthJup = false
        monthJlow5 = false
        monthPre5Jlow0 = false

        logDay5 = []
        logDay5percent = ""
    }


    function testDay(currentDayList) {

        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 55) {
            dayCross = true //日低位金叉
        }

        let nDayLow0Count = 0
        let nDayLow2Count = 0
        let day5percent = 0

        for (let i = 2; i <= 6; i++) {
            let dayItem = currentDayList[currentDayList.length - i]
            if (dayItem.percent < 0) {
                nDayLow0Count = nDayLow0Count + 1 //前五日跌超0天数
            }
            if (dayItem.percent < -2) {
                nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
            }
            logDay5.push(dayItem.percent)
        }
        logDay5.sort((a, b) => a - b)

        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
        logDay5percent = day5percent
        if (
            ((nDayLow0Count >= 3) || (nDayLow2Count >= 1) || (day5percent <= -3)) &&
            (day5percent <= 0) &&
            (currentDay.percent >= 0.2)
        ) {
            dayNlowM = true
        }

    }

    function testWeek(currentWeekList) {
        weekJup = true //周J向上 
    }

    function testMonth(currentMonthList) {
        let pre5Month = currentMonthList[currentMonthList.length - 3]
        let preMonth = currentMonthList[currentMonthList.length - 2]
        let currentMonth = currentMonthList[currentMonthList.length - 1]


        if (currentMonth.ma30) {
            if (currentMonth.ma30 > currentMonth.low)
                monthLowMa = true //小于月30均线
        }
        if (!monthLowMa) {
            if (preMonth.ma30 && (preMonth.ma30 > preMonth.low)) {
                monthLowMa = true //上月小于30均线
            }
        }


        if (preMonth.J < currentMonth.J) {
            monthJup = true //月J向上
        }
        if (pre5Month && (pre5Month.J < currentMonth.J)) {
            monthJup = true //月J向上
        }

        if (currentMonth.ma80 && (currentMonth.ma80 > currentMonth.low)) {
            if (monthJup == false)
                monthJup = true //月J向上
        }

        if (currentMonth.J <= 12) {
            monthJlow5 = true //月j小于10,12
        }

        for (var i = 1; i < 6; i++) {
            let monthItem = currentMonthList[currentMonthList.length - i]
            if (monthItem && monthItem.J < 10) {
                monthPre5Jlow0 = true //前五个月有月j小于0,5,7,10
                break
            }
        }
    }

    function mylog(currentDayList, currentWeekList, currentMonthList) {

        let currentDayIndex = currentDayList.length - 1
        let currentDay = currentDayList[currentDayIndex]

        console.log("ok", currentDay.date, logDay5, logDay5percent.toFixed(2), getDayPercent(currentDay))
        logDates.push([currentDay.date, getDayPercent(currentDay)])

    }

    //等效setInterval循环
    for (var currentDayIndex = 70; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(30, 'close').maN(80, 'close')

        testDay(currentDayList)
        testWeek(currentWeekList)
        testMonth(currentMonthList)


        let currentDayDate = currentDayList[currentDayList.length - 1].date
        // if (currentDayDate.includes("2009-0311")) {
        //     console.log(currentDayDate, dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0)
        // }

        let lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0
        if (lastResult) mylog(currentDayList, currentWeekList, currentMonthList)
        restAction()
    }
    //等效setInterval循环
}


async function getDataBack(dataName, dataCode) {
    let dayDatas
    try {
        dayDatas = await getDataFromFile(dataName, dataCode)
        if (!dayDatas) {
            dayDatas = await getDataFromUrl(dataName, dataCode)
            writeToFile(dataName, dayDatas)
        }
        dayDatas = dayDatas.data.item.map(function (data) {
            return {
                date: xueqiuFormatDate(data[0], "day"),
                timestamp: data[0],
                open: data[2],
                high: data[3],
                low: data[4],
                close: data[5],
                percent: data[7],
                volume: Math.ceil(+data[1]),
            }
        })
        backTest(dataName, dayDatas)
    } catch (err) {
        console.log(err)
    }
}




let browser;
(async () => {
    browser = await puppeteer.launch({ headless: false, });
    let nameCodes = [
        { name: "标普500_xueqiu_day", code: ".INX" },
        { name: "道琼斯_xueqiu_day", code: ".DJI" },
        { name: "纳指_xueqiu_day", code: ".IXIC" },
    ]

    let logAllDates = ""
    for (var i = 0; i < nameCodes.length; i++) {
        await getDataBack(nameCodes[i].name, nameCodes[i].code)
        logAllDates += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(logDates, null, 0) + "\r\n"
        logDates = []
    }

    fs.writeFile(`${folder}美股指数策略.js`, logAllDates, 'utf8', (err) => {
        if (err) console.log(`美股指数策略写入失败${err}`);
        else console.log(`美股指数策略写入成功`);
    })


})()