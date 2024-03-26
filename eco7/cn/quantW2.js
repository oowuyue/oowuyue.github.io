const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const {
    getDateInWeekDay,
    wait,
    writeDataToFile,
    getDataFromFile,
    mySendMail,
    isSendMail,
} = require("../ajslib/my.js")


//指定时区的日期时间 前N天 默认北京
function getDateTimeByZone(timezone = 8, preNDay = 0) {
    // 本地时间距离（GMT时间）毫秒数
    let nowDate = new Date().getTime() + preNDay * 24 * 60 * 60 * 1000
    // 本地时间和格林威治时间差，单位分钟
    let offset_GMT = new Date().getTimezoneOffset()
    //  反推到格林尼治时间
    let GMT = nowDate + offset_GMT * 60 * 1000
    //  获取指定时区时间
    let targetDate = new Date(GMT + timezone * 60 * 60 * 1000)

    let Y = targetDate.getFullYear(),
        M = targetDate.getMonth() + 1,
        D = targetDate.getDate(),

        h = targetDate.getHours(), // 获取当前小时数(0-23)
        m = targetDate.getMinutes(), // 获取当前分钟数(0-59)
        s = targetDate.getSeconds();// 获取当前秒数(0-59)

    if (M < 10) M = '0' + M;
    if (D < 10) D = '0' + D;

    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;

    return Y + '-' + M + '-' + D + " " + h + ':' + m + ":" + s;
    //.substring(0,10) YMD
}
let currentDayYMD = getDateTimeByZone().substring(0, 10)


//本机的日期时间
function getDateTimeLocal(preNDay = 0) {
    let stamp = new Date().getTime() + preNDay * 24 * 60 * 60 * 1000;
    let localDate = new Date(stamp);
    let Y = localDate.getFullYear(),
        M = localDate.getMonth() + 1,
        D = localDate.getDate(),

        h = localDate.getHours(), // 获取当前小时数(0-23)
        m = localDate.getMinutes(), // 获取当前分钟数(0-59)
        s = localDate.getSeconds();// 获取当前秒数(0-59)

    if (M < 10) M = '0' + M;
    if (D < 10) D = '0' + D;

    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;

    return Y + '-' + M + '-' + D + " " + h + ':' + m + ":" + s;
}


let browser
async function run() {
    browser = await puppeteer.launch({
        headless: 'new', //Missing X server or $DISPLAY
        defaultViewport: { width: 1366, height: 768 },
        devtools: false
    })

    async function loginThs() {
        let page = await browser.newPage()
        await page.setRequestInterception(true)
        page.on('request', request => request.continue())
        page.on('response', async response => {
            if (response.request().resourceType() === 'image')
                originalImage = await response.buffer().catch(() => { })
        })
        await page.goto('https://upass.10jqka.com.cn/login');
        await page.click('#to_account_login a.pointer')
        await page.type('#account_pannel input#uname', 'mx_664226190');
        await page.type('#account_pannel input#passwd', 'sogo54321');
        await wait(1000)
        await page.click('#account_pannel .submit_btn');
        await wait(3000) //等待第一次弹出验证滑框

        async function tryslide() {
            await page.waitForSelector('#slicaptcha-img');
            await wait(1300)
            const imageSrc = await page.evaluate(async () => {
                //从这开始就是在浏览器中执行代码，已经可以看到我们用熟悉的 querySelector 查找标签
                let image = document.getElementById('slicaptcha-img');
                return image.src
            });
            if (!imageSrc.substring(0, 4).includes("http")) imageSrc = "https:" + imageSrc
            console.log(imageSrc)

            let pageimageSrc = await browser.newPage()
            
            await pageimageSrc.goto(imageSrc)
            await wait(2300)
            let coordinateShift = await pageimageSrc.evaluate(async () => {

                let image = document.getElementsByTagName('img')[0];
                //https://upass.10jqka.com.cn/login  309 177
                image.width = 309
                image.height = 177

                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                // 将验证码图片绘制到画布上
                ctx.drawImage(image, 0, 0, image.width, image.height);
                // 获取画布上的像素数据
                const imageData = ctx.getImageData(0, 0, image.width, image.height);
                // 将像素数据转换为二维数组，处理灰度、二值化，将像素点转换为0（黑色）或1（白色）
                const data = [];

                for (let h = 0; h < image.height; h++) {
                    data.push([]);
                    for (let w = 0; w < image.width; w++) {
                        const index = (h * image.width + w) * 4;
                        const r = imageData.data[index] * 0.2126;
                        const g = imageData.data[index + 1] * 0.7152;
                        const b = imageData.data[index + 2] * 0.0722;
                        if (r + g + b > 140) {
                            data[h].push(1);
                        } else {
                            data[h].push(0);
                        }
                    }
                }
                // 计算每一列黑白色像素点相邻的个数，找到最多的一列，大概率为缺口位置
                let pre = 0
                let maxChangeCount = 0;
                let coordinateShift = 0;
                for (let w = image.width - 1; w > 40; w--) {
                    let changeCount = 0;
                    for (let h = 0; h < image.height; h++) {
                        if (data[h][w] == 0 && data[h][w - 1] == 1) {
                            changeCount++;
                        }
                    }
                    console.log(w, changeCount)

                    if (false
                        || (changeCount >= 11 && (changeCount / pre) >= 2)
                    ) {
                        coordinateShift = w;
                        break
                    }
                    pre = changeCount
                    // if (changeCount > maxChangeCount) {
                    //     maxChangeCount = changeCount;
                    //     coordinateShift = w;
                    // }
                }

                //30-35
                return coordinateShift - 32;
            });
            await pageimageSrc.waitForNavigation()
            console.log("dd:", coordinateShift)
            pageimageSrc.close()


            page.bringToFront()
            function easeOutBounce(t, b, c, d) {
                if ((t /= d) < 1 / 2.75) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < 2 / 2.75) {
                    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
                } else if (t < 2.5 / 2.75) {
                    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
                } else {
                    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
                }
            }
            const drag = await page.$('#slider');
            const dragBox = await drag.boundingBox();
            const dragX = dragBox.x + dragBox.width / 2 + 2;
            const dragY = dragBox.y + dragBox.height / 2 + 2;

            await page.mouse.move(dragX, dragY);
            await page.mouse.down();
            await wait(300)

            // 定义每个步骤的时间和总时间
            const totalSteps = 100;
            const stepTime = 5;

            for (let i = 0; i <= totalSteps; i++) {
                // 当前步骤占总时间的比例
                const t = i / totalSteps;
                // 使用easeOutBounce函数计算当前位置占总距离的比例
                const easeT = easeOutBounce(t, 0, 1, 1);

                const newX = dragX + coordinateShift * easeT - 5;
                const newY = dragY + Math.random() * 10;

                await page.mouse.move(newX, newY, { steps: 1 });
                await wait(stepTime);
            }
            // 松手前最好还是等待一下，这也很符合真实操作
            await wait(500)
            await page.mouse.up();
            return true
        }
        let isLoginSuccess = false
        let tryCount = 0
        do {
            tryCount++
            await tryslide() //尝试滑动
            await wait(3000) //等待成功跳转 或 失败换图和#slicaptcha-text
            let text = ""
            let slicaptchaTextNode = await page.$('#slicaptcha-text')
            if (slicaptchaTextNode) text = await page.evaluate(node => node.innerText, slicaptchaTextNode)
            console.log("text:", text)

            if (!text.includes("向右拖动滑块填充拼图")) { isLoginSuccess = true; break; }

        } while (tryCount <= 5);

        return [isLoginSuccess, page]
    };


    const [loginResult, loginOrIndexPage] = await loginThs()
    if (!loginResult) { browser.close; console.log("登陆同花顺失败"); throw new Error(currentDayYMD + "登陆同花顺失败"); }
    else { loginOrIndexPage.close(); console.log("登陆同花顺OK"); }

    const folder = path.join(__dirname, "/data/同花顺策略GitHubAction/")//个股同花顺策略
    let 策略回测urlTemplate = "`https://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=${query}&daysForSaleStrategy=${daysForSaleStrategy}&startDate=${startDate}&endDate=${endDate}&stockHoldCount=${stockHoldCount}&dayBuyStockNum=${dayBuyStockNum}&upperIncome=${upperIncome}&lowerIncome=${lowerIncome}&fallIncome=${fallIncome}&engine=undefined&capital=100000`"
    let nameToArr = {}
    let tactics = [
        // {
        //     name: "月周日",
        //     query: `最近5天月线周期kdj金叉；周线周期kdj底背离；周线周期kdj金叉；周线周期kdjj值小于25；日线周期kdj金叉且d值小于35；pe<=120；pb>0；排除st`,
        //     daysForSaleStrategy: "20",
        //     stockHoldCount: 10,
        //     dayBuyStockNum: 3,
        //     upperIncome: 23,
        //     fallIncome: 3.5,
        //     lowerIncome: 5.5,
        //     stats: "策略回测"
        // },
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
            name: "测试六日均线",
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
    let taskFileDownloadThsBack = async (tacticName, pageUrl) => {
        const page = await browser.newPage()

        //点击回测
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
        if (!is策略回测Success) { browser.close; throw new Error(currentDayYMD + tacticName + "策略回测失败"); return false; }
        await page.screenshot({ path: `${folder}${getDateTimeByZone().replaceAll(":", "_")},${getDateTimeLocal().replaceAll(":", "_")}.png`, fullPage: true })
        await wait(1000)

        //策略选股
        let 策略选股 = await page.$$eval('.strategy_select table tbody tr', trs => {
            let companysInfo = trs.map(ele => { return Array.from(ele.querySelectorAll("td")) })
            companysInfo = companysInfo.map(ele => { return ele[0].innerText + ele[1]?.innerText })
            return companysInfo   // ['今日无选股undefined']     ['002812恩捷股份', '603486科沃斯', '300347泰格医药']
        });
        console.log("策略选股:", 策略选股)
        if (策略选股 && 策略选股[0] && !策略选股[0].includes("今日无选股")) {
            let sentRes = await mySendMail(currentDayYMD + tacticName + "今日买入：" + 策略选股);
            console.log("策略选股senMailRes:", sentRes?.messageId)
        } else {
            console.log(currentDayYMD, "今日无选股")
        }

        //历史明细查询
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
        //console.log(历史明细) //or空数组
        return 历史明细
    };

    let startDate = "2024-03-10"
    let endDate = getDateTimeByZone(8, -1).substring(0, 10)
    for (let i = 0; i < tactics.length; i++) {
        let tacticName = tactics[i].name
        let query = encodeURIComponent(tactics[i].query.trim().replace(/[\r\n]/g, '').replace(/[ ]/g, ''))
        let daysForSaleStrategy = tactics[i].daysForSaleStrategy ?? "10,20"
        let stockHoldCount = tactics[i].stockHoldCount ?? 1
        let dayBuyStockNum = tactics[i].dayBuyStockNum ?? 1
        let upperIncome = tactics[i].upperIncome ?? 30
        let fallIncome = tactics[i].fallIncome ?? 10
        let lowerIncome = tactics[i].lowerIncome ?? 10

        eval("策略回测url = " + 策略回测urlTemplate)

        let 历史明细 = await taskFileDownloadThsBack(tacticName, 策略回测url) //访问回测
        nameToArr[tacticName] = 历史明细
    }

    let fileStr = `var 策略回测每日日志${currentDayYMD.replaceAll("-", "_")} = ` + JSON.stringify(nameToArr, null, 0) + "\r\n"
    fileStr += `var 北京8区="${getDateTimeByZone()}"\r\nvar 本机时区="${getDateTimeLocal()}"\r\n`
    fs.appendFileSync(`${folder}测试时间日志.js`, fileStr);
    return true
    //网页提示的是到2024-03-18昨天收盘的数据               //网页提示的是到2024-03-20昨天收盘的数据
    // 2024-03-19晚上1-2点触发  2024-03-19天亮九点开盘买入    2024-03-21晚上1-2点触发2024-03-21天亮九点开盘卖出
}


(async () => {
    try {
        await run()
        console.log("everyDay Wencai OK")
    } catch (error) {
        console.log("everyDay backTestWeiCai error: " + error.stack)
        await mySendMail("everyDay  Wencai error: " + error.stack)
    }
    if (browser) browser.close()
    return
})()
