const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const {
    getDateInWeekDay,
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
    isSendMail,
    sendMailDate,
    currentDayYM,
    currentDayYMD,
    preDayYMD
} = require("../ajslib/my.js")

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1366, height: 768 },
        devtools: false
    })
    // async function loginThs() {
    //     let page = await browser.newPage()
    //     await page.setRequestInterception(true)
    //     page.on('request', request => request.continue())
    //     page.on('response', async response => {
    //         if (response.request().resourceType() === 'image')
    //             originalImage = await response.buffer().catch(() => { })
    //     })
    //     await page.goto('https://upass.10jqka.com.cn/login');
    //     await page.click('#to_account_login a.pointer')
    //     await page.type('#account_pannel input#uname', 'mx_664226190');
    //     await page.type('#account_pannel input#passwd', 'sogo54321');
    //     await wait(1000)
    //     await page.click('#account_pannel .submit_btn');

    //     async function tryslide() {
    //         await page.waitForSelector('#slicaptcha-img');
    //         await wait(1300)
    //         const imageSrc = await page.evaluate(async () => {
    //             //从这开始就是在浏览器中执行代码，已经可以看到我们用熟悉的 querySelector 查找标签
    //             let image = document.getElementById('slicaptcha-img');
    //             return image.src
    //         });

    //         let pageimageSrc = await browser.newPage()
    //         await pageimageSrc.goto(imageSrc)
    //         await wait(2300)
    //         let coordinateShift = await pageimageSrc.evaluate(async () => {

    //             let image = document.getElementsByTagName('img')[0];
    //             //https://upass.10jqka.com.cn/login  309 177
    //             image.width = 309
    //             image.height = 177

    //             const canvas = document.createElement('canvas');
    //             canvas.width = image.width;
    //             canvas.height = image.height;
    //             const ctx = canvas.getContext('2d');
    //             // 将验证码图片绘制到画布上
    //             ctx.drawImage(image, 0, 0, image.width, image.height);
    //             // 获取画布上的像素数据
    //             const imageData = ctx.getImageData(0, 0, image.width, image.height);
    //             // 将像素数据转换为二维数组，处理灰度、二值化，将像素点转换为0（黑色）或1（白色）
    //             const data = [];

    //             for (let h = 0; h < image.height; h++) {
    //                 data.push([]);
    //                 for (let w = 0; w < image.width; w++) {
    //                     const index = (h * image.width + w) * 4;
    //                     const r = imageData.data[index] * 0.2126;
    //                     const g = imageData.data[index + 1] * 0.7152;
    //                     const b = imageData.data[index + 2] * 0.0722;
    //                     if (r + g + b > 140) {
    //                         data[h].push(1);
    //                     } else {
    //                         data[h].push(0);
    //                     }
    //                 }
    //             }
    //             // 计算每一列黑白色像素点相邻的个数，找到最多的一列，大概率为缺口位置
    //             let pre = 0
    //             let maxChangeCount = 0;
    //             let coordinateShift = 0;
    //             for (let w = image.width - 1; w > 40; w--) {
    //                 let changeCount = 0;
    //                 for (let h = 0; h < image.height; h++) {
    //                     if (data[h][w] == 0 && data[h][w - 1] == 1) {
    //                         changeCount++;
    //                     }
    //                 }
    //                 console.log(w, changeCount)

    //                 if (false
    //                     || (changeCount >= 11 && (changeCount / pre) >= 2)
    //                 ) {
    //                     coordinateShift = w;
    //                     break
    //                 }
    //                 pre = changeCount
    //                 // if (changeCount > maxChangeCount) {
    //                 //     maxChangeCount = changeCount;
    //                 //     coordinateShift = w;
    //                 // }
    //             }

    //             //30-35
    //             return coordinateShift - 32;
    //         });
    //         console.log("dd:", coordinateShift)
    //         pageimageSrc.close()


    //         page.bringToFront()
    //         function easeOutBounce(t, b, c, d) {
    //             if ((t /= d) < 1 / 2.75) {
    //                 return c * (7.5625 * t * t) + b;
    //             } else if (t < 2 / 2.75) {
    //                 return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    //             } else if (t < 2.5 / 2.75) {
    //                 return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    //             } else {
    //                 return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    //             }
    //         }
    //         const drag = await page.$('#slider');
    //         const dragBox = await drag.boundingBox();
    //         const dragX = dragBox.x + dragBox.width / 2 + 2;
    //         const dragY = dragBox.y + dragBox.height / 2 + 2;

    //         await page.mouse.move(dragX, dragY);
    //         await page.mouse.down();
    //         await wait(300)

    //         // 定义每个步骤的时间和总时间
    //         const totalSteps = 100;
    //         const stepTime = 5;

    //         for (let i = 0; i <= totalSteps; i++) {
    //             // 当前步骤占总时间的比例
    //             const t = i / totalSteps;
    //             // 使用easeOutBounce函数计算当前位置占总距离的比例
    //             const easeT = easeOutBounce(t, 0, 1, 1);

    //             const newX = dragX + coordinateShift * easeT - 5;
    //             const newY = dragY + Math.random() * 10;

    //             await page.mouse.move(newX, newY, { steps: 1 });
    //             await page.waitForTimeout(stepTime);
    //         }
    //         // 松手前最好还是等待一下，这也很符合真实操作
    //         await wait(500)
    //         await page.mouse.up();
    //         return true
    //     }

    //     let isLoginSuccess = false
    //     for (let index = 0; index < 5; index++) {
    //         await wait(3000)
    //         let text = ""
    //         let slicaptchaTextNode = await page.$('#slicaptcha-text')
    //         if (slicaptchaTextNode) text = await page.evaluate(node => node.innerText, slicaptchaTextNode)
    //         console.log(text)
    //         if (text.includes("向右拖动滑块填充拼图"))
    //             await tryslide();
    //         else {
    //             isLoginSuccess = true
    //             break
    //         }
    //     }

    //     await wait(1000)
    //     return [isLoginSuccess, page]
    // };
    // const [loginResult, loginOrIndexPage] = await loginThs()
    // if (!loginResult) { mySendMail(currentDayYMD + "登陆同花顺失败"); browser.close; return false }
    // else { loginOrIndexPage.close() }


    const folder = path.join(__dirname, "/data/同花顺策略GitHubAction/")//个股同花顺策略
    let tactics = [
        {
            name: "月周日",
            query: `最近5天月线周期kdj金叉；周线周期kdj底背离；周线周期kdj金叉；周线周期kdjj值小于25；日线周期kdj金叉且d值小于35；pe<=120；pb>0；排除st`,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 23,
            fallIncome: 3.5,
            lowerIncome: 5.5,
            stats: "策略回测"
        },
        // {
        //     name: "左侧月周日",
        //     query: `
        //             kdj金叉d值小于37，当日涨幅大于0.5，最近5日涨跌幅小于-5，最近5日有≥2次的涨跌幅小于0，
        //             周macd上移，周kdjj值小于60，月kdj上移，实际换手率大于1.7, 
        //             最近10日收盘获利小于5%的天数>0, 最近2日主力资金流入大于-250万，pe<=120，pb>0，排除st
        //     `,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 30,
        //     fallIncome: 7,
        //     lowerIncome: 7,
        //     stats: "策略回测"
        // },


        // {
        //     name: "周日",
        //     query: `
        //           周kdj金叉且j值小于59；最近10日日kdj金叉出现>=1次；日kdjd值小于39；BIAS买入信号；实际换手率大于2.9；股价大于5日均线；
        //           最近3日收盘获利小于5%的天数>0；最近3日主力资金流入大于-250万；振幅小于12；放量；pe<=120；roe>0；排除st；roe从大到小
        //     `,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 33,
        //     fallIncome: 10,
        //     lowerIncome: 8.5,
        //     stats: "策略回测"
        // },
        // {
        //     name: "周日2",
        //     query: `周kdj底背离且金叉且j值小于25；kdj金叉且d值小于35；BIAS买入信号；振幅小于12；实际换手率大于2.9；上市天数大于30；roe>0；排除st；roe从大到小`,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 33,
        //     fallIncome: 10,
        //     lowerIncome: 8.5,
        //     stats: "策略回测"
        // },

        // {
        //     name: "日信号",
        //     query: `
        //           kdj买入信号，bias买入信号，wr信号买入，rsi买入信号，周kdj金叉，振幅小于12，cci大于-130小于97，
        //           过去30个交易日涨跌幅大于-25%，最近3日主力资金流入大于-250万，实际换手率大于1，roe大于0，排除st，换手率从大到小
        //     `,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 25,
        //     fallIncome: 10,
        //     lowerIncome: 12,
        //     stats: "策略回测"
        // },
        // {
        //     name: "日信号2",
        //     query: `kdj买入信号，bias买入信号，wr信号买入，macd买入信号，cci大于-120小于0，振幅小于12，股价低于压力位，实际换手率大于2.9，排除st，排除退市`,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 20,
        //     fallIncome: 5.5,
        //     lowerIncome: 10.5,
        //     stats: "策略回测"
        // },


        {
            name: "6日均线",
            query: `行情收盘价>6日的均线，收盘价>昨日的最高价，当日阳线，昨日的macd增长值<0，当日的macd增长值>0，最近7日放量，量比大于1，前7日的区间主力资金流向>0，17>pb>0`,
            daysForSaleStrategy: "2",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 30,
            fallIncome: 9,
            lowerIncome: 13.5,
            stats: "策略回测"
        },
    ];
    let 回测一下urlTemplate = "`https://backtest.10jqka.com.cn/backtest/app.html#/backtest?query=${query}&daysForSaleStrategy=${daysForSaleStrategy}&startDate=${startDate}&endDate=${endDate}&benchmark=399300%20沪深300`"
    let 策略回测urlTemplate = "`https://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=${query}&daysForSaleStrategy=${daysForSaleStrategy}&startDate=${startDate}&endDate=${endDate}&stockHoldCount=${stockHoldCount}&dayBuyStockNum=${dayBuyStockNum}&upperIncome=${upperIncome}&lowerIncome=${lowerIncome}&fallIncome=${fallIncome}&engine=undefined&capital=100000`"
    let nameToArr = {}
    let justProduceLink = false
    let htmlStr = ""
    let taskFileDownloadThsBack = async (name, pageUrl) => {
        const page = await browser.newPage()
        //手动的登陆同花顺editthiscookie插件复制cookie
        let ths_cookie = [
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999229,
                "hostOnly": false,
                "httpOnly": false,
                "name": "escapename",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "MTSoftware12",
                "id": 1
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1742610508,
                "hostOnly": false,
                "httpOnly": false,
                "name": "Hm_lvt_722143063e4892925903024537075d0d",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1711003340,1711069873",
                "id": 2
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1742627191,
                "hostOnly": false,
                "httpOnly": false,
                "name": "Hm_lvt_78c58f01938e4d85eaf619eae71b4ed1",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1711071092,1711091191",
                "id": 3
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1742610509,
                "hostOnly": false,
                "httpOnly": false,
                "name": "Hm_lvt_929f8b362150b1f77b477230541dbbc2",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1711071092",
                "id": 4
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1729924379,
                "hostOnly": false,
                "httpOnly": false,
                "name": "searchGuide",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "sg",
                "id": 5
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999269,
                "hostOnly": false,
                "httpOnly": false,
                "name": "ticket",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "9e4d3fb813a42c5879d0178106cc2354",
                "id": 6
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711957707.202487,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_did",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "9B0785480A944430BA435E701FF94C57",
                "id": 7
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711957707.202415,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_dpass",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "zcCSAa1oAfJ8MD1BV%2BLxisOTDwhzxCo%2BRDCv6uZDRR6zXPSpXLISiHRbUDrBaMX5%2FsBAGfA5tlbuzYBqqcUNFA%3D%3D",
                "id": 8
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999188,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_name",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "MTSoftware12",
                "id": 9
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711957707.202553,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_ttype",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "WEB",
                "id": 10
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711957707.20219,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_ukey",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "A10702B8689642C6BE607730E11E6E4A",
                "id": 11
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711957707.20234,
                "hostOnly": false,
                "httpOnly": false,
                "name": "u_uver",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "1.0.0",
                "id": 12
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.998962,
                "hostOnly": false,
                "httpOnly": false,
                "name": "user",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "MDpNVFNvZnR3YXJlMTI6Ok5vbmU6NTAwOjY3NDY2MzgwMTo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDo6Ojo2NjQ2NjM4MDE6MTcxMTM0MzAwNzo6OjE2NzUzMDA4NjA6ODY0MDA6MDoxOTFhNjcwNmY4MWU1OWM1YjU3MTUzNjljZmY4OTVlNWE6ZGVmYXVsdF80OjE%3D",
                "id": 13
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999341,
                "hostOnly": false,
                "httpOnly": false,
                "name": "user_status",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "0",
                "id": 14
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999126,
                "hostOnly": false,
                "httpOnly": false,
                "name": "userid",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "664663801",
                "id": 15
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1711429407.999424,
                "hostOnly": false,
                "httpOnly": false,
                "name": "utk",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "a01942ff0f6b77b94a87f1371867b366",
                "id": 16
            },
            {
                "domain": ".10jqka.com.cn",
                "expirationDate": 1745903012.760008,
                "hostOnly": false,
                "httpOnly": false,
                "name": "v",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "A0sLZQolqRIn7vXHqNxJRl0a2uQw4F9i2fQjFr1IJwrh3GWaRbDvsunEs2PO",
                "id": 17
            },
            {
                "domain": "backtest.10jqka.com.cn",
                "expirationDate": 1711371813.460361,
                "hostOnly": true,
                "httpOnly": true,
                "name": "etrade_robot_session",
                "path": "/",
                "sameSite": "unspecified",
                "secure": false,
                "session": false,
                "storeId": "0",
                "value": "584f2e519d61b120c1c625db262aa5ba24adc5df",
                "id": 18
            }
        ]
        for (let i = 0; i < ths_cookie.length; i++) {
            await page.setCookie(ths_cookie[i]);
        }

        let is策略回测Success = false
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        await wait(Math.random() * 2000 + Math.random() * 3000 + Math.random() * 5010)
        let errorLoaction = ".order-successful-execution-order.error"
        let errorTip = await page.$(errorLoaction)
        if (errorTip) {
            let i = 0;
            do {
                await page.evaluate((errorLoaction) => {
                    var elements = document.querySelectorAll(errorLoaction);
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, errorLoaction)
                await page.click('.question_model_normal .beginbacktest')
                await wait(Math.random() * 2000 + Math.random() * 3000 + Math.random() * 2010)
                let errorTip = await page.$(errorLoaction)
                if (!errorTip) { is策略回测Success = true; break; }
                i++
            } while (i < 3);
        } else {
            is策略回测Success = true
        }
        if (!is策略回测Success) { mySendMail(currentDayYMD + name + "策略回测失败"); browser.close; return false }



        let 策略选股 = await page.$$eval('.strategy_select table tbody tr', trs => {
            let companysInfo = trs.map(ele => { return Array.from(ele.querySelectorAll("td")) })
            companysInfo = companysInfo.map(ele => { return ele[0].innerText + ele[1]?.innerText })
            return companysInfo   // ['今日无选股undefined']     ['002812恩捷股份', '603486科沃斯', '300347泰格医药']
        });
        if (策略选股 && !策略选股[0].includes("今日无选股")) {
            mySendMail(currentDayYMD + name + "今日买入：" + 策略选股);
        } else {
            console.log(currentDayYMD, "今日无选股")
        }


        let 历史明细 = await page.$$eval('.history_detail_main table tbody tr', trs => {
            let companysInfo = trs.map(ele => { return Array.from(ele.querySelectorAll("td")) })
            companysInfo = companysInfo.map(companyTds => {
                let companyArr = []
                for (let index = 0; index < companyTds.length; index++) {
                    if (index == 2) {
                        let startDate = companyTds[index].innerText
                        startDate = startDate.substring(0, 4) + "-" + startDate.substring(4, 6) + "-" + startDate.substring(6)
                        companyArr.push(startDate)
                        continue
                    }
                    if (index == 3) {
                        let endDate = companyTds[index].innerText
                        if (endDate.includes("持仓")) endDate = "持仓"
                        else endDate = endDate.substring(0, 4) + "-" + endDate.substring(4, 6) + "-" + endDate.substring(6)
                        companyArr.push(endDate)
                        continue
                    }
                    companyArr.push(companyTds[index]?.innerText)
                }
                return companyArr
            });
            return companysInfo
        });
        console.log(历史明细) //or空数组
        return 历史明细
    };

    let startDate = "" + parseInt(currentDayYMD.substring(0, 4)) - 2 + "-01-01"
    let endDate = preDayYMD
    for (let i = 0; i < tactics.length; i++) {
        let dataName = tactics[i].name
        let dataFile = `${folder}${dataName}.csv`
        let isFileExit = fs.existsSync(dataFile)
        if (isFileExit) {
            let modifyDate = fs.statSync(dataFile).mtime.toISOString().substring(0, 10)
            let isFileToday = currentDayYMD == modifyDate
            //if (isFileToday) continue
        }

        let query = encodeURIComponent(tactics[i].query.trim().replace(/[\r\n]/g, '').replace(/[ ]/g, ''))
        let daysForSaleStrategy = tactics[i].daysForSaleStrategy ?? "10,20"
        let stockHoldCount = tactics[i].stockHoldCount ?? 1
        let dayBuyStockNum = tactics[i].dayBuyStockNum ?? 1
        let upperIncome = tactics[i].upperIncome ?? 30
        let fallIncome = tactics[i].fallIncome ?? 10
        let lowerIncome = tactics[i].lowerIncome ?? 10

        eval("回测一下url = " + 回测一下urlTemplate)
        eval("策略回测url = " + 策略回测urlTemplate)

        htmlStr += `<tr> <td><a href="${回测一下url}" target="_blank">${dataName}</a></td> <td><a href="${策略回测url}" target="_blank">${dataName}</a></td> </tr>`
        if (i == tactics.length - 1) fs.writeFileSync(`${folder}同花顺策略链接.html`, `<table><tr><td>回测一下</td><td>策略回测</td></tr>${htmlStr}</table>`)
        if (justProduceLink || !tactics[i].stats) continue
        
        let downBackUrl = tactics[i].stats == "策略回测" ? 策略回测url : 回测一下url
        let 历史明细 = await taskFileDownloadThsBack(dataName, downBackUrl) //访问回测
        nameToArr[dataName] = 历史明细
    }
    //if (justProduceLink || !tactics[i].stats) return


    let signal = async () => {
        let 统计Contact = []
        function countStat(name = "周日", Period = "week") {
            if (typeof nameToArr[name] === "undefined") return []
            let countObj = {}
            nameToArr[name].forEach((element) => {
                let startTime = element[2] //day
                if (Period == "week") startTime = getDateInWeekDay(element[2])
                if (Period == "month") startTime = element[2].substring(0, 7) + "-28"
                if (countObj[startTime]) {
                    countObj[startTime].count += 1;
                    countObj[startTime].detail.push(element);
                } else {
                    countObj[startTime] = { count: 1, detail: [element] }
                }
            })
            let countArr = []
            for (var key of Object.keys(countObj)) {
                startTime = key //month day
                countArr.push([startTime, countObj[key].count, name, countObj[key].detail])
            }
            return countArr
        }
        for (let i = 0; i < tactics.length; i++) {
            统计Contact = 统计Contact.concat(countStat(tactics[i].name))
        }
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
            技术指标统计.push([dateKey, sum, 统计byDate[dateKey]])
        }

        let fileStr = `var 技术指标统计 = ` + JSON.stringify(技术指标统计, null, 0) + "\r\n"
        try {
            fs.writeFileSync(`${folder}同花顺策略统计.js`, fileStr);
            console.log(`回测一下 JSON data is saved`);
        } catch (error) {
            console.error(error);
        }
        return true
    };                             //网页提示的是到2024-03-18昨天收盘的数据               //网页提示的是到2024-03-20昨天收盘的数据
    await signal()//回测一下    2024-03-19晚上1-2点触发  2024-03-19天亮九点开盘买入    2024-03-21晚上1-2点触发2024-03-21天亮九点开盘卖出

}


run()