const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {
    wait
} = require("./eco7/ajslib/my.js")
const nodemailer = require("nodemailer");




/*
时间戳定义为从格林威治时间1970年01月01日00时00分00秒起至现在的总秒数。
因此，严格来说，不管你处在地球上的哪个地方，任意时间点的时间戳都是相同的。这点有利于线上和客户端分布式应用统一追踪时间信息。
但是不同的时区，当前时间戳对应的当前时间是不同的。
*/
console.log("时间戳：", new Date().getTime())
console.error("fdfddf") //githubAction 不通知




async function xqTest(msg) {

    async function getXueQiu() {
        var browser
        var visitXqIndex = async () => {
            if (await wait(10) && browser && indexPage) return

            if (os.platform() == "win32") browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] })
            else browser = await puppeteer.launch({ headless: true })
            browser.on('disconnected', () => { browser = undefined; indexPage = undefined; })

            indexPage = await browser.newPage();
            await indexPage.setRequestInterception(true)
            indexPage.on('request', (request) => { request.continue() })
            indexPage.on('load', () => { })
            await indexPage.goto("https://xueqiu21212.com/", { waitUntil: 'networkidle2' })
        }
        await visitXqIndex()

        var getDataFromUrlFunc = async (dataName, dataCode) => {
            let startTime = 31813200000
            getXueQiuNowTimestamp = new Date().getTime()
            if (os.platform() != "win32") getXueQiuNowTimestamp = getXueQiuNowTimestamp + 8 * 60 * 60 * 1000 //github Action utc
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
    var getDataFromUrlFunc = getDataFromUrlFunc ?? await getXueQiu()
    dayDatas = await getDataFromUrlFunc("沪深300_xueqiu_day", "SH000300")
    return dayDatas[0].date
}

async function mailTest(msg) {
    let promise = new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                pool: true,
                host: "smtp.163.com",
                port: 465,
                secure: true, // Use `true` for port 465, `false` for all other ports
                secureConnection: true,
                auth: {
                    user: "o111owuyue@163.com",
                    pass: "AEUORGVIOHTDGDGZ",  //qq8516 的：swvwmndqaedjbfii 
                },
            });
            transporter.sendMail({
                from: '"oowuyue" <oowuyue@163.com>', // sender address
                to: "3434384699@qq.com, 851616860@qq.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: msg, // plain text body
                html: msg, // html body
            }, (err, info) => {
                if (err) reject(err)
                else resolve(info)
            });

        } catch (error) {
            reject(error)
        }
    });
    return promise
}

async function thsLoginTest() {
    browser = await puppeteer.launch({
        headless: 'new', //Missing X server or $DISPLAY  headless: 'new',   headless: false, 
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
        await page.goto('https://upass.10jqka.com.cn/login', { waitUntil: 'networkidle0' })
        await page.click('#to_account_login a.pointer');
        let uname = "Mtsoftware12"
        console.log("os.platform() ", os.platform())
        if (os.platform() == "linux") uname = "mx_664226190"
        await page.type('#account_pannel input#uname', uname); //Mtsoftware12   mx_664226190
        await page.type('#account_pannel input#passwd', 'sogo54321');
        await wait(500)
        await page.click('#account_pannel .submit_btn');
        await page.waitForSelector('#slicaptcha-img') //等待第一次弹出验证滑框
        await wait(3000)

        async function tryslide() {
            let imageSrc = await page.evaluate(async () => {
                let image = document.getElementById('slicaptcha-img');
                return image.src
            });
            if (!imageSrc.substring(0, 4).includes("http")) imageSrc = "https:" + imageSrc
            console.log(imageSrc)

            let pageimageSrc = await browser.newPage()
            await pageimageSrc.goto(imageSrc, { waitUntil: 'networkidle0' })
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

            if (!text.includes("向右拖动滑块填充拼图")) {
                await page.waitForFunction(() => { return document.readyState === 'complete' });
                isLoginSuccess = true;
                break;
            }

        } while (tryCount <= 5);

        return [isLoginSuccess, page, tryCount]
    };
    const [loginResult, loginOrIndexPage, tryCount] = await loginThs()
    if (!loginResult) {
        console.log("登陆同花顺失败", tryCount);
        browser.close;
        throw new Error(currentDayYMD + "登陆同花顺失败");
    }
    else {
        await loginOrIndexPage.screenshot({ path: `${folder}${os.platform}loginOrIndexPage${getDateTimeByZone().replaceAll(":", "_")},${getDateTimeLocal().replaceAll(":", "_")}.png`, })
        //loginOrIndexPage.close(); 
        console.log("登陆同花顺OK", tryCount);
    }
}

(async () => {
    let mailRes = await loginThs()
})()








