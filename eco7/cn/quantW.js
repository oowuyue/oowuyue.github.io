const puppeteer = require('puppeteer')
const Rembrandt = require('rembrandt')

async function run () {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1366, height: 768 }
    })
    const page = await browser.newPage()

    let originalImage = ''

    await page.setRequestInterception(true)
    page.on('request', request => request.continue())
    page.on('response', async response => {
        if (response.request().resourceType() === 'image')
            originalImage = await response.buffer().catch(() => {})
    })

    await page.goto('https://monoplasty.github.io/vue-monoplasty-slide-verify/')

    const sliderElement = await page.$('.slide-verify-slider')
    const slider = await sliderElement.boundingBox()

    const sliderHandle = await page.$('.slide-verify-slider-mask-item')
    const handle = await sliderHandle.boundingBox()

    let currentPosition = 0
    let bestSlider = {
        position: 0,
        difference: 100
    }

    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
    await page.mouse.down()


    let differenceArr = []
    while (currentPosition < slider.width - handle.width / 2) {

        await page.mouse.move(
            handle.x + currentPosition,
            handle.y + handle.height / 2 + Math.random() * 10 - 5
        )

        let sliderContainer = await page.$('.slide-verify')

        await sliderContainer.screenshot({ path: currentPosition+'.png' });
        
        let sliderImage = await sliderContainer.screenshot()


        const rembrandt = new Rembrandt({
            imageA: originalImage,
            imageB: sliderImage,
            thresholdType: Rembrandt.THRESHOLD_PERCENT
        })

        let result = await rembrandt.compare()
        let difference = result.percentageDifference * 1000
        
        differenceArr.push([difference,currentPosition])

        //console.log(difference ,currentPosition)
        // if (difference < bestSlider.difference) {
        //     bestSlider.difference = difference
        //     bestSlider.position = currentPosition
        //     console.log(difference, currentPosition)
        // }

        currentPosition += 3
    }

    differenceArr.sort((a, b) => a[0] - b[0]);
    console.log(differenceArr)
    let best = differenceArr[0][1]
    await page.mouse.move(handle.x + best, handle.y + handle.height / 2, { steps: 10 })
    await page.mouse.up()

    //await page.waitFor(3000)

    // success!

    //await browser.close()
}

run()