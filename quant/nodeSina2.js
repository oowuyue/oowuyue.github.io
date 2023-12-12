const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');
const folder = "./data/"

function isMonthLastDay(ymd) {
    //"2000-01-09" 传入年份和月份 获取该年对应月份的天数 第三个参数是0，第二个参数是人类意识中的月份
    let monthDays = new Date(ymd.substring(0, 4), ymd.substring(5, 7), 0).getDate() //月的天数
    return monthDays == parseInt(ymd.substring(8, 10))
}

function pre5Month(ym) {
    //"2000-09"
    let result = []
    let year = parseInt(ym.substring(0, 4))
    let month = parseInt(ym.substring(5, 7))
    if (month >= 5) {
        for (var i = 4; i >= 0; i--) {
            let m = (month - i) >= 10 ? "" + (month - i) : "0" + (month - i)
            result.push("" + year + "-" + m)
        }
    } else {
        // 11 12   1 2 3
        let preYCount = 5 - month
        for (var i = preYCount; i > 0; i--) {
            let m = (13 - i) >= 10 ? "" + (13 - i) : "0" + (13 - i)
            result.push("" + (year - 1) + "-" + m)
        }
        for (var i = 1; i <= month; i++) {
            let m = i >= 10 ? "" + i : "0" + i
            result.push("" + (year) + "-" + m)
        }

    }
    return result
}

function isSameWeek(d1, d2) {
    if (d1 == "" || d2 == "") return false
    d1 = new Date(d1)
    d2 = new Date(d2)
    const ONE_DAY = 1000 * 60 * 60 * 24
    const difftime = Math.abs(d2 - d1)
    let bigDay = (d1 > d2 ? d1.getDay() : d2.getDay()) || 7
    let smallDay = (d1 < d2 ? d1.getDay() : d2.getDay()) || 7
    return !(difftime >= ONE_DAY * 7 || bigDay < smallDay || (bigDay === smallDay && difftime > ONE_DAY))
}

function dayToPeriod(dayIndexList, period) {

    let open, high, low, close, volume
    let preDayIndexDate = ""
    let periodIndexList = []
    let dayIndexListLastIndex = dayIndexList.length - 1

    dayIndexList.forEach((dayIndex, i, dayIndexList) => {

        //统一数据
        currentDate = dayIndex.date
        currentOpen = parseFloat(dayIndex.open)
        currentHigh = parseFloat(dayIndex.high)
        currentLow = parseFloat(dayIndex.low)
        currentClose = parseFloat(dayIndex.close)
        currentVolume = parseFloat(dayIndex.volume)


        let samePeriod
        if (period == "week")
            samePeriod = isSameWeek(preDayIndexDate, currentDate)
        if (period == "month")
            samePeriod = preDayIndexDate.substring(0, 7) == currentDate.substring(0, 7) ? true : false

        if (!samePeriod) {
            let prPeriodIndex = {
                "date": preDayIndexDate,
                "timestamp": new Date(preDayIndexDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "period": period
            }
            periodIndexList.push(prPeriodIndex)

            open = currentOpen
            high = currentHigh
            low = currentLow
            close = currentClose
            volume = currentVolume
            preDayIndexDate = currentDate
        }

        if (samePeriod) {
            high = currentHigh > high ? currentHigh : high
            low = currentLow < low ? currentLow : low
            close = currentClose
            volume = volume + currentVolume
            preDayIndexDate = currentDate
        }
        if (dayIndexListLastIndex == i) {
            let currentPeriodIndex = {
                "date": currentDate,
                "timestamp": new Date(currentDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "period": period
            }
            periodIndexList.push(currentPeriodIndex)
        }
    })

    periodIndexList.shift()
    return periodIndexList
}

Array.prototype.calKdj = function() {
    var getMaxHighAndMinLow = function(ticks) {
        var maxHigh = ticks[0].high,
            minLow = ticks[0].low;
        for (var i = 0; i < ticks.length; i++) {
            var t = ticks[i],
                high = t.high,
                low = t.low;
            if (high > maxHigh) {
                maxHigh = high;
            }
            if (low < minLow) {
                minLow = low;
            }
        }
        return [maxHigh, minLow];
    };
    let candleList = this
    var nineDaysTicks = [],
        days = 9,
        rsvs = [];
    var lastK, lastD, curK, curD;
    var maxAndMin, max, min;
    for (var i = 0; i < candleList.length; i++) {

        var t = candleList[i],
            close = t.close;
        nineDaysTicks.push(t);
        maxAndMin = getMaxHighAndMinLow(nineDaysTicks);
        max = maxAndMin[0];
        min = maxAndMin[1];
        if (max == min) {
            rsvs.push(0);
        } else {
            rsvs.push((close - min) / (max - min) * 100);
        }
        if (nineDaysTicks.length == days) {
            nineDaysTicks.shift();
        }
        if (i == 0) {
            lastK = lastD = rsvs[i];
        }

        curK = 2 / 3 * lastK + 1 / 3 * rsvs[i];
        lastK = curK;

        curD = 2 / 3 * lastD + 1 / 3 * curK;
        lastD = curD;

        curJ = 3 * curK - 2 * curD;

        candleList[i].K = curK
        candleList[i].D = curD
        candleList[i].J = curJ
    }

    return candleList;
}

Array.prototype.maN = function(MA, Attribute) {
    let dataList = this
    dataList = dataList.map((item, index) => {
        //const copyItem = [...item]
        let copyItem = Object.assign({}, item)
        if (index < MA) {

            return copyItem
        }
        let sum = 0
        for (let i = index - MA; i < index; i++) {
            sum += parseFloat(dataList[i][Attribute])
        }
        let avg = (sum / MA).toFixed(2)

        copyItem[`ma${MA}`] = avg
        return copyItem
    })
    return dataList
}

function getDayPercent(dayItem) {
    return parseFloat(((dayItem.close - dayItem.open) / dayItem.open * 100).toFixed(2))
}


async function writeToFile(dataName, dayDatas, format = 2) {

    fs.writeFile(`${folder}${dataName}.json`, JSON.stringify(dayDatas, null, format), 'utf8', (err) => {
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
            resolve(JSON.parse(data));
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


let log20 = []
let log30 = []
let log70 = []

function backTest(dataName, dayDatas) {

    let dayCross = false
    let dayNlowM = false
    let weekJup = false
    let monthLowMa = false
    let monthJup = false
    let monthJlow5 = false
    let monthPre5Jlow0 = false

    let stockCountry = "cn"
    let showChart = false


    for (var currentDayIndex = 50; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj().maN(40, 'close').maN(80, 'close')
        if (showChart) {
            chartDay.applyNewData(currentDayList)
            chartWeek.applyNewData(currentWeekList)
            chartMonth.applyNewData(currentMonthList)
        }


        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 55) {
            dayCross = true //日低位金叉
        }

        let nDayLow0Count = 0
        let nDayLow2Count = 0
        let day5percent = 0
        let logDay5 = []
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
        if (((nDayLow0Count >= 3) || (nDayLow2Count >= 1) || (day5percent <= -3)) && (day5percent <= 0) && (getDayPercent(currentDay) >= 0.2)) {
            dayNlowM = true
        } else {
            continue
        }


        //////////////////////////////////////////////////////////////////////

        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]
        if (preWeek.J < currentWeek.J) {
            weekJup = true //周J向上
        }
        ////////////////////////////////////////////////////////////////////////weekJup = true



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
        // if (pre5Month && (pre5Month.J < currentMonth.J)) {
        //     monthJup = true //月J向上
        // }
        if (currentMonth.J <= 10) {
            monthJlow5 = true //月j小于10
        }
        for (var i = 1; i < 6; i++) {
            let monthItem = currentMonthList[currentMonthList.length - i]
            if (monthItem && monthItem.J < 5) {
                monthPre5Jlow0 = true //前五个月有月j小于0    6上证  0沪深 
                break
            }
        }

        // if ( currentDay.date.includes("2015-11") || currentDay.date.includes("2015-12") ) { 
        //     //historylow.includes(currentDay.date)  2012-11-21 2012-12-04  5   2014-06-10 后2
        //     console.log(currentDay.date, logDay5, day5percent, currentDay.percent)
        //     console.log(dayCross, dayNlowM, weekJup, monthLowMa, monthJup, monthJlow5, monthPre5Jlow0)
        // }
        let lastResult = dayCross && dayNlowM && weekJup && monthLowMa && monthJup && monthJlow5 && monthPre5Jlow0
        if (lastResult) {
            console.log("ok", currentDay.date, logDay5, day5percent.toFixed(2), getDayPercent(currentDay))

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


                // let buysell = `
                //     ${nextDayData.date}  ${nextDayData.close} buy； 
                //     20天后${next20DayData.date} ${next20DayData.close} sell；盈亏${profile20}%
                // `
                // console.log(buysell)
            }

        }
        dayCross = false
        dayNlowM = false
        weekJup = false
        monthLowMa = false
        monthJup = false
        monthJlow5 = false
        monthPre5Jlow0 = false
    }

    // if(dataName=="对二甲苯连续"){
    //      console.log(dataName , dayDatas.length , currentDayIndex)
    // }
    console.log(dataName + "backEnd : ", dayDatas[0].date, " to ", dayDatas[currentDayIndex - 2].date)
}

async function start(dataName, dataCode) {
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
    browser = await puppeteer.launch({ headless: true, });
    let nameCodes = [
        { name: "螺纹连续", code: "RB0" },
        { name: "原油连续", code: "SC0" },
        { name: "热卷连续", code: "HC0" },
        { name: "燃油连续", code: "FU0" },
        { name: "黄金连续", code: "AU0" },
        { name: "白银连续", code: "AG0" },
        { name: "沪铜连续", code: "CU0" },
        { name: "沪锌连续", code: "ZN0" },
        { name: "沪镍连续", code: "NI0" },
        { name: "橡胶连续", code: "RU0" },
        { name: "20号胶连续", code: "NR0" },
        { name: "纸浆连续", code: "SP0" },
        { name: "氧化铝连续", code: "AO0" },
        { name: "航运连续", code: "EC0" },

        { name: "烧碱连续", code: "SH0" },
        { name: "对二甲苯连续", code: "PX0" },
        { name: "红枣连续", code: "CJ0" },
        { name: "甲醇连续", code: "MA0" },
        { name: "PTA连续", code: "TA0" },
        { name: "尿素连续", code: "UR0" },
        { name: "菜粕连续", code: "RM0" },
        { name: "菜油连续", code: "OI0" },
        { name: "苹果连续", code: "AP0" },
        { name: "棉花连续", code: "CF0" },
        { name: "锰硅连续", code: "SM0" },
        { name: "白糖连续", code: "SR0" },
        { name: "玻璃连续", code: "FG0" },
        { name: "纯碱连续", code: "SA0" },
        { name: "花生连续", code: "PK0" },
        { name: "短纤连续", code: "PF0" },

        { name: "铁矿石连续", code: "I0" },
        { name: "焦炭连续", code: "J0" },
        { name: "焦煤连续", code: "JM0" },
        { name: "塑料连续", code: "L0" },
        { name: "豆粕连续", code: "M0" },
        { name: "豆一连续", code: "A0" },
        { name: "豆二连续", code: "B0" },
        { name: "豆油连续", code: "Y0" },
        { name: "棕榈油连续", code: "P0" },
        { name: "鸡蛋连续", code: "JD0" },
        { name: "玉米连续", code: "C0" },
        { name: "PVC连续", code: "V0" },
        { name: "生猪连续", code: "LH0" },
        { name: "乙二醇连续", code: "EG0" },
        { name: "苯乙烯连续", code: "EB0" },
        { name: "液化气连续", code: "PG0" },
    ]

    for (var i = 0; i < nameCodes.length; i++) {
        await start(nameCodes[i].name, nameCodes[i].code)
    }

    log20.sort((a, b) => a[3] - b[3])
    log30.sort((a, b) => a[3] - b[3])
    log70.sort((a, b) => a[3] - b[3])

    writeToFile("log20", log20, 0)
    writeToFile("log30", log30, 0)
    writeToFile("log70", log70, 0)

})()