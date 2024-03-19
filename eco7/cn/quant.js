const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {
    dayToPeriod,
    xueqiuFormatDate,
    wait,
    getDayPercent,
    curtPercent,
    PtPPercent,
    myPtPPercent,
    curtAmp,
    PtPAmp,
    writeDataToFile,
    getDataFromFile,
    mySendMail,
    currentDayYM,
    currentDayYMD
} = require("../ajslib/my.js")
const folder = path.join(__dirname, "/data/雪球行情/")

const sendMailDate = "currentYearSendMail"
function isSendMail(trigDate) {
    if (sendMailDate == "currentYearMonthSendMail") return trigDate.substring(0, 7) == currentDayYM
    if (sendMailDate == "currentYearSendMail") return trigDate.substring(0, 4) == currentDayYM.substring(0, 4)
    return false
}

let getXueQiuNowTimestamp
async function getXueQiu() {

    var browser
    var indexPage
    var visitXqIndex = async () => {
        if (await wait(10) && browser && indexPage) return

        if (os.platform == "win32") browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] })
        else browser = await puppeteer.launch({ headless: true })
        browser.on('disconnected', () => { browser = undefined; indexPage = undefined; })

        indexPage = await browser.newPage();
        await indexPage.setRequestInterception(true)
        indexPage.on('request', (request) => { request.continue() })
        indexPage.on('load', () => { })
        await indexPage.goto("https://xueqiu.com/", { waitUntil: 'networkidle2' })
    }
    await visitXqIndex()

    var getDataFromUrlFunc = async (dataName, dataCode) => {
        let startTime = 31813200000
        getXueQiuNowTimestamp = new Date().getTime()
        if (os.platform != "win32") getXueQiuNowTimestamp = getXueQiuNowTimestamp + 8 * 60 * 60 * 1000 //github Action utc
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

function backTest大盘(dataName, dayDatas, currentDayIndex, triggerLogArr) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow = false
    let monthPre5Jlow = false
    let volumeUp = false

    function testDay(currentDayList) {

        let pre2Day = currentDayList[currentDayList.length - 3]
        let pre1Day = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((pre1Day.K < pre1Day.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 55) {
            dayCross = true //日低位金叉
        }
        if ((pre2Day.K < pre2Day.D) && (pre1Day.K >= pre1Day.D) && currentDay.D <= 27 && currentDay.J <= 55) {
            dayCross = true //日低位金叉
        }

        let nDayLow0Count = 0
        let nDayLow2Count = 0
        let day5percent = 0

        for (let i = 2; i <= 6; i++) {
            let dayItem = currentDayList[currentDayList.length - i]
            if (dayItem.percent < 0) { //percent
                nDayLow0Count = nDayLow0Count + 1 //前五日跌超0天数
            }
            if (dayItem.percent < -2) {
                nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
            }
        }

        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
        if (
            ((nDayLow0Count >= 3) || (nDayLow2Count >= 1) || (day5percent <= -3)) &&
            // (nDayLow0Count < 5) &&   //螺纹连续&edate=2014-09-10
            (1 < nDayLow0Count) &&
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

        if (preWeek.bar > 0 && currentWeek.bar < 0) {
            weekJup = false //macd死叉
        }
        if (prePreWeek.bar > 0 && preWeek.bar < 0) {
            weekJup = false //macd死叉
        }

        if (
            (prePreWeek.bar > preWeek.bar)
            && (preWeek.bar > currentWeek.bar)
            && (preWeek.K > currentWeek.K)
            && (preWeek.K >= 36) //36
        ) {
            weekJup = false //macd即将死叉
        }
    }

    function testMonth(currentMonthList) {
        let pre2Month = currentMonthList[currentMonthList.length - 3]
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
        if (pre2Month && (pre2Month.J < currentMonth.J)) {
            monthJup = true //月J向上
        }


        if (currentMonth.J <= 12) {
            monthJlow = true //月j小于10,12
        }
        if (preMonth.J <= 10) {
            monthJlow = true //月j小于10,12
        }


        for (var i = 1; i < 6; i++) {
            let monthItem = currentMonthList[currentMonthList.length - i]
            if (monthItem && monthItem.J < 10) {
                monthPre5Jlow = true //前五个月有月j小于0,5,7,10
                break
            }
        }
    }

    function testVolume(currentDayList, currentWeekList, currentMonthList) {
        // volumeUp = true
        // return

        let prePreDay = currentDayList[currentDayList.length - 3]
        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]

        let prePrePreWeek = currentWeekList[currentWeekList.length - 4]
        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

        let shortDay = 3
        let longDay = 6
        let shortSum = 0
        let longSum = 0
        for (var i = 1; i <= longDay; i++) {
            let currentDay = currentDayList[currentDayList.length - i]
            if (i <= shortDay) shortSum += currentDay.volume
            longSum += currentDay.volume
        }
        if (
            ((longSum / longDay) < (shortSum / shortDay))
            || ((prePreDay.volume < preDay.volume) && (preDay.volume < currentDay.volume))
            || (preWeek.volume <= currentWeek.volume)
            || ((prePrePreWeek.volume <= prePreWeek.volume) && (prePreWeek.volume <= preWeek.volume))
            || (
                currentMonthList[currentMonthList - 2] &&
                (currentMonthList[currentMonthList - 1].volume >= currentMonthList[currentMonthList - 2].volume)
            )
        ) { volumeUp = true }

    }

    function triggerLog(currentDayList, currentWeekList, currentMonthList) {
        let currentDayIndex = currentDayList.length - 1
        let currentDayData = currentDayList[currentDayIndex]

        let logProfileN = {}
        logProfileN.name = dataName
        logProfileN.trigDate = currentDayData.date
        logProfileN.percent = currentDayData.percent
        // let afterDays = [10, 20, 100, 200]
        // for (let index = 0; index < afterDays.length; index++) {
        //     let afterDay = afterDays[index]
        //     if (currentDayIndex + afterDay <= dayDatas.length - 1) {
        //         let tmpUp = 0
        //         let tmpUpDate = []
        //         let tmpLow = 0
        //         let tmpLowDate = []
        //         for (let after = 1; after <= afterDay; after++) {
        //             let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
        //             if (profile > tmpUp) {
        //                 tmpUp = profile
        //                 tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //             if (profile < tmpLow) {
        //                 tmpLow = profile
        //                 tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //         }
        //         logProfileN[`day${afterDay}LowUp`] = [
        //             tmpLowDate,
        //             +(tmpLow * 100).toFixed(2),
        //             tmpUpDate,
        //             +(tmpUp * 100).toFixed(2)
        //         ]
        //     }
        //     else {
        //         let lastDay = dayDatas.length - 1 - currentDayIndex
        //         let tmpUp = 0
        //         let tmpUpDate = []
        //         let tmpLow = 0
        //         let tmpLowDate = []
        //         for (let after = 1; after <= lastDay; after++) {
        //             let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
        //             if (profile > tmpUp) {
        //                 tmpUp = profile
        //                 tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //             if (profile < tmpLow) {
        //                 tmpLow = profile
        //                 tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //         }
        //         logProfileN[`day${lastDay}LowUp`] = [
        //             tmpLowDate,
        //             +(tmpLow * 100).toFixed(2),
        //             tmpUpDate,
        //             +(tmpUp * 100).toFixed(2)
        //         ]
        //         break
        //     }
        // }
        // //测试用
        // logProfileN.trigDay6 = currentDayList.slice(-6)
        // logProfileN.trigWeek4 = currentWeekList.slice(-4)
        // logProfileN.trigMonth4 = currentMonthList.slice(-4)

        let hasIndex = triggerLogArr.findIndex(ele => { return ele.trigDate == currentDayData.date })
        if (hasIndex == -1) {
            if (!isSendMail(logProfileN.trigDate)) {
                console.log(logProfileN.trigDate, " new")
            } else {
                console.log(logProfileN.trigDate, " new ", sendMailDate)
                let mailMsg = dataName + "@new" + logProfileN.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                mySendMail(mailMsg)
            }
            triggerLogArr.push(logProfileN)
        }

    }

    let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
    let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
    let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(80, 'close')
    let currentDay = currentDayList[currentDayList.length - 1]

    testDay(currentDayList)
    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)

    let lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow && monthPre5Jlow && volumeUp
    if (lastResult) triggerLog(currentDayList, currentWeekList, currentMonthList)
    return triggerLogArr
}

function backTest证券(dataName, dayDatas, currentDayIndex, triggerLogArr) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow = false
    let monthPre5Jlow = false
    let volumeUp = false

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
        }


        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100
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
        let day5percent = 0
        for (let i = 1; i <= 10; i++) { //包括当日
            let dayItem = currentDayList[currentDayList.length - i]
            if (dayItem.percent <= -5) {
                nDayLow_5 = true
            }
            if (dayItem.percent >= 3) {
                nDayUp5 = true
            }
        }
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 8].open) / currentDayList[currentDayList.length - 6].open * 100

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
        let pre2Month = currentMonthList[currentMonthList.length - 3]
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
        if (pre2Month && (pre2Month.J < currentMonth.J)) {
            monthJup = true //月J向上
        }


        if (currentMonth.J <= 12) {
            monthJlow = true //月j小于10,12
        }
        if (preMonth.J <= 10) {
            monthJlow = true //月j小于10,12
        }


        for (var i = 1; i < 6; i++) {
            let monthItem = currentMonthList[currentMonthList.length - i]
            if (monthItem && monthItem.J < 10) {
                monthPre5Jlow = true //前五个月有月j小于0,5,7,10
                break
            }
        }
    }

    function testVolume(currentDayList, currentWeekList, currentMonthList) {
        // volumeUp = true
        // return

        let prePreDay = currentDayList[currentDayList.length - 3]
        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]

        let prePrePreWeek = currentWeekList[currentWeekList.length - 4]
        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

        let shortDay = 3
        let longDay = 6
        let shortSum = 0
        let longSum = 0
        for (var i = 1; i <= longDay; i++) {
            let currentDay = currentDayList[currentDayList.length - i]
            if (i <= shortDay) shortSum += currentDay.volume
            longSum += currentDay.volume
        }
        if (
            ((longSum / longDay) < (shortSum / shortDay))
            || ((prePreDay.volume < preDay.volume) && (preDay.volume < currentDay.volume))
            || (preWeek.volume <= currentWeek.volume)
            || ((prePrePreWeek.volume <= prePreWeek.volume) && (prePreWeek.volume <= preWeek.volume))
            || (
                currentMonthList[currentMonthList - 2] &&
                (currentMonthList[currentMonthList - 1].volume >= currentMonthList[currentMonthList - 2].volume)
            )

        ) { volumeUp = true }

    }

    function triggerLog(currentDayList, currentWeekList, currentMonthList) {
        let currentDayIndex = currentDayList.length - 1
        let currentDayData = currentDayList[currentDayIndex]

        let logProfileN = {}
        logProfileN.name = dataName
        logProfileN.trigDate = currentDayData.date
        logProfileN.percent = currentDayData.percent

        // let afterDays = [10, 20, 100, 200]
        // for (let index = 0; index < afterDays.length; index++) {
        //     let afterDay = afterDays[index]
        //     if (currentDayIndex + afterDay <= dayDatas.length - 1) {
        //         let tmpUp = 0
        //         let tmpUpDate = []
        //         let tmpLow = 0
        //         let tmpLowDate = []
        //         for (let after = 1; after <= afterDay; after++) {
        //             let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
        //             if (profile > tmpUp) {
        //                 tmpUp = profile
        //                 tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //             if (profile < tmpLow) {
        //                 tmpLow = profile
        //                 tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //         }
        //         logProfileN[`day${afterDay}LowUp`] = [
        //             tmpLowDate,
        //             +(tmpLow * 100).toFixed(2),
        //             tmpUpDate,
        //             +(tmpUp * 100).toFixed(2)
        //         ]
        //     }
        //     else {
        //         let lastDay = dayDatas.length - 1 - currentDayIndex
        //         let tmpUp = 0
        //         let tmpUpDate = []
        //         let tmpLow = 0
        //         let tmpLowDate = []
        //         for (let after = 1; after <= lastDay; after++) {
        //             let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
        //             if (profile > tmpUp) {
        //                 tmpUp = profile
        //                 tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //             if (profile < tmpLow) {
        //                 tmpLow = profile
        //                 tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
        //             }
        //         }
        //         logProfileN[`day${lastDay}LowUp`] = [
        //             tmpLowDate,
        //             +(tmpLow * 100).toFixed(2),
        //             tmpUpDate,
        //             +(tmpUp * 100).toFixed(2)
        //         ]
        //         break
        //     }
        // }
        // //测试用
        // logProfileN.trigDay6 = currentDayList.slice(-6)
        // logProfileN.trigWeek4 = currentWeekList.slice(-4)
        // logProfileN.trigMonth4 = currentMonthList.slice(-4)

        let hasIndex = triggerLogArr.findIndex(ele => { return ele.trigDate == currentDayData.date })
        if (hasIndex == -1) {
            if (!isSendMail(logProfileN.trigDate)) {
                console.log(logProfileN.trigDate, " new")
            } else {
                console.log(logProfileN.trigDate, " new ", sendMailDate)
                let mailMsg = dataName + "@new" + logProfileN.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                mySendMail(mailMsg)
            }
            triggerLogArr.push(logProfileN)
        }
    }

    let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
    let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
    let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(80, 'close')
    let currentDay = currentDayList[currentDayList.length - 1]

    if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0]))
        testDay2(currentDayList)
    else
        testDay(currentDayList)

    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)


    let lastResult = false
    if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0]))
        lastResult = dayCross && dayNlowM && weekJup && (monthLowMa || (monthJup && monthJlow && monthPre5Jlow) && volumeUp)
    else
        lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow && monthPre5Jlow && volumeUp

    if (lastResult) triggerLog(currentDayList, currentWeekList, currentMonthList)
    return triggerLogArr
}

async function restoreLog大盘(nameCodes) {
    var 大盘策略str = await getDataFromFile("大盘策略", folder, false, "raw")
    if (大盘策略str) eval(大盘策略str)
    if (typeof 上证指数策略 === "undefined") var 上证指数策略 = []
    if (typeof 沪深300策略 === "undefined") var 沪深300策略 = []
    if (typeof 恒生指数策略 === "undefined") var 恒生指数策略 = []

    let getLastLogDateIndexFunc = function (dataName, dayDatas) {
        let lastDayIndexIn = 70
        let triggerLogArr = []
        if (dataName.includes("上证指数")) triggerLogArr = 上证指数策略
        if (dataName.includes("沪深300")) triggerLogArr = 沪深300策略
        if (dataName.includes("恒生指数")) triggerLogArr = 恒生指数策略
        if (triggerLogArr.length > 0) {
            let lastDay = triggerLogArr[triggerLogArr.length - 1].trigDate
            lastDayIndexIn = dayDatas.findIndex(ele => { return ele.date == lastDay })
        }
        return [triggerLogArr, lastDayIndexIn]
    }
    return getLastLogDateIndexFunc
}

async function restoreLog证券(nameCodes) {
    var 证券策略str = await getDataFromFile("证券策略", folder, false, "raw")
    if (证券策略str) eval(证券策略str)

    nameCodes = nameCodes.map((item) => {
        return item.name.split('_')[0]
    })
    evalStr = ""
    nameCodes.forEach(elename => {
        evalStr += `if (typeof ${elename}策略 === "undefined") var ${elename}策略 = [];`
    })
    eval(evalStr)


    let getLastLogDateIndexFunc = function (dataName, dayDatas) {
        let lastDayIndexIn = 70
        let triggerLogArr = []
        dataName = dataName.split('_')[0]
        eval(`triggerLogArr = ${dataName}策略`)

        if (triggerLogArr.length > 0) {
            let lastDay = triggerLogArr[triggerLogArr.length - 1].trigDate
            lastDayIndexIn = dayDatas.findIndex(ele => { return ele.date == lastDay })
        }
        return [triggerLogArr, lastDayIndexIn]
    }
    return getLastLogDateIndexFunc
}


async function down1Back1(nameCodes, backName) {

    let logAllStr = ""
    let getLastLogDateIndexFunc
    if (backName == "大盘策略") getLastLogDateIndexFunc = await restoreLog大盘(nameCodes)
    if (backName == "证券策略") getLastLogDateIndexFunc = await restoreLog证券(nameCodes)

    for (let i = 0; i < nameCodes.length; i++) {
        let dataName = nameCodes[i].name
        let dataCode = nameCodes[i].code
        console.log("\r\n----------BackTest", dataName, "----------")
        let dayDatas = await getDataFromFile(dataName, folder)
        if (!dayDatas) {
            var getDataFromUrlFunc = getDataFromUrlFunc ?? await getXueQiu()
            dayDatas = await getDataFromUrlFunc(dataName, dataCode)
            console.log(`${dataName} getDataFromUrl`)
            await writeDataToFile(dataName, dayDatas, folder)
        }
        if (backName.includes("仅下载")) continue

        dayDatas = dayDatas.data.item.xueqiuData2Obj("day", os.platform)
        nameCodes[i].dayDatas = dayDatas

        let triggerLogArr = [];
        let lastLogIndex = 70;
        [triggerLogArr, lastLogIndex] = getLastLogDateIndexFunc(dataName, dayDatas)
        triggerLogArr.forEach((ele, index) => {
            if (triggerLogArr.length - 1 != index) console.log(ele.trigDate, " inlog")
            else {
                if (!isSendMail(ele.trigDate)) console.log(ele.trigDate, " inlog=>lastLogIndex:" + lastLogIndex)
                else {
                    console.log(ele.trigDate, " inlog=>lastLogIndex:" + lastLogIndex, " ", sendMailDate)
                    let mailMsg = dataName + "@inlog" + ele.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                    mySendMail(mailMsg)
                }
            }
        });

        for (let currentDayIndex = lastLogIndex + 1; currentDayIndex <= dayDatas.length - 1; currentDayIndex++) {
            if (backName == "大盘策略") triggerLogArr = backTest大盘(dataName, dayDatas, currentDayIndex, triggerLogArr)
            if (backName == "证券策略") triggerLogArr = backTest证券(dataName, dayDatas, currentDayIndex, triggerLogArr)
        }
        nameCodes[i].triggerLogArr = triggerLogArr

        logAllStr += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(triggerLogArr, null, 0) + "\r\n"
    }

    let promise = new Promise((resolve, reject) => {
        fs.writeFile(`${folder}${backName}.js`, logAllStr, 'utf8', (err) => {
            if (err) { console.log(`${backName}写入失败${err}========\r\n`); resolve(false); }
            else { console.log(`${backName}写入成功========\r\n`); resolve(true); }
        })
    })
    return promise

}

async function downAllBack(nameCodes, backName) {
    for (let i = 0; i < nameCodes.length; i++) {
        let dataName = nameCodes[i].name
        let dataCode = nameCodes[i].code
        let dayDatas = await getDataFromFile(dataName, folder)
        if (!dayDatas) {
            var getDataFromUrlFunc = getDataFromUrlFunc ?? await getXueQiu()
            dayDatas = await getDataFromUrlFunc(dataName, dataCode)
            console.log(`${dataName} getDataFromUrl`)
            await writeDataToFile(dataName, dayDatas, folder)
        }
        dayDatas = dayDatas.data.item.xueqiuData2Obj("day", os.platform)
        nameCodes[i].dayDatas = dayDatas
    }
    if (backName.includes("仅下载")) return

    let logAllStr = ""
    let getLastLogDateIndexFunc
    if (backName == "大盘策略") getLastLogDateIndexFunc = await restoreLog大盘(nameCodes)
    if (backName == "证券策略") getLastLogDateIndexFunc = await restoreLog证券(nameCodes)
    for (let i = 0; i < nameCodes.length; i++) {
        let dataName = nameCodes[i].name
        let dayDatas = nameCodes[i].dayDatas
        console.log("\r\n----------BackTest", dataName, "----------")

        let triggerLogArr = [];
        let lastLogIndex = 70;
        [triggerLogArr, lastLogIndex] = getLastLogDateIndexFunc(dataName, dayDatas);
        triggerLogArr.forEach((ele, index) => {
            if (triggerLogArr.length - 1 != index) console.log(ele.trigDate, " inlog")
            else {
                if (!isSendMail(ele.trigDate)) console.log(ele.trigDate, " inlog=>lastLogIndex:" + lastLogIndex)
                else {
                    console.log(ele.trigDate, " inlog=>lastLogIndex:" + lastLogIndex, " ", sendMailDate)
                    let mailMsg = dataName + "@inlog" + ele.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                    mySendMail(mailMsg)
                }
            }
        });

        for (let currentDayIndex = lastLogIndex + 1; currentDayIndex <= dayDatas.length - 1; currentDayIndex++) {
            if (backName == "大盘策略") triggerLogArr = backTest大盘(dataName, dayDatas, currentDayIndex, triggerLogArr)
            if (backName == "证券策略") triggerLogArr = backTest证券(dataName, dayDatas, currentDayIndex, triggerLogArr)
        }
        nameCodes[i].triggerLogArr = triggerLogArr

        logAllStr += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(triggerLogArr, null, 0) + "\r\n"
    }

    fs.writeFile(`${folder}${backName}.js`, logAllStr, 'utf8', (err) => {
        if (err) console.log(`${backName}写入失败${err}========\r\n`);
        else console.log(`${backName}写入成功=========\r\n`);
    })

}

(async () => {

    //await mySendMail("everyDay downAllBack")

    let nameCodes = [
        // { name: "上证指数_xueqiu_day", code: "SH000001" },
         { name: "沪深300_xueqiu_day", code: "SH000300" },
        // { name: "恒生指数_xueqiu_day", code: "HKHSI" },
        //{ name: "Ａ股指数_xueqiu_day", code: "SH000002" },

    ]
    await down1Back1(nameCodes, "大盘策略")


    nameCodes = [
        // { name: "中信证券_xueqiu_day", code: "SH600030" },
        // { name: "光大证券_xueqiu_day", code: "SH601788" },
        // { name: "国泰君安_xueqiu_day", code: "SH601211" },
        // { name: "中信建投_xueqiu_day", code: "SH601066" },
        // { name: "招商证券_xueqiu_day", code: "SH600999" },
        // { name: "广发证券_xueqiu_day", code: "SZ000776" },

        // { name: "东方财富_xueqiu_day", code: "SZ300059" },
        { name: "同花顺_xueqiu_day", code: "SZ300033" },
        { name: "恒生电子_xueqiu_day", code: "SH600570" },
    ]
    await downAllBack(nameCodes, "证券策略")


    // nameCodes = [
    //     { name: "华新环保_xueqiu_day", code: "SZ301265" },
    //     { name: "青岛中程_xueqiu_day", code: "SZ300208" },
    // ]
    // await downAllBack(nameCodes, "仅下载")
})()