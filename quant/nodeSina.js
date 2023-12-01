const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');


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


function backTest(dataName, dayDatas) {

    let weekGoldenCrossList = [];
    let monthGoldenCrossList = [];
    let dayCross = false;
    let weekCrossBottom = false;
    let recent5MonthCross = false;

    for (var currentDayIndex = 1; currentDayIndex <= dayDatas.length; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj();
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj();
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj();


        if ((currentDayList.length > 1) && (currentWeekList.length > 1) && (currentMonthList.length > 1)) {

            let preDay = currentDayList[currentDayList.length - 2]
            let currentDay = currentDayList[currentDayList.length - 1]
            if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 37) {
                dayCross = true //日金叉
            }

            let preWeek = currentWeekList[currentWeekList.length - 2]
            let currentWeek = currentWeekList[currentWeekList.length - 1]
            weekGoldenCrossList = weekGoldenCrossList.filter(ele => !isSameWeek(ele.date, currentWeek.date))
            if ((preWeek.K < preWeek.D) && (currentWeek.K >= currentWeek.D)) { //&& currentWeek.J <= 25
                weekGoldenCrossList.push(currentWeek) //周金叉
                for (var i = weekGoldenCrossList.length - 2; i >= 0; i--) {
                    let preOne = weekGoldenCrossList[i]
                    if ((preOne.close > currentWeek.close) && (preOne.K < currentWeek.K)) {
                        weekCrossBottom = true //周金叉且底背离
                        break
                    }
                }
            }

            let preMonth = currentMonthList[currentMonthList.length - 2]
            let currentMonth = currentMonthList[currentMonthList.length - 1]
            monthGoldenCrossList = monthGoldenCrossList.filter(ele => ele.date.substring(0, 7) != currentMonth.date.substring(0, 7))
            if ((preMonth.K < preMonth.D) && (currentMonth.K >= currentMonth.D)) {
                monthGoldenCrossList.push(currentMonth) //月金叉
            }
            let pre5MonthList = pre5Month(currentMonth.date.substring(0, 7))
            for (var i = pre5MonthList.length - 1; i >= 0; i--) {
                recent5MonthCross = monthGoldenCrossList.find(ele => ele.date.substring(0, 7) == pre5MonthList[i])
                if (recent5MonthCross) {
                    recent5MonthCross = true //最近5月月金叉2018-10-19
                    break
                }
            }

            let lastResult = dayCross && weekCrossBottom && recent5MonthCross
            if (lastResult) console.log(currentDay.date, dataName + ": 日金叉 && 周金叉且底背离 && 最近5日月kdj金叉")
        }

        dayCross = false;
        weekCrossBottom = false;
        recent5MonthCross = false;
    }
    console.log(dataName + "backEnd : ", dayDatas[0].date, " to ", dayDatas[currentDayIndex - 2].date)
}


async function getDataBack(dataName, dataCode) {

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
    let res = await taskPage(dataName, "sina", `https://finance.sina.com.cn/futures/quotes/${dataCode}.shtml`, "InnerFuturesNewService.getDailyKLine?symbol=");
    let resStr = res.resdata.match(/\[.*\]/sg);
    let resArr = JSON.parse(resStr);
    let dayDatas = resArr.map(function(data) {
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

    backTest(dataName, dayDatas)
    return "??"
}

let browser
(async () => {
    browser = await puppeteer.launch({ headless: false, });
    let nameCodes = [
        { name: "螺纹连续", code: "RB0" },
        { name: "白银连续", code: "AG0" },
        { name: "菜油连续", code: "OI0" },
    ]

    for (var i = 0; i < nameCodes.length; i++) {
    	await getDataBack( nameCodes[i].name, nameCodes[i].code) 
    }


})()