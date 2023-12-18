const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');

const myjs = require("./jslib/my.js");
const isMonthLastDay = myjs.isMonthLastDay
const pre5Month = myjs.pre5Month
const isSameWeek = myjs.isSameWeek
const dayToPeriod = myjs.dayToPeriod
const xueqiuFormatDate = myjs.xueqiuFormatDate
const getDayPercent = myjs.getDayPercent

const folder = "./data/"
async function writeToFile(dataName, dayDatas) {

    fs.writeFile(`${folder}${dataName}.json`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, 2), 'utf8', (err) => {
        if (err) {
            console.log(`${dataName}写入失败${err}`);
            return;
        }
        console.log(`${dataName}写入成功`);
    });
}
async function getDataFromFile(dataName, dataCode) {

    let promise1 = new Promise((resolve, reject) => {
        fs.readFile(`${folder}${dataName}.json`, 'utf8', (err, data) => {
            if (err) {
                resolve(false);
                return;
            }
            console.log(`\r\n${dataName} getDataFromFile`);
            if (data.indexOf("=") >= 0) {
                data = data.substring(data.indexOf("=") + 1)
            }
            resolve(JSON.parse(data))
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
        page.on('load', () => {})
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
    let dayDatas = res.data.item.map(function(data) {
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
    console.log(`\r\n${dataName} getDataFromUrl`);
    return dayDatas;
}



let logDay5 = []
let logDay5percent = ""
let log20 = []
let log30 = []
let log70 = []

function backTest(dataName, dayDatas) {

    let stockCountry = "cn"
    let showChart = false

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

    function testDayOld(currentDayList) {

        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 37) {
            dayCross = true //日低位金叉
        }

        let nDayLowCount = 0
        let haslow2 = false
        let day5percent = 0

        for (let i = 2; i < 7; i++) {
            let dayItem = currentDayList[currentDayList.length - i]
            if (dayItem.percent < 0) {
                nDayLowCount = nDayLowCount + 1 //前五日下跌天数
            }
            if (dayItem.percent < -1) {
                haslow2 = true // //前五日有下跌超-1的日子
            }
            logDay5.push(dayItem.percent)
        }
        logDay5.push(currentDay.percent)
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
        logDay5percent = day5percent
        if ((nDayLowCount >= 2) && haslow2 && (day5percent < 0)) {
            dayNlowM = true //前五日下跌幅度
        }
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

        for (let i = 2; i < 7; i++) {
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
        if (((nDayLow0Count >= 3) || (nDayLow2Count >= 1) || (day5percent <= -3)) && (currentDay.percent >= 0.2)) {
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
        if (currentMonth.ma80) {
            if (currentMonth.ma80 > currentMonth.low)
                monthLowMa = true //小于月80均线
        } else if (currentMonth.ma40) {
            if (currentMonth.ma40 > currentMonth.low)
                monthLowMa = true //小于月40均线
        }
        if (!monthLowMa) {
            if (preMonth.ma80 && (preMonth.ma80 > preMonth.low)) {
                monthLowMa = true //上月小于80均线
            }
        }
        if (stockCountry == "us") {
            if (currentMonth.ma30) {
                if (currentMonth.ma30 > currentMonth.low)
                    monthLowMa = true //小于月30均线
            }
            if (!monthLowMa) {
                if (preMonth.ma30 && (preMonth.ma30 > preMonth.low)) {
                    monthLowMa = true //上月小于30均线
                }
            }
        }


        if (preMonth.J < currentMonth.J) {
            monthJup = true //月J向上
        }
        if (pre5Month && (pre5Month.J < currentMonth.J)) {
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

    function log(currentDayList, currentWeekList, currentMonthList) {

        let currentDayIndex = currentDayList.length - 1
        let currentDay = currentDayList[currentDayIndex]
        console.log("ok", currentDay.date, logDay5, logDay5percent.toFixed(2), getDayPercent(currentDay))
        if (currentDayIndex + 70 <= dayDatas.length) {
            nextDayData = dayDatas[currentDayIndex]
            next20DayData = dayDatas[currentDayIndex + 20]
            next30DayData = dayDatas[currentDayIndex + 30]
            next50DayData = dayDatas[currentDayIndex + 50]
            next70DayData = dayDatas[currentDayIndex + 70]

            let profile20 = (next20DayData.close - nextDayData.close) / nextDayData.close * 100
            log20.push([dataName, currentDay.date, next20DayData.date, profile20])

            let profile30 = (next30DayData.close - nextDayData.close) / nextDayData.close * 100
            log30.push([dataName, currentDay.date, next30DayData.date, profile30])

            let profile70 = (next70DayData.close - nextDayData.close) / nextDayData.close * 100
            log70.push([dataName, currentDay.date, next70DayData.date, profile70])
        }
    }

    //等效setInterval循环
    for (var currentDayIndex = 70; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(80, 'close')

        testDay(currentDayList)
        testWeek(currentWeekList)
        testMonth(currentMonthList)

        let lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0
        if (lastResult) log(currentDayList, currentWeekList, currentMonthList)
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
        backTest(dataName, dayDatas)
    } catch (err) {
        console.log(err)
    }
}


let browser;
(async () => {
    browser = await puppeteer.launch({ headless: false, });

    let nameCodes = [
        { name: "上证指数_xueqiu_day", code: "SH000001" },
        //{ name: "沪深300_xueqiu_day",  code: "SH000300" },
    ]

    for (var i = 0; i < nameCodes.length; i++) {
        await getDataBack(nameCodes[i].name, nameCodes[i].code)
    }

})()