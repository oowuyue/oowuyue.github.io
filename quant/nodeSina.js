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

const folder = "./data/sinaFutures/"
async function writeToFile(dataName, dayDatas, format = 2) {

    fs.writeFile(`${folder}${dataName}.json`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, format), 'utf8', (err) => {
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
            console.log(`\r\n${dataName} getDataFromFile`)

            if (data.indexOf("=") >= 0) {
                data = data.substring(data.indexOf("=") + 1)
            }
            resolve(JSON.parse(data))
        })
    })
    return promise1
}
async function getDataFromUrl(dataName, dataCode) {

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
    };

    let res
    if (dataName.includes("us"))
        res = await taskPage(dataName, "sina", `https://finance.sina.com.cn/futures/quotes/${dataCode}.shtml`, "GlobalFuturesService.getGlobalFuturesDailyKLine?symbol=");
    else
        res = await taskPage(dataName, "sina", `https://finance.sina.com.cn/futures/quotes/${dataCode}.shtml`, "InnerFuturesNewService.getDailyKLine?symbol=");

    let resStr = res.resdata.match(/\[.*\]/sg);
    let resArr = JSON.parse(resStr);
    let dayDatas = resArr.map(function(data) {
        if (dataName.includes("us"))
            return {
                date: data.date,
                timestamp: new Date(data.date).getTime(),
                open: +data.open,
                high: +data.high,
                low: +data.low,
                close: +data.close,
                percent: 0,
                volume: Math.ceil(+data.volume),
            }
        else
            return {
                date: data.d,
                timestamp: new Date(data.d).getTime(),
                open: +data.o,
                high: +data.h,
                low: +data.l,
                close: +data.c,
                percent: 0,
                volume: Math.ceil(+data.v),
            }
    });
    console.log(`\r\n${dataName} getDataFromUrl`);
    return dayDatas;
}


let logDay5 = []
let logDay5percent = ""
let log20 = []
let log30 = []
let log70 = []

function backTest2(dataName, dayDatas) {

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

    function testDay(currentDayList) {

        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 50) {
            dayCross = true //日低位金叉
        }


        let nDayLow0Count = 0
        let nDayLow2Count = 0
        let day5percent = 0
        for (let i = 2; i < 7; i++) {
            let dayItem = currentDayList[currentDayList.length - i]
            let dayPercnet = getDayPercent(dayItem)
            if (dayPercnet < 0) {
                nDayLow0Count = nDayLow0Count + 1 //前五日跌超0天数
            }
            if (dayPercnet < -2) {
                nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
            }
            logDay5.push(dayPercnet)
        }
        logDay5.sort((a, b) => a - b)
        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
        logDay5percent = day5percent

        if (
            (
                (nDayLow0Count >= 2) ||
                (nDayLow2Count >= 1) ||
                (day5percent <= -3)
            ) &&
            (nDayLow0Count < 5) &&
            (1 < nDayLow0Count) &&
            (day5percent <= -0.5) &&
            (-0.43 < getDayPercent(currentDay))
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
        let monthJupVal = currentMonth.J - preMonth.J
        if (monthJupVal >= 0.2) {
            monthJup = true //月J向上 
        }
        if (currentMonth.J <= 7) {
            monthJlow5 = true //月j小于5 7 10 12
        }
        for (var i = 1; i < 6; i++) {
            let monthItem = currentMonthList[currentMonthList.length - i]
            if (monthItem && monthItem.J <= 2) {
                monthPre5Jlow0 = true //前五个月有月j小于0 2 3 5 7
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
    for (var currentDayIndex = 50; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj()

        testDay(currentDayList)
        testWeek(currentWeekList)
        testMonth(currentMonthList)

        let lastResult = dayCross && dayNlowM && weekJup && monthJup && monthJlow5 && monthPre5Jlow0
        if (lastResult) log(currentDayList, currentWeekList, currentMonthList)
        restAction()
    }
    //等效setInterval循环
}

async function start(dataName, dataCode) {
    let dayDatas
    try {
        dayDatas = await getDataFromFile(dataName, dataCode)
        if (!dayDatas) {
            dayDatas = await getDataFromUrl(dataName, dataCode)
            writeToFile(dataName, dayDatas)
        }
        backTest2(dataName, dayDatas)
    } catch (err) {
        console.log(err)
    }
}

let browser;
(async () => {

    browser = await puppeteer.launch({ headless: true, })

    let nameCodes = [
        // //全up
        // { name: "橡胶连续", code: "RU0" },
        // { name: "沪铜连续", code: "CU0" },
        // { name: "热卷连续", code: "HC0" },
        // { name: "豆粕连续", code: "M0" },
        // { name: "黄金连续", code: "AU0" },
        // { name: "玻璃连续", code: "FG0" },
        // { name: "20号胶连续", code: "NR0" },
        // { name: "PP连续", code: "PP0" },
        // { name: "液化气连续", code: "PG0" },
        // { name: "白银连续", code: "AG0" },
        // { name: "短纤连续", code: "PF0" },
        // { name: "纸浆连续", code: "SP0" },
        // { name: "苹果连续", code: "AP0" },

        // //高up
        { name: "不锈钢连续", code: "SS0" },
        // { name: "螺纹连续", code: "RB0" },
        // { name: "锡连续", code: "SN0" },
        // { name: "燃油连续", code: "FU0" },
        // { name: "玉米连续", code: "C0" },
        // { name: "菜油连续", code: "OI0" },
        // { name: "鸡蛋连续", code: "JD0" },
        // { name: "焦煤连续", code: "JM0" },
        // { name: "纤维板连续", code: "FB0" },
        // { name: "强麦连续", code: "WH0" },

        // // 平
        // { name: "沪锌连续", code: "ZN0" },
        // { name: "生猪连续", code: "LH0" },
        // { name: "棕榈油连续", code: "P0" },
        // { name: "棉花连续", code: "CF0" },
        // { name: "沪镍连续", code: "NI0" },
        // { name: "PVC连续", code: "V0" },
        // { name: "豆油连续", code: "Y0" },
        // { name: "豆二连续", code: "B0" },
        // { name: "PTA连续", code: "TA0" },
        // { name: "粳米连续", code: "RR0" },
        // { name: "硅铁连续", code: "SF0" },
        // { name: "低硫燃料油连续", code: "LU0" },


        // //高low
        // { name: "锰硅连续", code: "SM0" },
        // { name: "焦炭连续", code: "J0" },
        // { name: "甲醇连续", code: "MA0" },
        // { name: "白糖连续", code: "SR0" },
        // { name: "红枣连续", code: "CJ0" },
        // { name: "花生连续", code: "PK0" },
        // { name: "菜粕连续", code: "RM0" },
        // { name: "豆一连续", code: "A0" },
        //  { name: "铅连续", code: "PB0" },

        // //全low
        // { name: "PTA连续", code: "TA0" },
        // { name: "乙二醇连续", code: "EG0" },
        // { name: "铁矿石连续", code: "I0" },


        // //无
        // { name: "纯碱连续", code: "SA0" },
        // { name: "烧碱连续", code: "SH0" },
        // { name: "尿素连续", code: "UR0" },
        // { name: "苯乙烯连续", code: "EB0" },
        // { name: "原油连续", code: "SC0" },
        // { name: "氧化铝连续", code: "AO0" },
        // { name: "航运连续", code: "EC0" },
        // { name: "塑料连续", code: "L0" },
        // { name: "对二甲苯连续", code: "PX0" },
        // { name: "胶合板连续", code: "BB0" },
        // { name: "棉纱连续", code: "CY0" },
        // { name: "线材连续", code: "WR0" },
        // { name: "沥青连续", code: "BU0" },
    ]

    for (var i = 0; i < nameCodes.length; i++) {
        await start(nameCodes[i].name, nameCodes[i].code)

        log20.sort((a, b) => a[3] - b[3])
        log30.sort((a, b) => a[3] - b[3])
        log70.sort((a, b) => a[3] - b[3])
        console.log(log20, log30, log70)
        log20 = []
        log30 = []
        log70 = []
    }

    // writeToFile("2log20", log20, 0)
    // writeToFile("2log30", log30, 0)
    // writeToFile("2log70", log70, 0)
})()