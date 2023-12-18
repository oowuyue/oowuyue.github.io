const puppeteer = require('puppeteer-extra') //https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));

const myjs = require("./jslib/my.js");
const isMonthLastDay = myjs.isMonthLastDay
const pre5Month = myjs.pre5Month
const isSameWeek = myjs.isSameWeek
const dayToPeriod = myjs.dayToPeriod
const xueqiuFormatDate = myjs.xueqiuFormatDate
const getDayPercent = myjs.getDayPercent

const folder = "./data/thsStocks/"


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

    let taskPage = async (name, site, pageUrl, apiSub) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on('request', (request) => { request.continue() })

        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.text()
                    resolve({ name: name, siteInfo: [site, pageUrl, apiSub], resdata: resdata })
                }
            })
        })

        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()
        return promise1
    }

    let res = await taskPage(dataName, "同花顺", `https://search.10jqka.com.cn/unifiedwap/result?tid=stockpick&qs=stockpick_diag&ts=1&w=${dataCode}`, "last1800.js")
    let resStr = res.resdata.match(/\{.*\}/sg)
    let resObj = JSON.parse(resStr)
    resObj.data = resObj.data.split(';').map(ele => {
        let eleArr = ele.split(",")
        let newEle = []
        newEle[0] = eleArr[0].substring(0, 4) + "-" + eleArr[0].substring(4, 6) + "-" + eleArr[0].substring(6, 8)
        newEle[1] = parseFloat(eleArr[1])
        newEle[2] = parseFloat(eleArr[2])
        newEle[3] = parseFloat(eleArr[3])
        newEle[4] = parseFloat(eleArr[4])
        newEle[5] = parseFloat(eleArr[5])
        return newEle
    })
    console.log(`\r\n${dataName} getDataFromUrl`);
    return resObj.data;
}




let edate
let backday
if ((typeof args['edate'] !== "undefined") && args['edate']) {
    edate = args['edate']
}
if ((typeof args['backday'] !== "undefined") && args['backday']) {
    backday = parseInt(args['backday'])
}


let weekGoldenCrossList = []
let logLastWeekGoldenCross2List = []

let monthGoldenCrossList = []
let logLastMonthGoldenCross5List = []

function backTest(dataName, dayDatas) {

    let dayCross = false
    let weekCrossBottom = false
    let recent5MonthCross = false

    function restAction() {
        dayCross = false
        weekCrossBottom = false
        recent5MonthCross = false
    }

    function testDay(currentDayList) {
        let preDay = currentDayList[currentDayList.length - 2]
        let currentDay = currentDayList[currentDayList.length - 1]
        if ((preDay.K < preDay.D) && (currentDay.K >= currentDay.D) && currentDay.D <= 35) {
            dayCross = true //日低位金叉
        }
    }

    function testWeek(currentWeekList) {
        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]
        weekGoldenCrossList = weekGoldenCrossList.filter(ele => !isSameWeek(ele.date, currentWeek.date))
        if ((preWeek.K < preWeek.D) && (currentWeek.K >= currentWeek.D) && currentWeek.J <= 25) {
            weekGoldenCrossList.push(currentWeek) //周金叉
            for (var i = weekGoldenCrossList.length - 2; i >= 0; i--) {
                let preOne = weekGoldenCrossList[i]
                if ((preOne.close > currentWeek.close) && (preOne.K < currentWeek.K)) {
                    weekCrossBottom = true //周金叉且底背离
                    break
                }
            }
        }
    }

    function testWeek2(currentWeekList) {

        let preWeek = currentWeekList[currentWeekList.length - 2]
        let currentWeek = currentWeekList[currentWeekList.length - 1]
        //高位死叉
        if ((preWeek.K > preWeek.D) && (currentWeek.K <= currentWeek.D) && currentWeek.D >= 50) { // or pre5 J > 80
            weekGoldenCrossList = []
        }
        //低位金叉 
        weekGoldenCrossList = weekGoldenCrossList.filter(ele => !isSameWeek(ele.date, currentWeek.date)) //更新同周数据
        if ((preWeek.K < preWeek.D) && (currentWeek.K >= currentWeek.D) && currentWeek.J <= 27) {
            weekGoldenCrossList.push(currentWeek) //连续的没有高位死叉打断的低位金叉 
            for (var i = weekGoldenCrossList.length - 2; i >= 0; i--) {
                let preOne = weekGoldenCrossList[i]
                if ((preOne.close > currentWeek.close) && (preOne.K < currentWeek.K)) {
                    weekCrossBottom = true //周连续低位金叉 连续的没有高位死叉打断的连续低位金叉  底背离 
                    logLastWeekGoldenCross2List.push(weekGoldenCrossList[weekGoldenCrossList.length - 1])
                    break
                }
            }
        }
    }

    function testMonth(currentMonthList) {
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
    }

    function testMonth2(currentMonthList) {
        let preMonth = currentMonthList[currentMonthList.length - 2]
        let currentMonth = currentMonthList[currentMonthList.length - 1]
        //高位死叉
        if ((preMonth.K > preMonth.D) && (currentMonth.K <= currentMonth.D) && currentMonth.D >= 50) { // or pre5 J > 80
            monthGoldenCrossList = []
        }
        //金叉 
        monthGoldenCrossList = monthGoldenCrossList.filter(ele => ele.date.substring(0, 7) != currentMonth.date.substring(0, 7)) //更新同月数据
        if ((preMonth.K < preMonth.D) && (currentMonth.K >= currentMonth.D)) {
            monthGoldenCrossList.push(currentMonth) //月金叉 没有高位死叉打断的金叉
        }
        let pre5MonthList = pre5Month(currentMonth.date.substring(0, 7))
        for (var i = pre5MonthList.length - 1; i >= 0; i--) {
            recent5MonthCross = monthGoldenCrossList.find(ele => ele.date.substring(0, 7) == pre5MonthList[i])
            if (recent5MonthCross) {
                recent5MonthCross = true //最近5月月金叉2018-10-19
                logLastMonthGoldenCross5List.push(monthGoldenCrossList[monthGoldenCrossList.length - 1])
                break
            }
        }
    }

    //等效setInterval循环
    let endIndex = dayDatas.length
    if (edate) {
        endIndex = dayDatas.findIndex(ele => ele.date == edate)
        if (endIndex == -1) endIndex = dayDatas.length
        else endIndex++
    }

    let currentDayIndex = 70
    if (backday>=0) {
        currentDayIndex = endIndex - backday //for1
    }
    let backStartIndex = currentDayIndex

    for (; currentDayIndex <= endIndex; currentDayIndex++) {

        let currentDayList = dayDatas.slice(0, currentDayIndex).calKdj()
        let currentWeekList = dayToPeriod(currentDayList, "week").calKdj()
        let currentMonthList = dayToPeriod(currentDayList, "month").calKdj()

        testDay(currentDayList)
        testWeek(currentWeekList)
        testMonth(currentMonthList)

        let lastResult = dayCross && weekCrossBottom && recent5MonthCross
        if (lastResult) {
            let currentDay = currentDayList[currentDayList.length - 1]
            console.log(currentDay, "日金叉 && 周金叉且底背离 && 最近5日月kdj金叉")
        }
        restAction()
    }
    //等效setInterval循环

    console.log("back start from:", dayDatas[backStartIndex-1].date, ";  end at:", dayDatas[endIndex-1].date)
}

async function start(dataName, dataCode) {
    let dayDatas
    try {
        dayDatas = await getDataFromFile(dataName, dataCode)
        if (!dayDatas) {
            dayDatas = await getDataFromUrl(dataName, dataCode)
            writeToFile(dataName, dayDatas)
        }
        dayDatas = dayDatas.map(function(data) {
            return {
                date: data[0],
                timestamp: new Date(data[0]).getTime(),
                open: data[1],
                high: data[2],
                low: data[3],
                close: data[4],
                percent: 0,
                volume: Math.ceil(+data[5]),
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
        [
            "301246",
            "宏源药业",
            "2023-10-27",
            "持有--",
            "19.99",
            "23.34",
            "16.76%"
        ],
        [
            "301321",
            "翰博高新",
            "2022-11-03",
            "2022-11-17",
            "19.99",
            "23.34",
            "16.76%"
        ],
        [
            "300741",
            "华宝股份",
            "2022-10-14",
            "2022-11-10",
            "22.97",
            "24.88",
            "8.32%"
        ],
        [
            "688292",
            "浩瀚深度",
            "2022-10-13",
            "2022-11-01",
            "13.9",
            "16.84",
            "21.15%"
        ],
        [
            "301330",
            "熵基科技",
            "2022-10-13",
            "2022-11-01",
            "31.37",
            "37.75",
            "20.34%"
        ],
        [
            "300908",
            "仲景食品",
            "2022-06-02",
            "2022-06-30",
            "34.33",
            "37.63",
            "9.61%"
        ],
        [
            "688219",
            "会通股份",
            "2022-05-05",
            "2022-06-01",
            "8.3",
            "9.42",
            "13.49%"
        ],
        [
            "301008",
            "宏昌科技",
            "2022-03-21",
            "2022-04-13",
            "36.0",
            "34.02",
            "-5.50%"
        ],
        [
            "301052",
            "果麦文化",
            "2021-11-04",
            "2021-11-16",
            "26.75",
            "32.2",
            "20.37%"
        ],
        [
            "300968",
            "格林精密",
            "2021-11-04",
            "2021-11-17",
            "12.79",
            "14.2",
            "11.02%"
        ],
        [
            "301065",
            "本立科技",
            "2021-11-02",
            "2021-11-11",
            "43.42",
            "56.59",
            "30.33%"
        ],
        [
            "300868",
            "杰美特",
            "2021-11-01",
            "2021-11-12",
            "23.58",
            "24.89",
            "5.56%"
        ],
        [
            "300879",
            "大叶股份",
            "2021-08-03",
            "2021-08-16",
            "21.88",
            "22.79",
            "4.16%"
        ],
        [
            "301001",
            "凯淳股份",
            "2021-07-29",
            "2021-08-11",
            "31.3",
            "33.72",
            "7.73%"
        ],
        [
            "688159",
            "有方科技",
            "2021-05-12",
            "2021-05-25",
            "21.0",
            "21.78",
            "3.71%"
        ],
        [
            "600516",
            "方大炭素",
            "2020-10-29",
            "2020-11-11",
            "6.17",
            "6.66",
            "7.94%"
        ],
        [
            "002836",
            "新宏泽",
            "2019-02-15",
            "2019-02-28",
            "11.64",
            "13.36",
            "14.78%"
        ],
        [
            "600936",
            "广西广电",
            "2018-10-22",
            "2018-11-02",
            "3.62",
            "4.09",
            "12.98%"
        ]
    ]
    for (var i = 5; i < 6; i++) {
        await start(nameCodes[i][1], nameCodes[i][0])
    }
})()