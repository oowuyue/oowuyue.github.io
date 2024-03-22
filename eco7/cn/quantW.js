const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const {

    wait,

} = require("../ajslib/my.js")

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1366, height: 768 },
        devtools: false
    })

    const page = await browser.newPage()
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

    async function tryslide() {
        await page.waitForSelector('#slicaptcha-img');
        await wait(1300)
        const imageSrc = await page.evaluate(async () => {
            //从这开始就是在浏览器中执行代码，已经可以看到我们用熟悉的 querySelector 查找标签
            let image = document.getElementById('slicaptcha-img');
            return image.src
        });

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

        //coordinateShift-=42
        console.log("dd:", coordinateShift)


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
            await page.waitForTimeout(stepTime);
        }
        // 松手前最好还是等待一下，这也很符合真实操作
        await wait(500)
        await page.mouse.up();
        return true
    }

    for (let index = 0; index < 5; index++) {
        await wait(3000)
        let text = ""
        let slicaptchaTextNode = await page.$('#slicaptcha-text')
        if (slicaptchaTextNode) text = await page.evaluate(node => node.innerText, slicaptchaTextNode)
        console.log(text)
        if (text.includes("向右拖动滑块填充拼图"))
            await tryslide();
        else
            break
    }
    await wait(1000)


    let url周日组合 = "https://backtest.10jqka.com.cn/backtest/app.html#/backtest?query=%E5%91%A8kdj%E9%87%91%E5%8F%89%E4%B8%94j%E5%80%BC%E5%B0%8F%E4%BA%8E59%EF%BC%9B%E6%9C%80%E8%BF%9110%E6%97%A5%E6%97%A5kdj%E9%87%91%E5%8F%89%E5%87%BA%E7%8E%B0%3E%3D1%E6%AC%A1%EF%BC%9B%E6%97%A5kdjd%E5%80%BC%E5%B0%8F%E4%BA%8E39%EF%BC%9BBIAS%E4%B9%B0%E5%85%A5%E4%BF%A1%E5%8F%B7%EF%BC%9B%E5%AE%9E%E9%99%85%E6%8D%A2%E6%89%8B%E7%8E%87%E5%A4%A7%E4%BA%8E2.9%EF%BC%9B%E8%82%A1%E4%BB%B7%E5%A4%A7%E4%BA%8E5%E6%97%A5%E5%9D%87%E7%BA%BF%EF%BC%9B%E6%9C%80%E8%BF%913%E6%97%A5%E6%94%B6%E7%9B%98%E8%8E%B7%E5%88%A9%E5%B0%8F%E4%BA%8E5%25%E7%9A%84%E5%A4%A9%E6%95%B0%3E0%EF%BC%9B%E6%9C%80%E8%BF%913%E6%97%A5%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%E6%B5%81%E5%85%A5%E5%A4%A7%E4%BA%8E-250%E4%B8%87%EF%BC%9B%E6%8C%AF%E5%B9%85%E5%B0%8F%E4%BA%8E12%EF%BC%9B%E6%94%BE%E9%87%8F%EF%BC%9Bpe%3C%3D120%EF%BC%9Broe%3E0%EF%BC%9B%E6%8E%92%E9%99%A4st%EF%BC%9Broe%E4%BB%8E%E5%A4%A7%E5%88%B0%E5%B0%8F&daysForSaleStrategy=10&startDate=2019-01-01&endDate=2024-03-14&benchmark=399300%20%E6%B2%AA%E6%B7%B1300"
    const page周日组合 = await browser.newPage();
    await page周日组合.goto(url周日组合);

}

run()