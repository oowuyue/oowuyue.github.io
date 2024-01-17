const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http');
const fs = require('fs');
const path = require('path');

const myjs = require("./jslib/my.js");

const dayToPeriod = myjs.dayToPeriod
const curtPercent = myjs.curtPercent
const myPtPPercent = myjs.myPtPPercent
const PtPPercent = myjs.PtPPercent
const curtAmp = myjs.curtAmp
const PtPAmp = myjs.PtPAmp

const folder = path.join(__dirname, "/data/新浪期货行情/")  //大宗

async function writeToFile(dataName, dayDatas, format = 2) {

    fs.writeFile(`${folder}${dataName}.js`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, format), 'utf8', (err) => {
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
            console.log(`\r\n${dataName} getDataFromFile ========`)

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
    let dayDatas = resArr.map(function (data) {
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
    console.log(`\r\n${dataName} getDataFromUrl =========`);
    return dayDatas;
}


let conditon1 = []
let conditon12 = []
let logNameDateCondAtter = []

let currentDayIndex
let endIndex
function forSetIntervalBack(dataName, dayDatas) {
    currentDayIndex = 50
    endIndex = dayDatas.length - 1
    for (; currentDayIndex <= endIndex; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex + 1).calKdj().calMacd()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj().calMacd()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj()
        let currentDay = currentDayList[currentDayList.length - 1]
        let result1 = backTest1(dataName, currentDayList, currentWeekList, currentMonthList)
        if (result1[0] === true) {// 满足conditon1且隔10天以上
            if (conditon1.length == 0 || currentDayIndex - (conditon1[conditon1.length - 1].atIndex) > 10) {
                currentDay.atIndex = currentDayIndex
                currentDay.fucked = false
                conditon1.push(currentDay)
            }
        }

        let result2 = backTest2(dataName, currentDayList, currentWeekList, currentMonthList, conditon1)
        if (result2[0] === true) {
            let cond1 = conditon1[conditon1.length - 1]
            cond1.fucked = true
            conditon12.push({
                lastconditon1: cond1,
                preIndex: currentDayIndex - cond1.atIndex,
                date: currentDay.date,
            })
            mylog(dataName, dayDatas, currentDayList, currentWeekList, currentMonthList, cond1)
        }



    }
}

function backTest1(dataName, currentDayList, currentWeekList, currentMonthList) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow5 = false
    let monthPre5Jlow0 = false
    let volumeUp = false

    function testDay(currentDayList) {

        let pre3Day = currentDayList[currentDayList.length - 4]
        let pre2Day = currentDayList[currentDayList.length - 3]
        let pre1Day = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((pre1Day.K < pre1Day.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 27) {
            dayCross = true //日低位金叉 //生猪low  糖  PVC连续&edate=2014-02-10 2022-05-11
        }

        if ((pre2Day.K < pre2Day.D) && (pre1Day.K >= pre1Day.D) && currentDay.D <= 27 && currentDay.J <= 55) {
            dayCross = true //日低位金叉 //生猪low  糖  PVC连续&edate=2014-02-10 2022-05-11
        }
        if ((pre3Day.K < pre3Day.D) && (pre2Day.K >= pre2Day.D) && currentDay.D <= 27 && currentDay.J <= 55) {
            dayCross = true //日低位金叉 //生猪low  糖  PVC连续&edate=2014-02-10 2022-05-11
        }

        let nDayLow0Count = 0
        let nDayLow2Count = 0
        let day5Allpercent = 0
        let day5 = []
        for (let i = 2; i < 7; i++) {
            let dayItem = currentDayList[currentDayList.length - i]
            let dayPercnet = curtPercent(dayItem)
            if (dayPercnet < 0) {
                nDayLow0Count = nDayLow0Count + 1 //前五日跌超0天数
            }
            if (dayPercnet < -1.55) {
                nDayLow2Count = nDayLow2Count + 1 //前五日跌超-2的天数
            }
            day5.push(dayPercnet)
        }
        day5.sort((a, b) => a - b)
        //前五日下跌幅度
        day5Allpercent = (currentDayList[currentDayList.length - 2].close - currentDayList[currentDayList.length - 6].open) / currentDayList[currentDayList.length - 6].open * 100

        if (
            (
                (nDayLow0Count >= 3) ||
                (nDayLow2Count >= 1) ||
                (day5Allpercent <= -3)
            ) &&
            (nDayLow0Count < 5) &&   //螺纹连续&edate=2014-09-10
            (1 < nDayLow0Count) &&
            (day5[0] < -0.75) &&
            (day5Allpercent <= -0.5) &&
            (-0.3 < curtPercent(currentDay))
        ) {
            dayNlowM = true
        }

    }

    function testWeek(currentWeekList) {
        let prePreWeek = currentWeekList[currentWeekList.length - 3]
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]

        weekJup = true //周J向上 

        if ((prePreWeek.K >= prePreWeek.D) && (preWeek.K < preWeek.D) && prePreWeek.K >= 35) {
            weekJup = false //周高位死叉
        }

        if ((preWeek.K >= preWeek.D) && (currentWeek.K < currentWeek.D) && preWeek.K >= 20) {//65 乙二醇low
            weekJup = false //周高位死叉
        }

        if (
            (preWeek.K >= preWeek.D)
            && (currentWeek.K >= currentWeek.D)
            && (preWeek.K > currentWeek.K)
            && (preWeek.K >= 36) //36
            && (
                ((currentWeek.K - currentWeek.D) < 0.5)
                || ((preWeek.J - currentWeek.J) > 15)  //沪锌连续&edate=2008-01-24
                || ((prePreWeek.J - preWeek.J) > 15) //棕榈油连续&edate=2022-11-2
            )
        ) {
            weekJup = false //周高位即将死叉
        }

        if (preWeek.bar > 0 && currentWeek.bar < 0) {
            weekJup = false //macd死叉 铁矿石连续&edate=2014-09-10
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
            weekJup = false //  甲醇连续&edate=2019-04-01
        }

    }

    function testMonth(currentMonthList) {

        let preMonth = currentMonthList[currentMonthList.length - 2]
        let currentMonth = currentMonthList[currentMonthList.length - 1]
        let monthJupVal = currentMonth.J - preMonth.J
        if (monthJupVal >= 0.27) { //焦炭连续&edate=2011-12-16  
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

        if (currentMonth.D > 31) {
            monthJup = false
        }

        let preMontCurPercent = curtPercent(preMonth)
        let currentMontCurPercent = curtPercent(currentMonth)
        if (preMonth
            && (preMontCurPercent > currentMontCurPercent)
            && (preMontCurPercent < 0)
            && (currentMontCurPercent < 0)
            && (+Math.abs(curtAmp(currentMonth)) > 60)
        ) monthJup = false
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
        ) { volumeUp = true }

    }

    testDay(currentDayList)
    testWeek(currentWeekList)
    testMonth(currentMonthList)
    testVolume(currentDayList, currentWeekList, currentMonthList)

    let cond1 = dayCross && dayNlowM && weekJup && monthJup && monthJlow5 && monthPre5Jlow0 && volumeUp
    return [cond1, [dayCross, dayNlowM, weekJup, monthJup, monthJlow5, monthPre5Jlow0, volumeUp]]
}

function backTest2(dataName, currentDayList, currentWeekList, currentMonthList, conditon1) {

    if (conditon1.length == 0 || conditon1[conditon1.length - 1].fucked === true || currentDayIndex - (conditon1[conditon1.length - 1].atIndex) > 32)
        return false

    let cond2 = false

    let pre3Day = currentDayList[currentDayList.length - 4]
    let pre2Day = currentDayList[currentDayList.length - 3]
    let pre1Day = currentDayList[currentDayList.length - 2]
    let currentDay = currentDayList[currentDayList.length - 1]

    let nDayLow0Count = 0
    let nDayLow2Count = 0
    let nDayLow1pot3AndAmpUp70Count = 0
    let nDayLow1AndAmpUp50Count = 0
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

        if (dayPercnet <= -1 && Math.abs(dayItem.curtAmp) >= 50) {
            nDayLow1AndAmpUp50Count = nDayLow1AndAmpUp50Count + 1 //前五日跌超-1的天数
        }
    }

    if (
        true
        && curtPercent(pre1Day) < 0
        && myPtPPercent(pre1Day, currentDay) < 0
        && curtPercent(currentDay) > 0
        && currentDay.J < 90
        && (false
            || (nDayLow0Count >= 2 || (nDayLow2Count >= 1 || nDayLow1pot3AndAmpUp70Count >= 1))
            || ((pre1Day.K < pre1Day.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 27)//刚好低位金叉
        )
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
        && (nDayLow0Count >= 2 || (nDayLow2Count >= 1 || nDayLow1pot3AndAmpUp70Count >= 1))

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
            || (pre1Day.J - currentDay.J > 30 && currentDay.K > currentDay.J && currentDay.J < 90)   //J够陡30下叉
            || (currentDay.J < 0.0 && currentDay.K > currentDay.J && pre1Day.J - currentDay.J > 1.2) //J够深0下叉

            || (true
                && (pre2Day.J - pre1Day.J > 20 || pre1Day.J - currentDay.J > 20)
                && currentDay.K > currentDay.J
                && currentDay.J < 90
                && (nDayLow2Count >= 1 || nDayLow0Count >= 3)
            )
            || (true
                && currentDay.J < 3.5
                && currentDay.K > currentDay.J
                && pre1Day.J - currentDay.J > 1.2
                && (nDayLow2Count >= 1 || nDayLow0Count >= 3)
            )
            || (
                true
                && (pre2Day.J - pre1Day.J > 13.5 || pre1Day.J - currentDay.J > 13.5)
                && (currentDay.J < 3.5 || (currentDay.J < 15 && PtPPercent(pre2Day, pre1Day) < -0.5)) //铜J4.9  生猪13.5
                && currentDay.K > currentDay.J
                && (nDayLow2Count >= 1 || nDayLow0Count >= 3)
            )
        )
    ) {
        console.log("绿空绿")
        cond2 = true

    }


//     豆油连续',
//   trigDateCod1: '2009-02-03',
//   trigDateCod1Percent: 3.42,
//   trigDate: '2009-02-17', 2009-03-03
    //if (currentDay.date == "2008-12-18" && dataName == "沪铜连续") {}


    if (
        (pre2Day.curtPercent < 0 && pre1Day.curtPercent < 0 && currentDay.curtPercent < 0)
        && PtPPercent(pre2Day, currentDay) < 0
        && currentDay.J < 90
        && (nDayLow2Count >= 1 || nDayLow1AndAmpUp50Count >= 1)
        && (false
            || (true
                && (myPtPPercent(pre1Day, currentDay) < 0 || myPtPPercent(pre2Day, pre1Day) < 0)
                && ((pre1Day.J - currentDay.J > 20 || pre2Day.J - pre1Day.J > 20) || currentDay.J < 3.5)
            )
            || ((pre2Day.J - pre1Day.J > 20 || pre1Day.J - currentDay.J > 20) && currentDay.K > currentDay.J)
            || (currentDay.J < 3.5 && pre1Day.J - currentDay.J > 1.2 && currentDay.K > currentDay.J)
        )
    ) {
        console.log("绿绿绿")
        cond2 = true
    }

    if (
        (pre3Day.curtPercent < 0 && pre2Day.curtPercent < 0 && pre1Day.curtPercent < 0)
        && PtPPercent(pre3Day, pre1Day) < 0
        && pre1Day.J < 90
        && (nDayLow2Count >= 1 || nDayLow1AndAmpUp50Count >= 1)
        && (false
            || (true
                && (myPtPPercent(pre3Day, pre2Day) < 0 || myPtPPercent(pre2Day, pre1Day) < 0)
                && ((pre3Day.J - pre2Day.J > 20 || pre2Day.J - pre1Day.J > 20) || pre1Day.J < 3.5)
            )
            || ((pre3Day.J - pre2Day.J > 20 || pre2Day.J - pre1Day.J > 20) && pre1Day.K > pre1Day.J)
            || (pre1Day.J < 3.5 && pre2Day.J - pre1Day.J > 1.2 && pre1Day.K > pre1Day.J)

            || ((pre1Day.K < pre1Day.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 27)//刚好低位金叉
        )
    ) {
        console.log("绿绿绿Pre")
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
    logProfileN.trigDateCod1Percent = curtPercent(cond1)
    logProfileN.trigDate = currentDayData.date

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

    console.log(logProfileN)

    // //测试用
    // logProfileN.trigDay6 = currentDayList.slice(-6)
    // logProfileN.trigWeek4 = currentWeekList.slice(-4)
    // logProfileN.trigMonth4 = currentMonthList.slice(-4)

    logNameDateCondAtter.push(logProfileN)
}


async function start(dataName, dataCode) {
    let dayDatas
    try {
        dayDatas = await getDataFromFile(dataName, dataCode)
        if (!dayDatas) {
            dayDatas = await getDataFromUrl(dataName, dataCode)
            writeToFile(dataName, dayDatas)
        }
        forSetIntervalBack(dataName, dayDatas)
    } catch (err) {
        console.log(err)
    }
}

let browser;
(async () => {
    console.log("========================================================================================")
    console.time("timelog")
    browser = await puppeteer.launch({ headless: "new", })

    let nameCodes = [
        //全up
        { name: "橡胶连续", code: "RU0" },
        { name: "沪铜连续", code: "CU0" },
        { name: "热卷连续", code: "HC0" },
        { name: "豆粕连续", code: "M0" },
        { name: "黄金连续", code: "AU0" },
        { name: "玻璃连续", code: "FG0" },
        { name: "20号胶连续", code: "NR0" },
        { name: "PP连续", code: "PP0" },
        { name: "液化气连续", code: "PG0" },
        { name: "白银连续", code: "AG0" },
        { name: "短纤连续", code: "PF0" },
        { name: "纸浆连续", code: "SP0" },
        { name: "苹果连续", code: "AP0" },

        // // //高up
        { name: "不锈钢连续", code: "SS0" },
        { name: "螺纹连续", code: "RB0" },
        { name: "沪锡连续", code: "SN0" },
        { name: "燃油连续", code: "FU0" },
        { name: "玉米连续", code: "C0" },
        { name: "菜油连续", code: "OI0" },
        { name: "鸡蛋连续", code: "JD0" },
        { name: "焦煤连续", code: "JM0" },
        { name: "纤维板连续", code: "FB0" },
        { name: "强麦连续", code: "WH0" },
        { name: "沪镍连续", code: "NI0" },

        // //平
        { name: "沪锌连续", code: "ZN0" },
        { name: "生猪连续", code: "LH0" },
        { name: "棕榈油连续", code: "P0" },
        { name: "棉花连续", code: "CF0" },
        { name: "PVC连续", code: "V0" },
        { name: "豆油连续", code: "Y0" },
        { name: "豆二连续", code: "B0" },
        { name: "粳米连续", code: "RR0" },
        { name: "硅铁连续", code: "SF0" },
        { name: "低硫燃料油连续", code: "LU0" },

        // //高low
        { name: "锰硅连续", code: "SM0" },
        { name: "焦炭连续", code: "J0" },
        { name: "甲醇连续", code: "MA0" },
        { name: "白糖连续", code: "SR0" },
        { name: "红枣连续", code: "CJ0" },
        { name: "花生连续", code: "PK0" },
        { name: "菜粕连续", code: "RM0" },
        { name: "豆一连续", code: "A0" },
        { name: "沪铅连续", code: "PB0" },
        { name: "棉纱连续", code: "CY0" },

        // //全low
        { name: "PTA连续", code: "TA0" },
        { name: "乙二醇连续", code: "EG0" },
        { name: "铁矿石连续", code: "I0" },
        { name: "纯碱连续", code: "SA0" },

        // // 无
        // { name: "烧碱连续", code: "SH0" },
        // { name: "尿素连续", code: "UR0" },
        // { name: "苯乙烯连续", code: "EB0" },
        // { name: "原油连续", code: "SC0" },
        // { name: "氧化铝连续", code: "AO0" },
        // { name: "航运连续", code: "EC0" },
        // { name: "塑料连续", code: "L0" },
        // { name: "对二甲苯连续", code: "PX0" },
        // { name: "胶合板连续", code: "BB0" },
        // { name: "线材连续", code: "WR0" },
        // { name: "沥青连续", code: "BU0" },
    ]


    let logAll = []
    for (var i = 0; i < nameCodes.length; i++) {
        await start(nameCodes[i].name, nameCodes[i].code)

        conditon1.forEach(item => { console.log(item.date, item.atIndex, item.fucked) })
        conditon12.forEach(item => { console.log(item.lastconditon1?.date, "<=", item.preIndex, item.date) })
        logAll = logAll.concat(logNameDateCondAtter)

        conditon1 = []
        conditon12 = []
        logNameDateCondAtter = []
    }

    let quant1Name = "大宗策略"
    logAll = `var ${quant1Name} = ` + JSON.stringify(logAll, null, 0) + "\r\n"
    fs.writeFile(`${folder}1${quant1Name}.js`, logAll, 'utf8', (err) => {
        if (err) console.log(`${quant1Name}写入失败${err}`);
        else console.log(`${quant1Name}写入成功`);
    })

    console.timeEnd("timelog")
})()

