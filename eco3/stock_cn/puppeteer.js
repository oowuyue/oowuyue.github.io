const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');

(async () => {

    const folder = "./data/"
    const browser = await puppeteer.launch({ headless: false, });
    function formatDate(site, date) {
        if (site.includes("macromicro")) {
            return date.substring(0, 8) + "28"
        }
        if (site.includes("woniu500")) {
            return date.slice(0, 4) + "-" + date.slice(4, 6) + '-28';
        }
        if (site.includes("legulegu")) {
            var date = new Date(date);
            var y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            if (m < 10)
                m = '0' + m;
            if (d < 10)
                d = '0' + d;

            if (d >= 28)
                var t = y + '-' + m + '-28';
            else
                var t = y + '-' + m + '-' + d;
            return t;

        }
        if (site.includes("value500")) {
            if (date.includes("日"))
                return date.slice(0, 4) + "-" + date.slice(5, 7) + "-" + date.substring(8, 10);
            return date.slice(0, 4) + "-" + date.slice(5, 7) + '-28';
        }
    }


    function formatAndSave(value) {

        if (value.name == "CPI同比") {//macroview
            let CPI同比 = value.resdata.cn_cpi.data
            CPI同比 = "let CPI同比 = " + JSON.stringify(CPI同比, null, 4);
            try {
                fs.writeFileSync(folder + 'CPI同比.js', CPI同比);
                console.log("CPI同比 JSON data is saved.");
            } catch (error) {
                console.error(error);
            }
        }

        if (value.name == "PPI同比_工业企业利润同比") {//macromicro
            let resdata14703 = value.resdata;
            if (resdata14703.success == 0) console.log("ppi_profile respones error " + resdata14703.error);
            let PPI同比 = resdata14703.data["c:14703"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            let 工业企业利润同比 = resdata14703.data["c:14703"].s[2].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            PPI同比 = "let PPI同比 = " + JSON.stringify(PPI同比, null, 4);
            工业企业利润同比 = "let 工业企业利润同比 = " + JSON.stringify(工业企业利润同比, null, 4);
            let PPI同比_工业企业利润同比 = PPI同比 + "\r\n" + 工业企业利润同比;
            try {
                fs.writeFileSync(folder + 'PPI同比_工业企业利润同比.js', PPI同比_工业企业利润同比);
                console.log("PPI同比_工业企业利润同比 JSON data is saved");
            } catch (error) {
                console.error(error);
            }
        }

        if (value.name == "制造业PMI同比") {//macromicro
            let cn_pmis = value.resdata;
            let 官方制造业PMI = cn_pmis.data["c:232"].s[1].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            let 财新制造业PMI = cn_pmis.data["c:232"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
            官方制造业PMI = "let 官方制造业PMI = " + JSON.stringify(官方制造业PMI, null, 4)
            财新制造业PMI = "let 财新制造业PMI = " + JSON.stringify(财新制造业PMI, null, 4);
            try {
                fs.writeFileSync(folder + '制造业PMI同比.js', 官方制造业PMI + "\r\n" + 财新制造业PMI);
                console.log("制造业PMI同比 JSON data is saved.");
            } catch (error) {
                console.error(error);
            }
        }

        if (value.name == "M1M2同比") {//legulegu
            //broadMoneyOneYearIncrease    broadMoneyTwoYearIncrease     close      date 943977600000   "M1M2同比", "legulegu"
            let M1M2同比 = value.resdata;
            let M1同比 = M1M2同比.map(item => {
                let newArr = [];
                newArr[0] = formatDate("legulegu", item.date).substring(0, 8) + "28"
                newArr[1] = item.broadMoneyOneYearIncrease == 0 ? "" : item.broadMoneyOneYearIncrease;
                return newArr;
            });
            let M2同比 = M1M2同比.map(item => {
                let newArr = [];
                newArr[0] = formatDate("legulegu", item.date).substring(0, 8) + "28"
                newArr[1] = item.broadMoneyTwoYearIncrease == 0 ? "" : item.broadMoneyTwoYearIncrease;
                return newArr;
            });
            let M1_M2同比 = M1M2同比.map(item => {
                let newArr = [];
                newArr[0] = formatDate("legulegu", item.date).substring(0, 8) + "28"
                newArr[1] = item.broadMoneyOneYearIncrease - item.broadMoneyTwoYearIncrease
                return newArr;
            });

            M1同比 = "let M1同比 = " + JSON.stringify(M1同比, null, 4);
            M2同比 = "let M2同比 = " + JSON.stringify(M2同比, null, 4);
            M1_M2同比 = "let M1_M2同比 = " + JSON.stringify(M1_M2同比, null, 4);
            M1M2同比 = M1同比 + "\r\n" + M2同比 + "\r\n" + M1_M2同比 + "\r\n";

            try {
                fs.writeFileSync(folder + 'M1M2同比.js', M1M2同比);
                console.log("M1M2同比 JSON data is saved");
            } catch (error) {
                console.error(error);
            }
        }

        if (value.name == "M2供应量折算") {//woniu500
            let M2供应量 = value.resdata
            M2供应量 = M2供应量.map((item, index) => {
                item[0] = formatDate("woniu500", item[0]);
                return item
            })
            let M2折算 = M2供应量.map(function (item) {
                let newArr = []
                newArr[0] = item[0]
                newArr[1] = (item[1] * 2935.83 / 1865935).toFixed(2)
                return newArr
            })
            let M2折算250 = M2供应量.map(function (item) {
                let newArr = []
                newArr[0] = item[0]
                newArr[1] = (250 + item[1] * 2935.83 / 1865935).toFixed(2)
                return newArr
            })

            M2供应量 = "let M2供应量 = " + JSON.stringify(M2供应量, null, 4);
            M2折算 = "let M2折算 = " + JSON.stringify(M2折算, null, 4);
            M2折算250 = "let M2折算250 = " + JSON.stringify(M2折算250, null, 4);

            try {
                fs.writeFileSync(folder + 'M2供应量折算.js', M2供应量 + "\r\n" + M2折算 + "\r\n" + M2折算250);
                console.log("M2供应量折算 JSON data is saved.");
            } catch (error) {
                console.error(error);
            }
        }

        if (value.name == "股债差300平均") {//value500
            let option
            let colors
            const regex = /option = ([\s\S]*?)};/g;
            const found = value.resdata.match(regex);
            eval(found[0])
            let date = option.xAxis[0].data
            let data = option.series[0].data
            let 股债差300平均 = date.map((item, index) => {
                let newDate = formatDate("value500", item);
                return [newDate, data[index]]
            })

            股债差300平均 = "let 股债差300平均 = " + JSON.stringify(股债差300平均, null, 4);
            try {
                fs.writeFileSync(folder + '股债差300平均.js', 股债差300平均);
                console.log("股债差300平均 JSON data is saved.");
            } catch (error) {
                console.error(error);
            }
        }

        return true
    }


    let taskApi = async (name, site, apiUrl, dataFormat, save = true) => {
        const promise1 = new Promise((resolve, reject) => {
            const req2 = http.request(apiUrl, function (res) {
                res.setEncoding('utf-8')
                let allchunk = ""
                res.on('data', function (chunk) {
                    allchunk += chunk
                });
                res.on("end", () => {
                    resdata = dataFormat == "json" ? JSON.parse(allchunk) : allchunk
                    save == true ?
                        resolve(formatAndSave({ name: name, siteInfo: [site, apiUrl, dataFormat], resdata: resdata })) :
                        resolve({ name: name, siteInfo: [site, apiUrl, dataFormat], resdata: resdata })
                })
            });
            req2.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            req2.end();
        })
        return promise1
    }
    let taskPage = async (name, site, pageUrl, apiSub, save = true) => {
        const page = await browser.newPage();
        await page.setRequestInterception(true)

        page.on('request', (request) => { request.continue() })
        const promise1 = new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                if (response.url().includes(apiSub)) {
                    resdata = await response.json()
                    save == true ?
                        resolve(formatAndSave({ name: name, siteInfo: [site, pageUrl, apiSub], resdata: resdata })) :
                        resolve({ name: name, siteInfo: [site, pageUrl, apiSub], resdata: resdata })
                }
            })
        })
        await page.goto(pageUrl, { waitUntil: 'networkidle2' })
        page.close()

        return promise1
    }

    await taskPage("CPI同比", "macroview", "https://www.macroview.club/charts?name=cn_cpi", "/get-chart")

    await taskPage("PPI同比_工业企业利润同比", "macromicro", "https://sc.macromicro.me/collections/25/cn-industry-relative/14703/cn-industry-finished-goods-inventory-accumulated-ppi", "/charts/data/14703")

    await taskPage("制造业PMI同比", "macromicro", "https://sc.macromicro.me/collections/25/cn-industry-relative/232/cn-pmi-caixin", "/charts/data/232")

    await taskPage("M1M2同比", "legulegu", "https://legulegu.com/stockdata/m1m2", "getm1m2?token")

    await taskPage("大盘拥挤度", "legulegu", "https://legulegu.com/stockdata/ashares-congestion", "ashares-congestion?token")

    await taskPage("十年国债收益率倒数与A股PE中位数", "legulegu", "https://legulegu.com/stockdata/china-10-year-bond-yield", "china-10-year-bond-yield-data?token")

    await taskApi("M2供应量折算", "woniu500", "http://www.woniu500.com/data/mm2.json", "json")

    await taskApi("股债差300平均", "value500", "http://value500.com/CSI300.asp", "html")


    Promise.all(
        [
            taskPage("股票型基金仓位", "legulegu", "https://legulegu.com/stockdata/fund-position/pos-stock", "type=pos_stock", false),
            taskPage("平衡混合型基金仓位", "legulegu", "https://legulegu.com/stockdata/fund-position/pos-pingheng", "type=pos_pingheng", false),
        ]).then((values) => {
            let 股票型基金仓位
            let 平衡混合型基金仓位
            values.forEach(value => {
                if (value.name == "股票型基金仓位")
                    股票型基金仓位 = value.resdata
                if (value.name == "平衡混合型基金仓位")
                    平衡混合型基金仓位 = value.resdata
            });

            let 基金仓位 = 平衡混合型基金仓位.map((item, index) => {
                return [item.date, (parseFloat(item.position) + parseFloat(股票型基金仓位[index].position)) / 200 * 100]
            })

            基金仓位 = "let 基金仓位 = " + JSON.stringify(基金仓位, null, 4);
            try {
                fs.writeFileSync(folder + '基金仓位.js', 基金仓位);
                console.log("基金仓位 JSON data is saved.");
            } catch (error) {
                console.error(err);
            }
        }).catch((e) => console.log(e))

})()