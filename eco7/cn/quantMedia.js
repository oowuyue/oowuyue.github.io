const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const useProxy = require("puppeteer-page-proxy");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const http = require("http");
const fs = require("fs");
const path = require("path");
const {
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
} = require("../ajslib/my.js");
const { json } = require("stream/consumers");


const folderLog = "./data/";
const folder喷嚏 = "E:\\喷嚏图卦\\";
const folder新浪 = "E:\\新浪新闻\\";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--blink-settings=imagesEnabled=false"],
    });
    let page = await browser.newPage();

    // await page.goto('https://www.zdaye.com/dayProxy.html')
    // const $index = cheerio.load(await page.content())
    // let zdayeIpsUrl = $index('div.content:nth-child(2) .arctitle a').attr("href")
    // await page.goto("https://www.zdaye.com" + zdayeIpsUrl)
    // const $zdayeIpsHtml = cheerio.load(await page.content())
    // let zdayeIpsArr = []
    // $zdayeIpsHtml('#ipc').find("tr").each(function () {
    //     let ip = $zdayeIpsHtml(this).find('td:eq(0)').text();
    //     let port = $zdayeIpsHtml(this).find('td:eq(1)').text();
    //     let http = $zdayeIpsHtml(this).find('td:eq(2)').text();
    //     console.log(ip, port, http, "\r\n")
    //     if (http == "http" || http == "HTTP")
    //         zdayeIpsArr.push("http://" + ip + ":" + port);
    // })

    // await page.goto("https://www.kuaidaili.com/free/intr/1/")
    // const $kuaidailiIpsHtml = cheerio.load(await page.content())
    // let kuaidailiIpsArr = []
    // $kuaidailiIpsHtml('table').find("tr").each(function () {
    //     let ip = $kuaidailiIpsHtml(this).find('td:eq(0)').text();
    //     let port = $kuaidailiIpsHtml(this).find('td:eq(1)').text();
    //     let http = $kuaidailiIpsHtml(this).find('td:eq(3)').text();
    //     console.log(ip, port, http, "\r\n")
    //     if (http == "http" || http == "HTTP")
    //         kuaidailiIpsArr.push("http://" + ip + ":" + port);
    // })

    // let ipsArr = [...zdayeIpsArr, ...kuaidailiIpsArr]
    // for (let index = 0; index < ipsArr.length; index++) {
    //     let proxyIp = ipsArr[index]
    //     try {
    //         await useProxy(page, proxyIp)
    //         console.log('change proxy success, start to visit url')
    //         resp = await page.goto('http://httpbin.org/ip')
    //         resCode = await resp.status()
    //         ipsArr[index] = [proxyIp, resCode]
    //         console.log(resCode)
    //     } catch (error) {
    //         ipsArr[index] = [proxyIp, "error"]
    //         console.log(error)
    //     }
    // }
    // console.log(ipsArr)


    //恢复日志
    try {
        var logMediaStr = fs.readFileSync(`${folderLog}logMedia.js`, {
            encoding: "utf8",
            flag: "r",
        });
        if (logMediaStr) eval(logMediaStr);
    } catch (e) {
        /*
          var logSinaSegments = [ 
            [ [2024, 0, 1]，[2024, 1, 1] ],
            [ [2024, 0, 1]，[2024, 1, 1] ],
          ]

          var logSegments = [ 
            [156070,176638],
             [156070,176638] 
          ] 
          var logLapseId = 0
        
          */
        //console.log(e)
    }



    //新浪新闻
    if (typeof logSinaSegments === "undefined") var logSinaSegments = [];
    function isInSinaLogSegments(dateObj) {
        for (let index = 0; index < logSinaSegments.length; index++) {
            let segment = logSinaSegments[index];
            if (
                new Date(...segment[0]) <= dateObj &&
                dateObj <= new Date(...segment[1])
            )
                return true;
        }
        return false;
    }
    function stampToDate(stamp) {
        let date1 = new Date(stamp);
        let y = date1.getFullYear(),
            m = date1.getMonth() + 1,
            d = date1.getDate();

        if (m < 10) m = "0" + m;
        if (d < 10) d = "0" + d;

        return y + "-" + m + "-" + d;
    }
    let ipIndex = -1
    async function getSina(dateStr) {
        await page.setRequestInterception(true);
        page.on("request", (interceptedRequest) => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;
            if (
                interceptedRequest.url().endsWith(".js") ||
                interceptedRequest.url().endsWith(".css") ||
                interceptedRequest.url().includes(".js?") ||
                interceptedRequest.url().includes("google") ||
                interceptedRequest.url().includes("jquery")
            )
                interceptedRequest.abort();
            else interceptedRequest.continue();
        });
        // ipIndex++
        // if (ipIndex > ipsArr.length - 1) ipIndex = 0
        // await useProxy(page, ipsArr[ipIndex])
        // console.log("useProxy ", ipsArr[ipIndex])

        let resp = await page.goto(`https://news.sina.com.cn/head/news${dateStr}pm.shtml`);
        if (resp.status() == 200) {
            let htmlStr = await page.content();
            return htmlStr;
        } else {
            console.log(dateStr, " http error: ", resp.status());
            return false;
        }
    }

    let startDateArr = [2024, 1, 1];
    let endDateArr = [2023, 11, 21];
    let startDate = new Date(...startDateArr);
    let endDate = new Date(...endDateArr);
    let failArr = []
    for (let d = startDate; d >= endDate; d.setDate(d.getDate() - 1)) {
        if (isInSinaLogSegments(d)) { console.log("InSinaLogSegments", stampToDate(d.getTime())); continue; }
        let dateStr = stampToDate(d.getTime());
        let htmlStr = await getSina(dateStr.replaceAll("-", ""));
        if (htmlStr) {
            fs.writeFile(`${folder新浪}${dateStr}.html`, htmlStr, "utf8", (err) => {
                if (err) {
                    console.log(`${dateStr}写入失败${err}`);
                } else {
                    console.log(`${dateStr}写入成功`);
                }
            });
        } else {
            failArr.push(dateStr)
        }
    }

    logSinaSegments.push([endDateArr, startDateArr]);
    logMediaStr = `var logSinaSegments = ${JSON.stringify(logSinaSegments)} \r\n `;

    logMediaStr += `var logSegments = ${JSON.stringify(logSegments)} \r\n `;
    logMediaStr += `var logLapseId = ${logLapseId} \r\n `;
    fs.writeFileSync(`${folderLog}logMedia.js`, logMediaStr);




    //打喷嚏
    async function getDapenti(id) {
        await page.setRequestInterception(true);
        page.on("request", (interceptedRequest) => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;
            if (
                interceptedRequest.url().endsWith(".js") ||
                interceptedRequest.url().endsWith(".css") ||
                interceptedRequest.url().includes(".js?") ||
                interceptedRequest.url().includes("google") ||
                interceptedRequest.url().includes("jquery")
            )
                interceptedRequest.abort();
            else interceptedRequest.continue();
        });
        await page.goto(
            "https://www.dapenti.com/blog/more.asp?name=xilei&id=" + id
        );
        let htmlStr = await page.content();
        return htmlStr;
    }
    if (typeof logSegments === "undefined") var logSegments = [];
    if (typeof logLapseId === "undefined") var logLapseId = 0;
    function isInLogSegments(id) {
        for (let index = 0; index < logSegments.length; index++) {
            let segment = logSegments[index];
            if (segment[0] <= id && id <= segment[1]) return true;
        }
        return false;
    }
    function isLapse(id) {
        if (id <= logLapseId) return true;
        return false;
    }

    //2021-4-2 156070 写入成功
    //2020-3-14 146704 写入成功
    let startId = 144857;
    let endId = 0;
    let lapseContinueCount = 0
    for (let dapentiId = startId; dapentiId > endId; dapentiId--) {
        if (isLapse(dapentiId)) {
            console.log(dapentiId + " lessLogLapse");
            break;
        }
        if (isInLogSegments(dapentiId)) {
            console.log(dapentiId + " InLogSegments");
            continue;
        }


        let htmlStr = await getDapenti(dapentiId);

        if (htmlStr.includes("请你及时访问本站最新网页")) {
            lapseContinueCount++
            if (lapseContinueCount > 5) {//连续6次
                logLapseId = dapentiId;
                console.log("失效id： " + logLapseId);
                break;
            }
        } else {
            lapseContinueCount = 0
        }
        if (!htmlStr.includes("每天一图卦")) {
            continue;
        }

        let $html = cheerio.load(htmlStr);
        let dateStr = $html(".oblog_text:eq(1)").text();
        let regex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
        let [ymd, year, month, day] = dateStr.match(regex);

        htmlStr = htmlStr.replace("charset=gb2312", "charset=utf8");
        fs.writeFile(`${folder}${dapentiId}.html`, htmlStr, "utf8", (err) => {
            if (err) {
                console.log(`${ymd} ${dapentiId}写入失败${err}`);
            } else {
                console.log(`${ymd} ${dapentiId}写入成功`);
                fs.utimes(
                    `${folder}${dapentiId}.html`,
                    new Date(ymd),
                    new Date(ymd),
                    (err) => {
                        console.log(err);
                    }
                );
            }
        });
    } //for

    logSegments.push([endId, startId]);
    logMediaStr = `var logSegments = ${JSON.stringify(logSegments)} \r\n `;
    if (logLapseId > 0) logMediaStr += `var logLapseId = ${logLapseId} \r\n `;

    logMediaStr += `var logSinaSegments = ${JSON.stringify(logSinaSegments)} \r\n `;
    fs.writeFileSync(`${folderLog}logMedia.js`, logMediaStr);

})();
