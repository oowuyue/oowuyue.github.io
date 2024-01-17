const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra 
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');

const myjs = require("./jslib/my.js");
const dayToPeriod = myjs.dayToPeriod
const xueqiuFormatDate = myjs.xueqiuFormatDate
const getDayPercent = myjs.getDayPercent

const curtPercent = myjs.curtPercent
const myPtPPercent = myjs.myPtPPercent
const PtPPercent = myjs.PtPPercent
const curtAmp = myjs.curtAmp
const PtPAmp = myjs.PtPAmp

const folder = path.join(__dirname, "/data/雪球行情/") //大盘

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


let conditon1 = []
let conditon12 = []
let logNameDateCondAtter = []

let currentDayIndex
let endIndex
function forSetIntervalBack(dataName, dayDatas, quantName) {
    currentDayIndex = 50
    endIndex = dayDatas.length - 1
    for (; currentDayIndex <= endIndex; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(80, 'close')
        let currentDay = currentDayList[currentDayList.length - 1]

        let result1 = [false]
        if (quantName == "大盘策略")
            result1 = backTest大盘(dataName, currentDayList, currentWeekList, currentMonthList)
        if (quantName == "证券策略")
            result1 = backTest证券(dataName, currentDayList, currentWeekList, currentMonthList)

        if (result1[0] === true) {
            if (conditon1.length == 0 || currentDayIndex - (conditon1[conditon1.length - 1].atIndex) > 3) {
                currentDay.atIndex = currentDayIndex
                currentDay.fucked = false
                conditon1.push(currentDay)
                mylog(dataName, dayDatas, currentDayList, currentWeekList, currentMonthList, currentDay)
            }
        }

        // let result2 = backTest2(dataName, currentDayList, currentWeekList, currentMonthList, conditon1)
        // if (result2[0] === true) {
        //     let cond1 = conditon1[conditon1.length - 1]
        //     cond1.fucked = true
        //     conditon12.push({
        //         lastconditon1: cond1,
        //         preIndex: currentDayIndex - cond1.atIndex,
        //         date: currentDay.date,
        //     })
        //     mylog(dataName, dayDatas, currentDayList, currentWeekList, currentMonthList, cond1)
        // }

    }//for-end

}

function backTest大盘(dataName, currentDayList, currentWeekList, currentMonthList) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow5 = false
    let monthPre5Jlow0 = false
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

    testDay(currentDayList)
    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)

    let cond1 = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0 && volumeUp

    let currentDay = currentDayList[currentDayList.length - 1]
    // if (currentDay.date == "2009-01-05" && dataName == "上证指数_xueqiu_day") {
    //     console.log([cond1, [dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0, volumeUp]])
    // }
    return [cond1, [dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0, volumeUp]]
}

function backTest证券(dataName, currentDayList, currentWeekList, currentMonthList) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow5 = false
    let monthPre5Jlow0 = false
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

    if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0]))
        testDay2(currentDayList)
    else
        testDay(currentDayList)

    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)


    let cond1 = false
    if (["东方财富", "恒生电子", "同花顺"].includes(dataName.split("_")[0]))
        cond1 = dayCross && dayNlowM && weekJup && (monthLowMa || (monthJup && monthJlow5 && monthPre5Jlow0) && volumeUp)
    else
        cond1 = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0 && volumeUp

    return [cond1, [dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0, volumeUp]]
}

function backTest2(dataName, currentDayList, currentWeekList, currentMonthList, conditon1) {

    if (conditon1.length == 0 || conditon1[conditon1.length - 1].fucked === true || currentDayIndex - (conditon1[conditon1.length - 1].atIndex) > 32)
        return false

    let cond2 = false

    let pre2Day = currentDayList[currentDayList.length - 3]
    let pre1Day = currentDayList[currentDayList.length - 2]
    let currentDay = currentDayList[currentDayList.length - 1]

    let nDayLow0Count = 0
    let nDayLow2Count = 0
    let nDayLow1pot3AndAmpUp70Count = 0
    let day5 = []
    for (let i = 1; i < 6; i++) {
        let dayItem = currentDayList[currentDayList.length - i]
        let dayPercnet = curtPercent(dayItem)
        dayItem.curtPercent = dayPercnet
        dayItem.curtAmp = curtAmp(dayItem)
        day5.unshift(dayItem)
        if (dayPercnet < 0) {
            nDayLow0Count = nDayLow0Count + 1 //前五日跌超0天数 包含今天
        }
        if (dayPercnet < -2) {
            nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
        }

        if (dayPercnet <= -1.3 && Math.abs(dayItem.curtAmp) >= 70) {
            nDayLow1pot3AndAmpUp70Count = nDayLow1pot3AndAmpUp70Count + 1 //前五日跌超-1.3的天数
        }
    }


    if (
        true
        && curtPercent(pre1Day) < 0
        && myPtPPercent(pre1Day, currentDay) < 0
        && curtPercent(currentDay) > 0
        && currentDay.J < 90
        && (nDayLow0Count >= 2 || (nDayLow2Count >= 1 || nDayLow1pot3AndAmpUp70Count >= 1))
    ) {
        console.log("绿空红")
        cond2 = true
    }

    if (
        true
        && curtPercent(pre2Day) < 0
        && myPtPPercent(pre2Day, pre1Day) < 0
        && curtPercent(pre1Day) > 0
        && currentDay.J < 90
        && (nDayLow0Count >= 2 || (nDayLow2Count >= 1 || nDayLow1pot3AndAmpUp70Count >= 1))  //

    ) {
        console.log("绿空红Pre")
        cond2 = true
    }

    if (
        true
        && curtPercent(pre1Day) < 0
        && myPtPPercent(pre1Day, currentDay) < 0
        && curtPercent(currentDay) < 0
        && (false
            || (pre1Day.J - currentDay.J > 30 && currentDay.K > currentDay.J) //J够陡30下叉
            || (currentDay.J < 0.0 && pre1Day.J - currentDay.J > 1.2 && currentDay.K > currentDay.J) //J够深0下叉

            || (currentDay.J < 3.5 && pre1Day.J - currentDay.J > 1.2 && currentDay.K > currentDay.J) && (nDayLow2Count >= 1 || nDayLow0Count >= 3)
            || (
                true
                && (
                    false
                    || (pre2Day.J - pre1Day.J > 20 || pre1Day.J - currentDay.J > 20)
                    || (pre1Day.J - currentDay.J > 10 && currentDay.J < 35)//铜J4.9
                )
                && currentDay.K > currentDay.J
                && (nDayLow2Count >= 1 || curtPercent(pre2Day) < 0)
            ))
    ) {
        console.log("绿空绿")
        cond2 = true
    }


    if (
        (day5[2].curtPercent < 0 && day5[3].curtPercent < 0 && day5[4].curtPercent < 0)
        && PtPPercent(day5[2], day5[4]) < 0
        && (nDayLow2Count >= 1 || nDayLow1pot3AndAmpUp70Count >= 1)
        && (false
            || ((pre2Day.J - pre1Day.J > 20 || pre1Day.J - currentDay.J > 20) && currentDay.K > currentDay.J)
            || (currentDay.J < 3.5 && pre1Day.J - currentDay.J > 1.2 && currentDay.K > currentDay.J)
        )
    ) {
        console.log("绿绿绿")
        cond2 = true
    }

    return [cond2]
}

function mylog(dataName, dayDatas, currentDayList, currentWeekList, currentMonthList, cond1) {

    let currentDayIndex = currentDayList.length - 1
    let currentDayData = currentDayList[currentDayIndex]

    let logProfileN = {}
    logProfileN.name = dataName
    logProfileN.trigDateCod1 = cond1.date
    logProfileN.trigDate = currentDayData.date
    logProfileN.trigDatePercent = currentDayData.percent

    let afterDays = [10, 20, 100, 200]
    for (let index = 0; index < afterDays.length; index++) {
        let afterDay = afterDays[index]
        if (currentDayIndex + afterDay <= dayDatas.length - 1) {
            logProfileN[`day${afterDay}`] = +((dayDatas[currentDayIndex + afterDay].close - currentDayData.close) / currentDayData.close * 100).toFixed(2)
        } else {
            let lastDay = dayDatas.length - 1 - currentDayIndex
            logProfileN[`day${lastDay}`] = +((dayDatas[dayDatas.length - 1].close - currentDayData.close) / currentDayData.close * 100).toFixed(2)
            logProfileN[`lastDay`] = lastDay
            break
        }
    }

    for (let index = 0; index < afterDays.length; index++) {
        let afterDay = afterDays[index]
        if (currentDayIndex + afterDay <= dayDatas.length - 1) {
            let tmpUp = 0
            let tmpUpDate = []
            let tmpLow = 0
            let tmpLowDate = []
            for (let after = 1; after <= afterDay; after++) {
                let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
                if (profile > tmpUp) {
                    tmpUp = profile
                    tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
                }
                if (profile < tmpLow) {
                    tmpLow = profile
                    tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
                }
            }
            logProfileN[`day${afterDay}LowUp`] = [
                tmpLowDate,
                +(tmpLow * 100).toFixed(2),
                tmpUpDate,
                +(tmpUp * 100).toFixed(2)
            ]
        }
        else {
            let lastDay = dayDatas.length - 1 - currentDayIndex
            let tmpUp = 0
            let tmpUpDate = []
            let tmpLow = 0
            let tmpLowDate = []
            for (let after = 1; after <= lastDay; after++) {
                let profile = (dayDatas[currentDayIndex + after].close - currentDayData.close) / currentDayData.close
                if (profile > tmpUp) {
                    tmpUp = profile
                    tmpUpDate = [after, dayDatas[currentDayIndex + after].date]
                }
                if (profile < tmpLow) {
                    tmpLow = profile
                    tmpLowDate = [after, dayDatas[currentDayIndex + after].date]
                }
            }
            logProfileN[`day${lastDay}LowUp`] = [
                tmpLowDate,
                +(tmpLow * 100).toFixed(2),
                tmpUpDate,
                +(tmpUp * 100).toFixed(2)
            ]
            break
        }
    }

    console.log(logProfileN.trigDate)

    // //测试用
    // logProfileN.trigDay6 = currentDayList.slice(-6)
    // logProfileN.trigWeek4 = currentWeekList.slice(-4)
    // logProfileN.trigMonth4 = currentMonthList.slice(-4)

    logNameDateCondAtter.push(logProfileN)
}

let browser = null
async function start(dataName, dataCode, quantName) {
    let dayDatas
    try {
        dayDatas = await getDataFromFile(dataName, dataCode)
        if (!dayDatas) {
            if (browser === null) browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] })
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

        forSetIntervalBack(dataName, dayDatas, quantName)

    } catch (err) {
        console.log(err)
    }
}

(async () => {

    let quant1Name = "大盘策略"
    let nameCodes = [
        { name: "上证指数_xueqiu_day", code: "SH000001" },
        { name: "沪深300_xueqiu_day", code: "SH000300" },
    ]

    let logAllDates = ""
    for (var i = 0; i < nameCodes.length; i++) {
        await start(nameCodes[i].name, nameCodes[i].code, quant1Name)
        logAllDates += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(logNameDateCondAtter, null, 0) + "\r\n"

        //conditon1.forEach(item => { console.log(item.date, item.atIndex, item.fucked) })
        //conditon12.forEach(item => { console.log(item.lastconditon1?.date, "<=", item.preIndex, item.date) })

        conditon1 = []
        conditon12 = []
        logNameDateCondAtter = []
    }
    fs.writeFile(`${folder}${quant1Name}.js`, logAllDates, 'utf8', (err) => {
        if (err) console.log(`${quant1Name}写入失败${err}`);
        else console.log(`${quant1Name}写入成功`);
    })


    let quant2Name = "证券策略"
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
        await start(nameCodes[i].name, nameCodes[i].code, quant2Name)
        logAllDates += `var ${nameCodes[i].name.split("_")[0]}策略 = ` + JSON.stringify(logNameDateCondAtter, null, 0) + "\r\n"

        conditon1 = []
        conditon12 = []
        logNameDateCondAtter = []
    }
    fs.writeFile(`${folder}${quant2Name}.js`, logAllDates, 'utf8', (err) => {
        if (err) console.log(`${quant2Name}写入失败${err}`);
        else console.log(`${quant2Name}写入成功`);
    })


})()

