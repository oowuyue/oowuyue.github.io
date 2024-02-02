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
const { captureRejectionSymbol } = require("events");


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
        /*已经获取过的时间id段
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
    if (typeof logSinaSegments === "undefined") var logSinaSegments = [];
    if (typeof logSegments === "undefined") var logSegments = [];
    if (typeof logLapseId === "undefined") var logLapseId = 0;
    if (typeof 喷嚏trigDate === "undefined") var 喷嚏trigDate = [];
    if (typeof 新浪trigDate === "undefined") var 新浪trigDate = [];

    function writeMedisLog() {
        logMediaStr = `var logSinaSegments = ${JSON.stringify(logSinaSegments)} \r\n `;
        logMediaStr += `var logSegments = ${JSON.stringify(logSegments)} \r\n `;
        logMediaStr += `var logLapseId = ${logLapseId} \r\n `;
        logMediaStr += `var 喷嚏trigDate = ${JSON.stringify(喷嚏trigDate)} \r\n `;
        fs.writeFileSync(`${folderLog}logMedia.js`, logMediaStr);
    }

    ////抓取新浪新闻
    async function fetch新浪新闻(endDateArr = [2023, 11, 21], startDateArr = [2024, 1, 1]) {

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
        // if (!logSinaSegments.includes([endDateArr, startDateArr]))
        logSinaSegments.push([endDateArr, startDateArr]);

    }
    async function analysis新浪新闻() {
        function isDown(htmlStr, dirent) {
            let $html = cheerio.load(htmlStr)
            let $ps = $html("p:contains('每天一图卦')").first().nextAll()
            for (let index = 0; index < $ps.length; index++) {
                let pelement = $ps[index]
                let $p = cheerio.load(pelement)
                let ptext = $p.text()
                let regex = /【(\d{1,2})】/;
                let matchArr = ptext.match(regex);
                if (matchArr) {
                    pid = matchArr[1]
                    if (pid > 4) break;
                }

                if (false
                    || ptext.includes("三大股指") || ptext.includes("沪深300")
                    || ptext.includes("上证") || ptext.includes("深证") || ptext.includes("沪指") || ptext.includes("深成指")
                ) {
                    if (false
                        || ptext.includes("指失守") || ptext.includes("指数失守")
                        || ptext.includes("下挫") || ptext.includes("跌超")
                        || ptext.includes("跌逾") || ptext.includes("大跌")
                        || ptext.includes("跌停")
                        && !ptext.includes("震荡")
                    ) {
                        let title = $html('meta[name="DEscriptions"]').attr('contect')
                        let date = title.substring(10, 18).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
                        console.log(date, title.substring(18), " Down!!!", `http://localhost:8000/喷嚏图卦Link/${dirent.name}`)//18
                        return [date, -1, title.substring(18), `http://localhost:8000/喷嚏图卦Link/${dirent.name}`]
                        break;
                    }
                }
            }
            return false

        }
        fs.readdirSync(`${folder新浪}`, { withFileTypes: true }).forEach(function (dirent) {
            //if (dirent.name !== "172837.html") return
            let filePath = folder新浪 + dirent.name
            if (dirent.isFile()) {
                let htmlStr = fs.readFileSync(filePath)
                let result = isDown(htmlStr, dirent)
                if (result && !新浪trigDate.includes(result)) {
                    新浪trigDate.push(result)
                }
            }
        });
    }


    ////抓取喷嚏图卦
    async function fetch喷嚏图卦(endId = 0, startId = 144857) {

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
            fs.writeFile(`${folder喷嚏}${dapentiId}.html`, htmlStr, "utf8", (err) => {
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
    }
    async function analysis喷嚏图卦() {
        //2022-04-21  】上海市民见识到了一辈子都没见过的各色野生品牌食品  Down!!! http://localhost:8000/喷嚏图卦Link/164073.html
        //2022-10-24 】定海神针  Down!!! http://localhost:8000/喷嚏图卦Link/167638.html
        function isDown(htmlStr, dirent) {
            let $html = cheerio.load(htmlStr)
            let $ps = $html("p:contains('每天一图卦')").first().nextAll()
            for (let index = 0; index < $ps.length; index++) {
                let pelement = $ps[index]
                let $p = cheerio.load(pelement)
                let ptext = $p.text()
                let regex = /【(\d{1,2})】/;
                let matchArr = ptext.match(regex);
                if (matchArr) {
                    pid = matchArr[1]
                    if (pid > 4) break;
                }

                if (false
                    || ptext.includes("三大股指") || ptext.includes("沪深300")
                    || ptext.includes("上证") || ptext.includes("深证") || ptext.includes("沪指") || ptext.includes("深成指")
                ) {
                    if (false
                        || ptext.includes("指失守") || ptext.includes("指数失守")
                        || ptext.includes("下挫") || ptext.includes("跌超")
                        || ptext.includes("跌逾") || ptext.includes("大跌")
                        || ptext.includes("跌停")
                        && !ptext.includes("震荡")
                    ) {
                        let title = $html('meta[name="DEscriptions"]').attr('contect')
                        let date = title.substring(10, 18).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
                        console.log(date, title.substring(18), " Down!!!", `http://localhost:8000/喷嚏图卦Link/${dirent.name}`)//18
                        return [date, -1, title.substring(18), `http://localhost:8000/喷嚏图卦Link/${dirent.name}`]
                        break;
                    }
                }
            }
            return false

        }
        function isDown2(htmlStr, dirent) {
            let $html = cheerio.load(htmlStr)
            if (false
                || htmlStr.includes("三大股指") || htmlStr.includes("A股") || htmlStr.includes("a股") || htmlStr.includes("沪深300")
                || htmlStr.includes("上证") || htmlStr.includes("深证") || htmlStr.includes("沪指") || htmlStr.includes("深成指") || htmlStr.includes("创业板")
            ) {

                if (false
                    || htmlStr.includes("指失守") || htmlStr.includes("指数失守")
                    || htmlStr.includes("下挫") || htmlStr.includes("跌超")
                    || htmlStr.includes("跌逾") || htmlStr.includes("收跌")
                    || htmlStr.includes("跌停") || htmlStr.includes("大跌")
                ) {
                    let title = $html('meta[name="DEscriptions"]').attr('contect')
                    let date = title.substring(10, 18).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
                    console.log(date, title.substring(18), " Down!!!", `http://localhost:8000/喷嚏图卦Link/${dirent.name}`)//18
                }



            }
        }
        function hasIncldue(喷嚏trigDate, result) {
            for (let index = 0; index < 喷嚏trigDate.length; index++) {
                const element = 喷嚏trigDate[index];
                if (result[0] == element[0])
                    return true
            }
            return false
        }
        fs.readdirSync(`${folder喷嚏}`, { withFileTypes: true }).forEach(function (dirent) {
            //if (dirent.name !== "172837.html") return
            let filePath = folder喷嚏 + dirent.name
            if (dirent.isFile()) {
                let htmlStr = fs.readFileSync(filePath)
                let result = isDown(htmlStr, dirent)
                if (result && !hasIncldue(喷嚏trigDate, result)) {
                    喷嚏trigDate.push(result)
                }
            }
        });
    }

    // await fetch喷嚏图卦()
    await analysis喷嚏图卦()


    //await fetch新浪新闻()
    //await analysis新浪新闻()

    writeMedisLog()
})();
