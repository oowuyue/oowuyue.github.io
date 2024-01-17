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

const folder = "./data/xqStocks/"

function writeToFile(dataName, dayDatas) {
    try {
        fs.writeFileSync(`${folder}${dataName}.js`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, 2), 'utf8')
        console.log(`${dataName}写入成功`)
    } catch (err) {
        console.log(`${dataName}写入失败${err}`)
    }
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

        //先访问页面? //手动的登陆同花顺editthiscookie插件复制cookie
        const page = await browser.newPage();
        // let xq_cookie = []
        // for (let i = 0; i < xq_cookie.length; i++) {
        //     await page.setCookie(xq_cookie[i]);
        // }
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })
        page.on('load', () => { })
        await page.goto("https://xueqiu.com/", { waitUntil: 'networkidle2' })


        function wait(ms) {
            return new Promise(resolve => setTimeout(() => resolve(), ms))
        }
        await wait(Math.random() * 2000)

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
                        resolve(resdata)//返回json
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

function backTest大盘(dataName, dayDatas) {

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
            (currentDay.percent >= 0.2) &&
            (getDayPercent(currentDay) >= 0.1)
        ) {
            dayNlowM = true
        }

    }

    function testWeek(currentWeekList) {
        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

        weekJup = true //周J向上 

        if ((preWeek.K >= preWeek.D) && (currentWeek.K < currentWeek.D) && preWeek.K > 65) {
            weekJup = false //周高位死叉
        }
        if ((prePreWeek.K >= prePreWeek.D) && (preWeek.K < preWeek.D) && prePreWeek.K > 65) {
            weekJup = false //周高位死叉
        }

        if ((preWeek.K >= preWeek.D) &&
            (currentWeek.K >= currentWeek.D) &&
            ((currentWeek.K - currentWeek.D) < 0.5) &&
            (preWeek.K > currentWeek.K) &&
            (preWeek.K > 65)
        ) {
            weekJup = false //周高位即将死叉
        }
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

    function mylog(currentDayList, currentWeekList, currentMonthList) {
        let currentDayIndex = currentDayList.length - 1
        let currentDay = currentDayList[currentDayIndex]
        console.log("ok", currentDay.date, logDay5, logDay5percent, getDayPercent(currentDay))
        logDates.push([currentDay.date, getDayPercent(currentDay)])
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
        if (lastResult) mylog(currentDayList, currentWeekList, currentMonthList)
        restAction()
    }
    //等效setInterval循环
}

function backTest证券(dataName, dayDatas) {

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
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 50) {
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
            if (dayItem.percent < -5) {
                nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
            }
            logDay5.push(dayItem.percent)
        }
        logDay5.sort((a, b) => a - b)

        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
        logDay5percent = day5percent
        if (((nDayLow0Count >= 3) || (nDayLow2Count >= 1) || (day5percent <= -5)) &&
            (day5percent < -0.5) &&
            (currentDay.percent >= 0.2) &&
            (getDayPercent(currentDay) >= 0.1)
        ) {
            dayNlowM = true
        }

    }

    function testDay2(currentDayList) {

        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 50) {
            dayCross = true //日低位金叉
        }

        let nDayLow_5 = false
        let nDayUp5 = false
        for (let i = 1; i <= 10; i++) { //包括当日
            let dayItem = currentDayList[currentDayList.length - i]
            if (dayItem.percent <= -5) {
                nDayLow_5 = true
            }
            if (dayItem.percent >= 3) {
                nDayUp5 = true
            }
            logDay5.push(dayItem.percent)
        }
        logDay5.reverse()
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 8].open) / currentDayList[currentDayList.length - 6].open * 100
        logDay5percent = day5percent //不包括当日    东方财富2010-03-19   同花顺2009-12-25


        if (
            nDayLow_5 &&
            nDayUp5 &&
            (day5percent < -0.5) &&
            (currentDay.percent >= 0.3) &&
            (getDayPercent(currentDay) >= 0.2) &&
            (currentDayList.length > 300)
        ) {
            dayNlowM = true
        }
    }

    function testWeek(currentWeekList) {

        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

        weekJup = true //周J向上 

        if ((preWeek.K >= preWeek.D) && (currentWeek.K < currentWeek.D) && preWeek.K > 65) {
            weekJup = false //周高位死叉
        }
        if ((prePreWeek.K >= prePreWeek.D) && (preWeek.K < preWeek.D) && prePreWeek.K > 65) {
            weekJup = false //周高位死叉
        }

        if ((preWeek.K >= preWeek.D) &&
            (currentWeek.K >= currentWeek.D) &&
            ((currentWeek.K - currentWeek.D) < 0.5) &&
            (preWeek.K > currentWeek.K) &&
            (preWeek.K > 65)
        ) {
            weekJup = false //周高位即将死叉
        }


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

        if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0])) {
            if (currentMonth.ma60) {
                if (currentMonth.ma60 > currentMonth.low)
                    monthLowMa = true //小于月80均线
            } else if (currentMonth.ma60) {
                if (currentMonth.ma60 > currentMonth.low)
                    monthLowMa = true //小于月40均线
            }
            if (!monthLowMa) {
                if (preMonth.ma60 && (preMonth.ma60 > preMonth.low)) {
                    monthLowMa = true //上月小于80均线
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

    function myLog(currentDayList, currentWeekList, currentMonthList) {

        let currentDayIndex = currentDayList.length - 1
        let currentDay = currentDayList[currentDayIndex]

        console.log("ok", currentDay.date, logDay5, logDay5percent.toFixed(2), currentDay.percent, getDayPercent(currentDay))
        logDates.push([currentDay.date, getDayPercent(currentDay)])

    } //logend

    //等效setInterval循环
    for (var currentDayIndex = 70; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(60, 'close').maN(80, 'close')

        if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0])) {
            testDay2(currentDayList)
        } else {
            testDay(currentDayList)
        }

        testWeek(currentWeekList)
        testMonth(currentMonthList)


        let currentDayDate = currentDayList[currentDayList.length - 1].date
        if (currentDayDate == "2018-10-191") {
            console.log(dataName, currentDayDate, logDay5, dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0)
        }


        let lastResult = false
        if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0])) {
            lastResult = dayCross && dayNlowM && weekJup && (monthLowMa || (monthJup && monthJlow5 && monthPre5Jlow0))
        } else {
            lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0
        }

        if (lastResult) myLog(currentDayList, currentWeekList, currentMonthList)
        restAction()
    }
    //等效setInterval循环
}

async function getDataBack(dataName, dataCode, quantName) {
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
        if (quantName == "大盘策略") backTest大盘(dataName, dayDatas)
        if (quantName == "证券策略") backTest证券(dataName, dayDatas)

    } catch (err) {
        console.log(err)
    }
}

let browser; //中途不要关闭
(async () => {
    browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });


    let quantName = "大盘策略"
    let nameCodes = [
        { name: "上证指数_xueqiu_day", code: "SH000001" },
        { name: "沪深300_xueqiu_day", code: "SH000300" },
    ]
    let logAllDates = ""
    for (var i = 0; i < nameCodes.length; i++) {
        await getDataBack(nameCodes[i].name, nameCodes[i].code, quantName)
        logAllDates += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(logDates, null, 0) + "\r\n"
        logDates = []
    }
    fs.writeFile(`${folder}${quantName}.js`, logAllDates, 'utf8', (err) => {
        if (err) console.log(`${quantName}写入失败${err}`);
        else console.log(`${quantName}写入成功`);
    })


    return
    quantName = "证券策略"
    nameCodes = [
        { name: "中信证券_xueqiu_day", code: "SH600030" },
        { name: "光大证券_xueqiu_day", code: "SH601788" },
        { name: "国泰君安_xueqiu_day", code: "SH601211" },
        { name: "中信建投_xueqiu_day", code: "SH601066" },
        { name: "招商证券_xueqiu_day", code: "SH600999" },
        { name: "广发证券_xueqiu_day", code: "SZ000776" },

        { name: "东方财富_xueqiu_day", code: "SZ300059" },
        { name: "同花顺_xueqiu_day", code: "SZ300033" },
        { name: "恒生电子_xueqiu_day", code: "SH600570" },
    ]
    logAllDates = ""
    for (var i = 0; i < nameCodes.length; i++) {
        await getDataBack(nameCodes[i].name, nameCodes[i].code, quantName)
        logAllDates += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(logDates, null, 0) + "\r\n"
        logDates = []
    }
    fs.writeFile(`${folder}${quantName}.js`, logAllDates, 'utf8', (err) => {
        if (err) console.log(`${quantName}写入失败${err}`);
        else console.log(`${quantName}写入成功`);
    })


})()

