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
    curtPercent,
    PtPPercent,
    myPtPPercent,
    curtAmp,
    PtPAmp,
    writeDataToFile,
    getDataFromFile,
    mySendMail,
    isSendMail,
    sendMailDate,
    currentDayYM,
    currentDayYMD
} = require("../ajslib/my.js")
const folder = path.join(__dirname, "/data/雪球行情/")


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
        let startTime = 31813200000;
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

async function backTest美股指数(dataName, dayDatas, currentDayIndex, triggerLogArr) {

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

        }


        //前五日下跌幅度
        day5percent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100

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


        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

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
        if (pre2Month && (pre2Month.J < currentMonth.J)) {
            monthJup = true //月J向上
        }

        if (currentMonth.ma80 && (currentMonth.ma80 > currentMonth.low)) {
            if (monthJup == false)
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

        volumeUp = true
        return

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

    async function triggerLog(currentDayList, currentWeekList, currentMonthList) {
        let currentDayIndex = currentDayList.length - 1
        let currentDayData = currentDayList[currentDayIndex]

        let logProfileN = {}
        logProfileN.name = dataName
        logProfileN.trigDate = currentDayData.date
        logProfileN.trigDatePercent = currentDayData.percent

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
                console.log(logProfileN.trigDate, "new")
            } else {
                let mailMsg = dataName + "@new" + logProfileN.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                let mailRes = await mySendMail(mailMsg).catch(console.error);
                console.log(`${logProfileN.trigDate} new,${sendMailDate}:${mailRes?.response?.substring(0, 8)}`)
            }
            triggerLogArr.push(logProfileN)
        }
        return true
    }

    let currentDayList = dayDatas.slice(0, currentDayIndex + 1).calKdj()
    let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
    let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(30, 'close').maN(80, 'close')
    let currentDay = currentDayList[currentDayList.length - 1]

    testDay(currentDayList)
    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)

    let lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow && monthPre5Jlow && volumeUp
    if (lastResult) await triggerLog(currentDayList, currentWeekList, currentMonthList)
    return triggerLogArr
}


async function restoreLog() {
    var 美股指数策略str = await getDataFromFile("美股指数策略", folder, false, "raw")
    if (美股指数策略str) eval(美股指数策略str)
    if (typeof 标普500策略 === "undefined") var 标普500策略 = []
    if (typeof 纳指策略 === "undefined") var 纳指策略 = []
    if (typeof 道琼斯策略 === "undefined") var 道琼斯策略 = []


    let getLastLogDateIndexFunc = function (dataName, dayDatas) {
        let lastDayIndexIn = 70
        let triggerLogArr = []
        if (dataName == "标普500_xueqiu_day") triggerLogArr = 标普500策略
        if (dataName == "纳指_xueqiu_day") triggerLogArr = 纳指策略
        if (dataName == "道琼斯_xueqiu_day") triggerLogArr = 道琼斯策略
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
    let getLastLogDateIndexFunc = await restoreLog()
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
        dayDatas = dayDatas.data.item.xueqiuData2Obj("day", os.platform)
        nameCodes[i].dayDatas = dayDatas
        
        let triggerLogArr = [];
        let lastLogIndex = 70;
        [triggerLogArr, lastLogIndex] = getLastLogDateIndexFunc(dataName, dayDatas);
        for (let index = 0; index < triggerLogArr.length; index++) { //https://zhuanlan.zhihu.com/p/128551597
            const ele = triggerLogArr[index];
            if (triggerLogArr.length - 1 != index) console.log(ele.trigDate, "inlog")
            else {
                if (!isSendMail(ele.trigDate)) console.log(ele.trigDate, "inlog=>lastLogIndex:" + lastLogIndex)
                else {
                    let mailMsg = dataName + "@inlog" + ele.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                    let mailRes = await mySendMail(mailMsg).catch(console.error);
                    console.log(`${ele.trigDate} inlog=>lastLogIndex: ${lastLogIndex},${sendMailDate}:${mailRes?.response?.substring(0, 8)}`)
                }
            }
        }

        for (let currentDayIndex = lastLogIndex + 1; currentDayIndex <= dayDatas.length - 1; currentDayIndex++) {
            triggerLogArr = await backTest美股指数(dataName, dayDatas, currentDayIndex, triggerLogArr)
        }
        nameCodes[i].triggerLogArr = triggerLogArr

        logAllStr += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(triggerLogArr, null, 0) + "\r\n"
    }

    let promise = new Promise((resolve, reject) => {
        fs.writeFile(`${folder}${backName}.js`, logAllStr, 'utf8', (err) => {
            if (err) { console.log(`${backName}写入失败${err}`); resolve(false); }
            else { console.log(`${backName}写入成功`); resolve(true); }
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
            await writeDataToFile(dataName, dayDatas, folder)
        }
        dayDatas = dayDatas.data.item.xueqiuData2Obj("day", os.platform)
        nameCodes[i].dayDatas = dayDatas
    }

    let logAllStr = ""
    let getLastLogDateIndexFunc = await restoreLog()
    for (let i = 0; i < nameCodes.length; i++) {
        let dataName = nameCodes[i].name
        let dayDatas = nameCodes[i].dayDatas
        console.log("\r\n----------BackTest", dataName, "----------")
        let triggerLogArr = [];
        let lastLogIndex = 70;
        [triggerLogArr, lastLogIndex] = getLastLogDateIndexFunc(dataName, dayDatas);
        for (let index = 0; index < triggerLogArr.length; index++) { //https://zhuanlan.zhihu.com/p/128551597
            const ele = triggerLogArr[index];
            if (triggerLogArr.length - 1 != index) console.log(ele.trigDate, "inlog")
            else {
                if (!isSendMail(ele.trigDate)) console.log(ele.trigDate, "inlog=>lastLogIndex:" + lastLogIndex)
                else {
                    let mailMsg = dataName + "@inlog" + ele.trigDate + ":From:" + os.platform + ":" + getXueQiuNowTimestamp
                    let mailRes = await mySendMail(mailMsg).catch(console.error);
                    console.log(`${ele.trigDate} inlog=>lastLogIndex: ${lastLogIndex},${sendMailDate}:${mailRes?.response?.substring(0, 8)}`)
                }
            }
        }

        for (let currentDayIndex = lastLogIndex + 1; currentDayIndex <= dayDatas.length - 1; currentDayIndex++) {
            triggerLogArr = await backTest美股指数(dataName, dayDatas, currentDayIndex, triggerLogArr)
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


(async () => {
    await mySendMail("everyDay backTest美股指数")
    
    let nameCodes = [
        { name: "标普500_xueqiu_day", code: ".INX" },
        { name: "纳指_xueqiu_day", code: ".IXIC" },
        { name: "道琼斯_xueqiu_day", code: ".DJI" },
    ]
    await downAllBack(nameCodes, "美股指数策略")

})()
