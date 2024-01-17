// const puppeteer = require('puppeteer')
const puppeteer = require('puppeteer-extra') ////防止被检测方式2：https://www.npmjs.com/package/puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const http = require('http');
const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, "./data/同花顺策略/") //个股同花顺策略

let tmpdowloadFolder = folder + "tmp/"
let nameToFile = {}
let current_date = new Date()

function getCurrentYMD() {
    let current_date = new Date()
    let current_y = current_date.getFullYear(),
        current_m = current_date.getMonth() + 1,
        current_d = current_date.getDate();
    if (current_m < 10)
        current_m = '0' + current_m;
    if (current_d < 10)
        current_d = '0' + current_d;
    return current_y + "-" + current_m + "-" + current_d
}

let wait = async (ms) => {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

let taskFileDownloadThsBack = async (name, pageUrl) => {

    const page = await browser.newPage()
    //手动的登陆同花顺editthiscookie插件复制cookie
    let ths_cookie = [
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1732000436.06123,
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
            "expirationDate": 1734066312.670128,
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
            "expirationDate": 1725692920.115613,
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
            "expirationDate": 1703831870.92109,
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
            "expirationDate": 1704948340,
            "hostOnly": false,
            "httpOnly": false,
            "name": "historystock",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "SPX%7C*%7C002531%7C*%7C601899%7C*%7C300131",
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
            "expirationDate": 1733892099,
            "hostOnly": false,
            "httpOnly": false,
            "name": "Hm_lvt_78c58f01938e4d85eaf619eae71b4ed1",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1700533814,1701155950,1701225343,1702356099",
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
            "expirationDate": 1703831870.921133,
            "hostOnly": false,
            "httpOnly": false,
            "name": "ticket",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "c4258758f091e19828d2d29fdf7b4277",
            "id": 10
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703755203.896247,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_did",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "3B8A5BCEA8B34906954872F61887B82C",
            "id": 11
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703755203.896221,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_dpass",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "jBnU14amnNP69OSQOT544MS3lDh%2FYwRgxoEad%2B%2B3YIAK8DFXQe7CWYWPqyvZ3jcw%2FsBAGfA5tlbuzYBqqcUNFA%3D%3D",
            "id": 12
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703831870.921053,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_name",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "MTSoftware12",
            "id": 13
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703755203.896271,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_ttype",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "WEB",
            "id": 14
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703755203.896115,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_ukey",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "A10702B8689642C6BE607730E11E6E4A",
            "id": 15
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703755203.896194,
            "hostOnly": false,
            "httpOnly": false,
            "name": "u_uver",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "1.0.0",
            "id": 16
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703831870.920878,
            "hostOnly": false,
            "httpOnly": false,
            "name": "user",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "MDpNVFNvZnR3YXJlMTI6Ok5vbmU6NTAwOjY3NDY2MzgwMTo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDo6Ojo2NjQ2NjM4MDE6MTcwMzc0NTQ2MDo6OjE2NzUzMDA4NjA6ODY0MDA6MDoxMjNiZTY5YTViYTA0Yzc0YWNmMzVlNjFhZTZiNjY5ZDY6ZGVmYXVsdF80OjE%3D",
            "id": 17
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703831870.921169,
            "hostOnly": false,
            "httpOnly": false,
            "name": "user_status",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "0",
            "id": 18
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703831870.921011,
            "hostOnly": false,
            "httpOnly": false,
            "name": "userid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "664663801",
            "id": 19
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1703831870.921202,
            "hostOnly": false,
            "httpOnly": false,
            "name": "utk",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "baad303c4e50a71ed4990a4c92ef8cc2",
            "id": 20
        },
        {
            "domain": ".10jqka.com.cn",
            "expirationDate": 1738306731.661221,
            "hostOnly": false,
            "httpOnly": false,
            "name": "v",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "A4JvieqeUzlSJk8M4KCyyiPJ04PhU4ceOFN6iMyYqhSgiCw9tOPWfQjnyq2f",
            "id": 21
        },
        {
            "domain": "backtest.10jqka.com.cn",
            "expirationDate": 1703775532.283782,
            "hostOnly": true,
            "httpOnly": true,
            "name": "etrade_robot_session",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "acf35c304259aed7b291c101671b0da1ddc8baa8",
            "id": 22
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

    await wait(Math.random() * 2000 + Math.random() * 3000 + Math.random() * 5010 )

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
            if (err) reject(err)
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
                // let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                // resolve(fileStr)
            }
        }) //readfile
    }) //return Promise
}

let signal = async () => {

    let fileStr = ""

    fileStr += `let 左侧长短周期组合 = ` + JSON.stringify(await csvToJson('左侧长短周期组合'), null, 0) + "\r\n"
    fileStr += `let 右侧长短周期组合 = ` + JSON.stringify(await csvToJson('右侧长短周期组合'), null, 0) + "\r\n"


    fileStr += `let 日周信号组合 = ` + JSON.stringify(await csvToJson('日周信号组合'), null, 0) + "\r\n"
    fileStr += `let 日周信号组合2 = ` + JSON.stringify(await csvToJson('日周信号组合2'), null, 0) + "\r\n"



    fileStr += `let 日买入信号组合 = ` + JSON.stringify(await csvToJson('日买入信号组合'), null, 0) + "\r\n"
    fileStr += `let 日买入信号组合2 = ` + JSON.stringify(await csvToJson('日买入信号组合2'), null, 0) + "\r\n"

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

    let smallDown = lines.filter((item) => {
        //"8.32%"
        return parseFloat(item[6].substring(0, item[6].length - 1)) < 2

    })

    let fileStr = `let smallDown = ` + JSON.stringify(smallDown, null, 0) + "\r\n"

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
    continueslow = lines.map((ele, index) => {
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


    let fileStr = ""
    fileStr += `let bigcontinueslow = ` + JSON.stringify(continueslow, null, 0) + "\r\n"

    try {
        fs.writeFileSync(`${folder}同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`大市值策略回测 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}


let stats = [
    // {
    //     name: "左侧长短周期组合",
    //     type: "回测一下",
    //     query: `
    //             kdj金叉d值小于37，当日涨幅大于0.5，最近5日涨跌幅小于-5，最近5日有≥2次的涨跌幅小于0，
    //             周macd上移，周kdjj值小于60，月kdj上移，实际换手率大于1.7, 
    //             最近10日收盘获利小于5%的天数>0, 最近2日主力资金流入大于-250万，pe<=120，pb>0，排除st
    //     `
    // },
    // {
    //     name: "右侧长短周期组合",
    //     type: "回测一下",
    //     query: `最近5天月线周期kdj金叉；周线周期kdj底背离；周线周期kdj金叉；周线周期kdjj值小于25；日线周期kdj金叉且d值小于35；pe<=120；pb>0；排除st`
    // },

    {
        name: "日周信号组合",
        type: "回测一下",
        query: `周kdj底背离且金叉且j值小于25；kdj金叉且d值小于35；BIAS买入信号；振幅小于12；实际换手率大于2.9；上市天数大于30；roe>0；排除st；roe从大到小`
    },
    {
        name: "日周信号组合2",
        type: "回测一下",
        query: `
              周kdj金叉且j值小于59；最近10日日kdj金叉出现>=1次；日kdjd值小于39；BIAS买入信号；实际换手率大于2.9；股价大于5日均线；
              最近3日收盘获利小于5%的天数>0；最近3日主力资金流入大于-250万；振幅小于12；扣非净利润大于3100万；pe<=120；roe>0；排除st；roe从大到小
        `
    },

    {
        name: "日买入信号组合",
        type: "回测一下",
        query: `kdj买入信号，bias买入信号，wr信号买入，macd买入信号，cci大于-120小于0，振幅小于12，股价低于压力位，实际换手率大于2.9，排除st，排除退市`
    },
    {
        name: "日买入信号组合2",
        type: "回测一下",
        query: `
              kdj买入信号，bias买入信号，wr信号买入，rsi买入信号，周kdj金叉，振幅小于12，cci大于-130小于97，
              过去30个交易日涨跌幅大于-25%，最近3日主力资金流入大于-250万，实际换手率大于1，roe大于0，排除st，换手率从大到小
        `
    },

    // {
    //     name: "小市值",
    //     type: "策略回测",
    //     query: `总市值大于等于10亿小于等于20亿；0<pb<=2.5；0<=pe<=25；股息大于0； BIAS买入信号；放量；振幅小于10；排除st；上市天数>100；roe从大到小排列`,
    //     url: "`https://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=${query}&daysForSaleStrategy=50,60&startDate=${startDate}&endDate=${endDate}&stockHoldCount=1&dayBuyStockNum=1&upperIncome=17&lowerIncome=12&fallIncome=5&engine=undefined&capital=100000`"
    // },
    // {
    //     name: "大市值",
    //     type: "策略回测",
    //     query: `市值大于1000亿；非科创板；非创业板；同花顺二级行业龙头；细分行业龙头；过去3年的基本每股收益增长率>3%；过去30个交易日涨跌幅大于-5%小于23；振幅小于8；股性评分大于12；上市日期从大到小排名；总市值从小到大排列`,
    //     url: "`https://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=${query}&daysForSaleStrategy=20,30&startDate=${startDate}&endDate=${endDate}&stockHoldCount=1&dayBuyStockNum=1&upperIncome=1000&lowerIncome=12&fallIncome=15&engine=undefined&capital=100000`"
    // }
];
let browser;
(async () => {
    //下载数据
    // browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });

    // let startDate = "" + parseInt(current_date.getFullYear()) - 5 + "-01-01"
    // let endDate = getCurrentYMD()

    // for (let i = 0; i < stats.length; i++) {

    //     let query = stats[i].query.trim().replace(/[\r\n]/g, '').replace(/[ ]/g, '')
    //     query = encodeURIComponent(query)
    //     let url = `https://backtest.10jqka.com.cn/backtest/app.html#/backtest?query=${query}&daysForSaleStrategy=10,20&startDate=${startDate}&endDate=${endDate}&benchmark=399300%20沪深300`
    //     if (stats[i].type == "策略回测") {
    //         startDate = "" + parseInt(current_date.getFullYear()) - 4 + "-01-01"
    //         eval("url = " + stats[i].url)
    //     }
    //     console.log("\r\n", url)

    //     let downLoadFile = await taskFileDownloadThsBack(stats[i].name, url)
    //     nameToFile[stats[i].name] = downLoadFile
    // }


    // console.log(nameToFile)
    // await wait(Math.random() * 2000)
    // for (let name in nameToFile) {
    //     if (Object.hasOwnProperty.call(nameToFile, name)) {
    //         let downLoadName = nameToFile[name];
    //         try {
    //             //fs.renameSync(tmpdowloadFolder + downLoadName, folder + `${name}.csv`) 
    //             fs.copyFileSync(tmpdowloadFolder + downLoadName, folder + `${name}.csv`)
    //         }
    //         catch (error) { console.log(error) }
    //     }
    // }

    //回测一下
    await signal()
    //策略回测
    await smallCom()
    await bigCom()

})()