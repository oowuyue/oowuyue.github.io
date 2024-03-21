const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const {
    currentDayYMD,
    getLastDayOf,
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
    getDataFromFile
} = require("../ajslib/my.js")

const folder = path.join(__dirname, "/data/同花顺策略/")//个股同花顺策略
const tmpdowloadFolder = folder + "tmp/"


let nameToFile = {}
let taskFileDownloadThsBack = async (name, pageUrl) => {

    const page = await browser.newPage()
    //手动的登陆同花顺editthiscookie插件复制cookie
    let ths_cookie = [
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1732000436,
            "hostOnly": false,
            "httpOnly": false,
            "name": "_ga",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "GA1.1.2050180270.1697440436",
            "id": 1
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1734066312,
            "hostOnly": false,
            "httpOnly": false,
            "name": "_ga_KQBDS1VPQF",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "GS1.1.1699506296.5.0.1699506312.0.0.0",
            "id": 2
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1725692920,
            "hostOnly": false,
            "httpOnly": false,
            "name": "cid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "dbd0fe2ebf08f766fe9713e30f33f4de1694156920",
            "id": 3
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.89238,
            "hostOnly": false,
            "httpOnly": false,
            "name": "escapename",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "MTSoftware12",
            "id": 4
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709709586,
            "hostOnly": false,
            "httpOnly": false,
            "name": "historystock",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "002004%7C*%7C600598%7C*%7C300750",
            "id": 5
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1733892097,
            "hostOnly": false,
            "httpOnly": false,
            "name": "Hm_lvt_722143063e4892925903024537075d0d",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1701155948,1702356098",
            "id": 6
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1740465846,
            "hostOnly": false,
            "httpOnly": false,
            "name": "Hm_lvt_78c58f01938e4d85eaf619eae71b4ed1",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1707099957,1708929846",
            "id": 7
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1733892099,
            "hostOnly": false,
            "httpOnly": false,
            "name": "Hm_lvt_929f8b362150b1f77b477230541dbbc2",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1701155950,1702356099",
            "id": 8
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1730792227,
            "hostOnly": false,
            "httpOnly": false,
            "name": "searchGuide",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "sg",
            "id": 9
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709691956,
            "hostOnly": false,
            "httpOnly": false,
            "name": "spversion",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "20130314",
            "id": 10
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.892419,
            "hostOnly": false,
            "httpOnly": false,
            "name": "ticket",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "183911cce49abb6ca2881bfd3cba5c34",
            "id": 11
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709853123.202538,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_did",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "9A6233B9DE2846FD937C563446D64E83",
            "id": 12
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709853123.202477,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_dpass",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "nrE9Yi%2FyGO8%2FFX%2F7VcYIKibQrn1zHHx9CSglya1upYD7tdOrImjGfLHxJ50hDDZf%2FsBAGfA5tlbuzYBqqcUNFA%3D%3D",
            "id": 13
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.892349,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_name",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "MTSoftware12",
            "id": 14
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709853123.202587,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_ttype",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "WEB",
            "id": 15
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709853123.202285,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_ukey",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "A10702B8689642C6BE607730E11E6E4A",
            "id": 16
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709853123.202426,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_uver",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1.0.0",
            "id": 17
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.892182,
            "hostOnly": false,
            "httpOnly": false,
            "name": "user",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "MDpNVFNvZnR3YXJlMTI6Ok5vbmU6NTAwOjY3NDY2MzgwMTo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDo6Ojo2NjQ2NjM4MDE6MTcwOTEwMzY4NDo6OjE2NzUzMDA4NjA6ODY0MDA6MDoxZTJmMWQ1OWNhNzY0ZTM0MjVkNjFhOGUwNjJkZDFhODk6ZGVmYXVsdF80OjE%3D",
            "id": 18
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.89245,
            "hostOnly": false,
            "httpOnly": false,
            "name": "user_status",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "0",
            "id": 19
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.892313,
            "hostOnly": false,
            "httpOnly": false,
            "name": "userid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "664663801",
            "id": 20
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1709190084.892477,
            "hostOnly": false,
            "httpOnly": false,
            "name": "utk",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "cff7d8889e707099e7e524523c6a0a59",
            "id": 21
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1743731993.006087,
            "hostOnly": false,
            "httpOnly": false,
            "name": "v",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "A1C9_6xUAQzX7t0IHwi008ayIZWnGTQPVvyIZ0ohGEx_sv6L8ikE86YNWP-Z",
            "id": 22
        },
        {
            "domain": "backtest.10jqka.com.cn",
            "expirationDate": 1709200793.273337,
            "hostOnly": true,
            "httpOnly": true,
            "name": "etrade_robot_session",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "89e79a3ef9fe212800aa16e15a4588a0aa7348e4",
            "id": 23
        }
    ]

    for (let i = 0; i < ths_cookie.length; i++) {
        await page.setCookie(ths_cookie[i]);
    }

    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(tmpdowloadFolder)
    });
    await page.goto(pageUrl, { waitUntil: 'networkidle2' })

    await wait(Math.random() * 2000 + Math.random() * 3000 + Math.random() * 5010)

    await page.waitForSelector('td[class="td-highlight"]')
    const element = await page.waitForSelector('a[title="低版本IE需手动加上.csv后缀"]')
    await element.click()

    return new Promise(function (resolve, reject) {
        const watcher = fs.watch(tmpdowloadFolder, function (eventType, fileName) {
            if ((eventType === "rename")
                && (fileName.substring(fileName.length - 3) == "csv")
                && (!Object.values(nameToFile).includes(fileName))
            ) {
                console.log("\nThe file", fileName, "was modified!", "The type of change was:", eventType);
                watcher.close();
                resolve(fileName)
            }
        });
    })

}

let csvToJson = async (fileName) => {
    if (!fs.existsSync(`${folder}${fileName}.csv`)) return []
    return new Promise((resolve, reject) => {
        fs.readFile(`${folder}${fileName}.csv`, "utf-8", (err, data) => {
            if (err) { resolve([]) }
            else {
                let lines = data.split(/\r?\n/)
                lines.shift()
                lines.shift()
                lines.pop()

                lines = lines.map((item) => {
                    item = item.substring(1)
                    itemArr = item.split(",")
                    itemArr[2] = itemArr[2].substring(0, 4) + "-" + itemArr[2].substring(4, 6) + "-" + itemArr[2].substring(6)
                    itemArr[3] = itemArr[3].substring(0, 4) + "-" + itemArr[3].substring(4, 6) + "-" + itemArr[3].substring(6)
                    return itemArr
                })
                resolve(lines)
            }
        }) //readfile
    }) //return Promise
}

let signal = async () => {
    let 左侧长短周期组合 = await csvToJson('左侧长短周期组合')
    let 右侧长短周期组合 = await csvToJson('右侧长短周期组合')

    let 日周信号组合 = await csvToJson('日周信号组合')
    let 日周信号组合2 = await csvToJson('日周信号组合2')

    let 日买入信号组合 = await csvToJson('日买入信号组合')
    let 日买入信号组合2 = await csvToJson('日买入信号组合2')

    function countStat(json, name = "kdj日周月", Period = "week") {
        let countJson = {}
        json.forEach((element) => {
            let startTime = element[2] //day
            if (Period == "week") startTime = getLastDayOf(element[2])
            if (Period == "month") startTime = element[2].substring(0, 7) + "-28"
            if (countJson[startTime]) {
                countJson[startTime].count += 1;
                countJson[startTime].detail.push(element);
            } else {
                countJson[startTime] = { count: 1, detail: [element] }
            }
        })
        let countArr = []
        for (var key of Object.keys(countJson)) {
            startTime = key //month day
            countArr.push([startTime, countJson[key].count, name, countJson[key].detail])
        }

        return countArr
    }
    
    let 左侧长短周期组合统计 = countStat(左侧长短周期组合, "左侧长短周期组合")
    let 右侧长短周期组合统计 = countStat(右侧长短周期组合, "右侧长短周期组合")

    let 日周信号组合统计 = countStat(日周信号组合, "日周信号组合")
    let 日周信号组合2统计 = countStat(日周信号组合2, "日周信号组合2")

    let 日买入信号组合统计 = countStat(日买入信号组合, "日买入信号组合")
    let 日买入信号组合2统计 = countStat(日买入信号组合2, "日买入信号组合2")
    console.log(右侧长短周期组合统计, 日买入信号组合统计)



    统计Contact = [...左侧长短周期组合统计, ...右侧长短周期组合统计, ...日周信号组合统计, ...日周信号组合2统计, ...日买入信号组合统计, ...日买入信号组合2统计]
    统计Contact.sort(function (a, b) {
        return new Date(a[0]) - new Date(b[0])
    })
    统计Contact = 统计Contact.map((ele) => {
        return {
            date: ele[0],
            count: ele[1],
            quanName: ele[2],
            detail: ele[3]
        }
    })
    function groupBy(objectArray, property) {
        return objectArray.reduce((acc, obj) => {
            const key = obj[property];
            const curGroup = acc[key] ?? [];
            return { ...acc, [key]: [...curGroup, obj] };
        }, {});
    }
    let 统计byDate = groupBy(统计Contact, "date")
    let 统计byName = groupBy(统计Contact, "quanName")


    let 技术指标统计 = []
    for (let dateKey in 统计byDate) {
        let sum = 统计byDate[dateKey].reduce((acc, cruEle) => {
            acc += cruEle.count
            return acc
        }, 0)
        //                  日期   总数  策略数已经单个策略数的总数
        技术指标统计.push([dateKey, sum, 统计byDate[dateKey]])
    }
    //console.log(技术指标统计)


    let fileStr = `var 技术指标统计 = ` + JSON.stringify(技术指标统计, null, 0) + "\r\n"
    try {
        fs.writeFileSync(`${folder}同花顺策略统计.js`, fileStr);
        console.log(`回测一下 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}

let smallCom = async () => {
    let lines = await csvToJson('小市值')
    lines = lines.reverse()

    let smallDown = lines.filter((item) => { //"8.32%"
        return parseFloat(item[6].substring(0, item[6].length - 1)) < 2
    })

    let fileStr = `var smallDown = ` + JSON.stringify(smallDown, null, 0) + "\r\n"
    try {
        fs.writeFileSync(`${folder}同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`小市值策略回测 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}

let bigCom = async () => {
    let lines = await csvToJson('大市值')
    lines = lines.reverse()
    lines = lines.map((item) => {
        return [item[3], item[6], item[1]]
    })

    let continues = 1
    let continueslow = lines.map((ele, index) => {
        if (index == 0) return ele
        let percent = parseFloat(ele[1].substring(0, ele[1].length - 1))
        if (percent < 0) { //pre<0?   
            let preEle = lines[index - 1]
            let prePercent = parseFloat(preEle[1].substring(0, preEle[1].length - 1))
            if (prePercent < 0) {
                ele.push(++continues)
                preEle[4] ? ele.push(preEle[4] + percent) : ele.push(prePercent + percent)
            }
        } else {
            continues = 1
        }
        return ele
    })

    let fileStr = `var bigcontinueslow = ` + JSON.stringify(continueslow, null, 0) + "\r\n"
    try {
        fs.writeFileSync(`${folder}同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`大市值策略回测 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}




let 回测一下urlTemplate = "`https://backtest.10jqka.com.cn/backtest/app.html#/backtest?query=${query}&daysForSaleStrategy=${daysForSaleStrategy}&startDate=${startDate}&endDate=${endDate}&benchmark=399300%20沪深300`"
let 策略回测urlTemplate = "`https://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=${query}&daysForSaleStrategy=${daysForSaleStrategy}&startDate=${startDate}&endDate=${endDate}&stockHoldCount=${stockHoldCount}&dayBuyStockNum=${dayBuyStockNum}&upperIncome=${upperIncome}&lowerIncome=${lowerIncome}&fallIncome=${fallIncome}&engine=undefined&capital=100000`"

//策略2是主要的
let tactics = [
    {
        name: "左侧长短周期组合",
        query: `
                kdj金叉d值小于37，当日涨幅大于0.5，最近5日涨跌幅小于-5，最近5日有≥2次的涨跌幅小于0，
                周macd上移，周kdjj值小于60，月kdj上移，实际换手率大于1.7, 
                最近10日收盘获利小于5%的天数>0, 最近2日主力资金流入大于-250万，pe<=120，pb>0，排除st
        `,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 30,
        fallIncome: 7,
        lowerIncome: 7,
        stats: "策略回测"
    },
    {
        name: "右侧长短周期组合2",
        query: `最近5天月线周期kdj金叉；周线周期kdj底背离；周线周期kdj金叉；周线周期kdjj值小于25；日线周期kdj金叉且d值小于35；pe<=120；pb>0；排除st`,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 23,
        fallIncome: 3.5,
        lowerIncome: 5.5,
        stats: "策略回测"
    },

    {
        name: "日周信号组合",
        query: `周kdj底背离且金叉且j值小于25；kdj金叉且d值小于35；BIAS买入信号；振幅小于12；实际换手率大于2.9；上市天数大于30；roe>0；排除st；roe从大到小`,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 33,
        fallIncome: 10,
        lowerIncome: 8.5,
        stats: "策略回测"
    },
    {
        name: "日周信号组合2",
        query: `
              周kdj金叉且j值小于59；最近10日日kdj金叉出现>=1次；日kdjd值小于39；BIAS买入信号；实际换手率大于2.9；股价大于5日均线；
              最近3日收盘获利小于5%的天数>0；最近3日主力资金流入大于-250万；振幅小于12；放量；pe<=120；roe>0；排除st；roe从大到小
        `,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 33,
        fallIncome: 10,
        lowerIncome: 8.5,
        stats: "策略回测"
    },

    {
        name: "日买入信号组合",
        query: `kdj买入信号，bias买入信号，wr信号买入，macd买入信号，cci大于-120小于0，振幅小于12，股价低于压力位，实际换手率大于2.9，排除st，排除退市`,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 20,
        fallIncome: 5.5,
        lowerIncome: 10.5,
        stats: "策略回测"
    },
    {
        name: "日买入信号组合2",
        query: `
              kdj买入信号，bias买入信号，wr信号买入，rsi买入信号，周kdj金叉，振幅小于12，cci大于-130小于97，
              过去30个交易日涨跌幅大于-25%，最近3日主力资金流入大于-250万，实际换手率大于1，roe大于0，排除st，换手率从大到小
        `,
        daysForSaleStrategy: "20",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 25,
        fallIncome: 10,
        lowerIncome: 12,
        stats: "策略回测"
    },


    {
        name: "月周macd",
        query: `最近3天月线周期macd金叉，周线周期macd底背离，最近10日周kdj金叉且j值小于79，最近10日日kdj金叉且d值小于39，pe<=120，pb>0，排除st，roe从大到小`,
        daysForSaleStrategy: "35",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 13,
        fallIncome: 1.5,
        lowerIncome: 15,
        stats: "策略回测"
    },
    {
        name: "月周macd-2",
        query: `最近3天月线周期macd金叉，周线周期macd底背离，周kdjj值小于75大于5，周kdj上移，最近10日日kdj金叉且d值小于39，pe<=120，pb>0，排除st，roe从大到小`,
        daysForSaleStrategy: "35",
        stockHoldCount: 10,
        dayBuyStockNum: 3,
        upperIncome: 13,
        fallIncome: 1.5,
        lowerIncome: 15,
        stats: "策略回测"
    },


    {
        name: "大市值",
        query: `市值大于1000亿；非科创板；非创业板；同花顺二级行业龙头；细分行业龙头；过去3年的基本每股收益增长率>3%；过去30个交易日涨跌幅大于-5%小于23；振幅小于8；股性评分大于12；上市日期从大到小排名；总市值从小到大排列`,
        daysForSaleStrategy: "20,30",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 30,
        fallIncome: 7,
        lowerIncome: 11,
        stats: "策略回测"
    },
    {
        name: "小市值",
        query: `总市值大于等于10亿小于等于20亿；0<pb<=2.5；0<=pe<=25；股息大于0； BIAS买入信号；放量；振幅小于10；排除st；上市天数>100；roe从大到小排列`,
        daysForSaleStrategy: "50,60",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 17,
        fallIncome: 5,
        lowerIncome: 12,
        stats: "策略回测"
    },

    /*===========================================================================================*/
    {
        name: "大股东增持",
        query: `今日大股东增持比例大于5%；sar红色；cci小于等于97；资金流入大于-250万；涨跌幅-5~5；排除st；上市天数>100；风险提示取反；换手率从大到小`,
        daysForSaleStrategy: "10,20",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 17,
        fallIncome: 5,
        lowerIncome: 10,
        justProduceLink: true
    },
    {
        name: "业绩预增",
        query: `业绩预增大于50%，年报收入同比增长大于10，最近10日放量，量比大于1，最近10日振幅大于10小于35，非ST股，非*ST股，非退市，非停牌，总市值从小到大排列`,
        daysForSaleStrategy: "50",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 37,
        fallIncome: 5,
        lowerIncome: 15,
        justProduceLink: true
    },
    {
        name: "绿空红",
        query: `
               昨日涨跌幅小于0.3大于-10.5，昨日阴线，当日涨跌幅小于-1大于-5，当日阳线，放量，最近5日涨跌幅小于-7大于-21，pe<=120，pb>0， roe大于0，股息大于0，cci大于-260，
               最近3日收盘获利小于4.5%的天数>0，最近2日主力资金流入大于-200万，BIAS买入信号，kdjd值小于35，排除st，上市天数>100，风险提示取反，换手率从大到小排列
        `,
        daysForSaleStrategy: "20,25",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 30,
        fallIncome: 5,
        lowerIncome: 12,
        justProduceLink: true
    },
    {
        name: "均线集中度",
        query: `
               市值大于20亿小于350亿；5均线大于10均线；筹码集中度90小于10%；最近10日放量；最近20日换手率小于45；振幅小于10；涨跌幅大于-3.5小于5；
               排除st；排除*st；上市天数>100；0<pe<70；pb>0；roe从大到小排列
        `,
        daysForSaleStrategy: "50",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 25,
        fallIncome: 7,
        lowerIncome: 13.5,
        justProduceLink: true
    },


   /*===========================================================================================*/
    {
        name: "5日跌停",
        query: `
              市值小于100亿，最近5日有跌停，换手率小于1.2%，当日涨跌幅小于-1大于-3.5，当日阳线，流动比率大于1，扣非净利润增速大于0.1， 负债率小于90，pb>0，
              非ST股，非*ST股，非退市，非停牌，roe从大到小
        `,
        daysForSaleStrategy: "10",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 27,
        fallIncome: 5,
        lowerIncome: 11,
        justProduceLink: true
    },
    {
        name: "跌停",
        query: `
             市值小于100亿，跌停，换手率小于1%，bias买入信号，主力资金流向>22万，振幅小于10，流动比率大于1，扣非净利润增速大于-0.12，负债率小于90，pb>0，
             非ST股，非*ST股，非退市，非停牌，roe从大到小
        `,
        daysForSaleStrategy: "10",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 27,
        fallIncome: 7,
        lowerIncome: 9.5,
        justProduceLink: true
    },

    {
        name: "macd底背离",
        query: `macd底背离，VR买入信号，成交量大于60日线，前10日的区间主力资金流向>0，流动比率大于1，涨跌幅大于1.5，roe从大到小`, //+kdj买入信号?
        daysForSaleStrategy: "7",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 13,
        fallIncome: 3,
        lowerIncome: 10,
        justProduceLink: true
    },

    {
        name: "6日均线",
        query: `行情收盘价>6日的均线，收盘价>昨日的最高价，当日阳线，昨日的macd增长值<0，当日的macd增长值>0，最近7日放量，量比大于1，前7日的区间主力资金流向>0，17>pb>0`, 
        daysForSaleStrategy: "2",
        stockHoldCount: 1,
        dayBuyStockNum: 1,
        upperIncome: 30,
        fallIncome: 9,
        lowerIncome: 13.5,
        justProduceLink: true
    },

];

let justProduceLink = true
let browser;
(async () => {
    browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe', defaultViewport: null, args: ['--start-maximized'] });

    let htmlStr = ""
    for (let i = 0; i < tactics.length; i++) {
        let dataName = tactics[i].name
        let dataFile = `${folder}${dataName}.csv`
        let isFileExit = fs.existsSync(dataFile)
        if (isFileExit) {
            let modifyDate = fs.statSync(dataFile).mtime.toISOString().substring(0, 10)
            let isFileToday = currentDayYMD == modifyDate
            if (isFileToday) continue
        }
        let startDate = "" + parseInt(currentDayYMD.substring(0, 4)) - 5 + "-01-01"
        let endDate = currentDayYMD
        let query = encodeURIComponent(tactics[i].query.trim().replace(/[\r\n]/g, '').replace(/[ ]/g, ''))
        let daysForSaleStrategy = tactics[i].daysForSaleStrategy ?? "10,20"
        let stockHoldCount = tactics[i].stockHoldCount ?? 1
        let dayBuyStockNum = tactics[i].dayBuyStockNum ?? 1
        let upperIncome = tactics[i].upperIncome ?? 30
        let fallIncome = tactics[i].fallIncome ?? 10
        let lowerIncome = tactics[i].lowerIncome ?? 10

        //console.log(daysForSaleStrategy, fallIncome)
        eval("回测一下url = " + 回测一下urlTemplate)
        eval("策略回测url = " + 策略回测urlTemplate)

        htmlStr += `<tr> <td><a href="${回测一下url}" target="_blank">${dataName}</a></td> <td><a href="${策略回测url}" target="_blank">${dataName}</a></td> </tr>`
        if (i == tactics.length - 1) fs.writeFileSync(`${folder}同花顺策略链接.html`, `<table><tr><td>回测一下</td><td>策略回测</td></tr>${htmlStr}</table>`)
        if (justProduceLink || tactics[i].justProduceLink) continue

        if (!tactics[i].stats) continue
        let downBackUrl = tactics[i].stats == "策略回测" ? 策略回测url : 回测一下url
        let downLoadFile = await taskFileDownloadThsBack(dataName, downBackUrl)
        nameToFile[dataName] = downLoadFile
    }
    console.log("\r\n DowloadNameToFile：", nameToFile)
    await wait(Math.random() * 2000)
    for (let name in nameToFile) {
        if (Object.hasOwnProperty.call(nameToFile, name)) {
            let downLoadName = nameToFile[name];
            try {
                fs.copyFileSync(tmpdowloadFolder + downLoadName, folder + `${name}.csv`)
            }
            catch (error) { console.log(error) }
        }
    }

    await signal()//回测一下
    await smallCom()//策略回测
    await bigCom()

    // mx_664226190   sogo54321  手机177
})()