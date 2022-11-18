const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');

(async () => {

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

  let folder = "./data/"
  function formatAndSave(value) {
    if (value.name == "ppi_profile") {
      let resdata14703 = value.resdata;
      if (resdata14703.success == 0) console.log("ppi_profile respones error " + resdata14703.error);
      let ppi = resdata14703.data["c:14703"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let profile = resdata14703.data["c:14703"].s[2].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      ppi = "let ppi = " + JSON.stringify(ppi, null, 4);
      profile = "let profile = " + JSON.stringify(profile, null, 4);
      let ppi_profile = ppi + "\r\n" + profile;
      try {
        fs.writeFileSync(folder + 'ppi_profile.js', ppi_profile);
        console.log("ppi_profile JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "M12_HS300") {
      let resdata260 = value.resdata;
      if (resdata260.success == 0) console.log("M12_HS300 respones error " + resdata260.error);
      let M1 = resdata260.data["c:260"].s[1].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let M2 = resdata260.data["c:260"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let M1_M2 = resdata260.data["c:260"].s[2]
      M1_M2 = M1_M2.map(item => { item[0] = formatDate("macromicro", item[0]); return item }).map(((item, index, arr) => {
        let newArr = [];
        newArr[0] = item[0]
        newArr[1] = item[1]
        if (newArr[0].includes("01-28")) {
          let pre = M1_M2[index - 1] ? parseFloat(M1_M2[index - 1][1]) : 0
          let next = M1_M2[index + 1] ? parseFloat(M1_M2[index + 1][1]) : 0
          if ((pre * next) != 0)
            newArr[1] = (pre + next) / 2
          else
            newArr[1] = (pre + next)

          newArr[1] = newArr[1].toFixed(1)
        }
        return newArr;
      }))
      let HS300 = resdata260.data["c:260"].s[3].map(item => { return item })

      M1 = "let M1 = " + JSON.stringify(M1, null, 4);
      M2 = "let M2 = " + JSON.stringify(M2, null, 4);
      M1_M2 = "let M1_M2 = " + JSON.stringify(M1_M2, null, 4);
      HS300 = "let HS300 = " + JSON.stringify(HS300, null, 4);
      let M_HS = M1 + "\r\n" + M2 + "\r\n" + M1_M2 + "\r\n" + HS300;
      try {
        fs.writeFileSync(folder + 'M12_HS300.js', M_HS);
        console.log("M12_HS300 JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "M2Total") {
      let m2Total = value.resdata
      m2Total = m2Total.map((item, index) => {
        item[0] = formatDate("woniu500", item[0]);
        return item
      })
      let M2zheSuan = m2Total.map(function (item) {
        let newArr = []
        newArr[0] = item[0]
        newArr[1] = (item[1] * 2935.83 / 1865935).toFixed(2)
        return newArr
      })
      let M2zheSuan250 = m2Total.map(function (item) {
        let newArr = []
        newArr[0] = item[0]
        newArr[1] = (250 + item[1] * 2935.83 / 1865935).toFixed(2)
        return newArr
      })

      m2Total = "let m2Total = " + JSON.stringify(m2Total, null, 4);
      M2zheSuan = "let M2zheSuan = " + JSON.stringify(M2zheSuan, null, 4);
      M2zheSuan250 = "let M2zheSuan250 = " + JSON.stringify(M2zheSuan250, null, 4);

      try {
        fs.writeFileSync(folder + 'm2Total.js', m2Total + "\r\n" + M2zheSuan + "\r\n" + M2zheSuan250);
        console.log("m2Total JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "vxeem") {
      let resdata = value.resdata;
      let vxeem = resdata.data["c:21532"].s[0]//.map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      vxeem = "let vxeem = " + JSON.stringify(vxeem, null, 4);
      try {
        fs.writeFileSync(folder + 'vxeem.js', vxeem);
        console.log("vxeem JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "usd_cnh") {
      let resdata = value.resdata;
      let usd_cnh = resdata.data["c:153"].s[0]//.map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      usd_cnh = "let usd_cnh = " + JSON.stringify(usd_cnh, null, 4);
      try {
        fs.writeFileSync(folder + 'usd_cnh.js', usd_cnh);
        console.log("usd_cnh JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "tongBi300") {
      let option
      let colors
      const regex = /option = ([\s\S]*?)};/g;
      const found = value.resdata.match(regex);
      eval(found[0])
      let date = option.xAxis[0].data
      let data = option.series[3].data
      let tongBi300 = date.map((item, index) => {
        const firstSplit = item.split('年');
        let year = firstSplit[0]
        let month = firstSplit[1].split('月')[0];
        if (year > 2008)
          return [`${year}-${month}-28`, data[index] ? data[index] : ""]
        return null
      }).filter((item) => {
        return item
      })
      //console.log(tongBi300);return;
      tongBi300 = "let tongBi300 = " + JSON.stringify(tongBi300, null, 4);
      try {
        fs.writeFileSync(folder + 'stockTongBi.js', tongBi300);
        console.log("stockTongBi JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "bond10_middlePe") {
      let yield = value.resdata;
      let yield_300PeMiddle = yield.map(item => {
        let newArr = [];
        newArr[0] = formatDate("legulegu", item.date);
        newArr[1] = item.hs300PeMiddle == 0 ? "" : item.hs300PeMiddle;
        return newArr;
      });
      let yield_APeMiddle = yield.map(item => {
        let newArr = [];
        newArr[0] = formatDate("legulegu", item.date);
        newArr[1] = item.marketPe == 0 ? "" : item.marketPe;
        return newArr;
      });
      let yield_TenNaDeb = yield.map(item => {
        let newArr = [];
        newArr[0] = formatDate("legulegu", item.date);
        newArr[1] = item.marketPe == 0 ? "" : (1 / item.debtInterestRate * 100).toFixed(2)
        return newArr;
      });

      yield_300PeMiddle = "let yield_300PeMiddle = " + JSON.stringify(yield_300PeMiddle, null, 4);
      yield_APeMiddle = "let yield_APeMiddle = " + JSON.stringify(yield_APeMiddle, null, 4);
      yield_TenNaDeb = "let yield_TenNaDeb = " + JSON.stringify(yield_TenNaDeb, null, 4);
      let yields = yield_300PeMiddle + "\r\n" + yield_APeMiddle + "\r\n" + yield_TenNaDeb + "\r\n";

      try {
        fs.writeFileSync(folder + 'bond10_middlePe.js', yields);
        console.log("bond10_middlePe JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    if (value.name == "guZhaiCha") {
      let option
      let colors
      const regex = /option = ([\s\S]*?)};/g;
      const found = value.resdata.match(regex);
      eval(found[0])
      let date = option.xAxis[0].data
      let data = option.series[0].data
      let guZhaiCha = date.map((item, index) => {
        let newDate = formatDate("value500", item);
        return [newDate, data[index]]
      })

      guZhaiCha = "let guZhaiCha = " + JSON.stringify(guZhaiCha, null, 4);
      try {
        fs.writeFileSync(folder + 'guZhaiCha.js', guZhaiCha);
        console.log("guZhaiCha JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
    return true
  }

  let taskApi = async (name, apiUrl, dataFormat) => {
    const promise1 = new Promise((resolve, reject) => {
      const req2 = http.request(apiUrl, function (res) {
        res.setEncoding('utf-8')
        let allchunk = ""
        res.on('data', function (chunk) {
          allchunk += chunk
        });
        res.on("end", () => {
          resdata = dataFormat == "json" ? JSON.parse(allchunk) : allchunk
          resolve({ name: name, apiUrl: apiUrl, resdata: resdata })
        })
      });
      req2.on('error', function (e) {
        console.log('problem with request: ' + e.message);
      });
      req2.end();
    })
    return promise1
  }

  let taskPage = async (name, pageUrl, apiSub) => {
    const page = await browser.newPage();
    await page.setRequestInterception(true)
    page.on('request', (request) => { request.continue() })
    const promise1 = new Promise((resolve, reject) => {
      page.on('response', async (response) => {
        if (response.url().includes(apiSub)) {
          resdata = await response.json()
          resolve({ name: name, pageUrl: pageUrl, apiSub: apiSub, resdata: resdata })
        }
      })
    })
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    return promise1
  }

  let taskMacromicroPage = async (name, pageUrl, apiSub) => {
    let value = await taskPage(name, pageUrl, apiSub)
    return formatAndSave(value)
  }
  
  await taskMacromicroPage("ppi_profile", "https://sc.macromicro.me/collections/25/cn-industry-relative/14703/cn-industry-finished-goods-inventory-accumulated-ppi", "/charts/data/14703")
  await taskMacromicroPage("M12_HS300", "https://sc.macromicro.me/collections/55/cn-shanghai-shengzhen-csi-300-index/260/cn-china-m1-m2", "/charts/data/260")
  await taskMacromicroPage("vxeem", "https://sc.macromicro.me/collections/4536/volatility/21532/vxeem", "/charts/data/21532")
  await taskMacromicroPage("usd_cnh", "https://sc.macromicro.me/charts/153/usd-cnh", "/charts/data/153")

  Promise.all(
    [
      taskApi("M2Total", "http://www.woniu500.com/data/mm2.json", "json"),
      taskApi("tongBi300", "http://value500.com/SH000001.asp", "html"),
      taskPage("bond10_middlePe", "https://legulegu.com/stockdata/china-10-year-bond-yield", "china-10-year-bond-yield-data?token"),
      taskApi("guZhaiCha", "http://value500.com/CSI300.asp", "html"),
    ]).then((values) => {
      values.forEach(value => {
        formatAndSave(value)
      })
    }).catch((e) => console.log(e))

  Promise.all(
    [
      taskPage("pos_stock", "https://legulegu.com/stockdata/fund-position/pos-stock", "type=pos_stock"),
      taskPage("pos_pingheng", "https://legulegu.com/stockdata/fund-position/pos-pingheng", "type=pos_pingheng"),
    ]).then((values) => {
      let pos_stock
      let pos_pingheng
      values.forEach(value => {
        if (value.name == "pos_stock")
          pos_stock = value.resdata
        if (value.name == "pos_pingheng")
          pos_pingheng = value.resdata
      });

      let pos_fund = pos_pingheng.map((item, index) => {
        return [item.date, (parseFloat(item.position) + parseFloat(pos_stock[index].position)) / 200 * 100]
      })

      pos_fund = "let pos_fund = " + JSON.stringify(pos_fund, null, 4);
      try {
        fs.writeFileSync(folder + 'pos_fund.js', pos_fund);
        console.log("pos_fund JSON data is saved.");
      } catch (error) {
        console.error(err);
      }

    }).catch((e) => console.log(e))


})()