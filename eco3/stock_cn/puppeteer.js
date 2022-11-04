const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');

function formatDate(site, date) {
  switch (site) {
    case "macromicro": {
      return date.substring(0, 8) + "28"
      break;
    }
    case "woniu500": {
      return date.slice(0, 4) + "-" + date.slice(4, 6) + '-28';
      break;
    }
    case "legulegu": {
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
      break;
    }
    case "value500": {
      if (date.includes("日"))
        return date.slice(0, 4) + "-" + date.slice(5, 7) + "-" + date.substring(8, 10);
      return date.slice(0, 4) + "-" + date.slice(5, 7) + '-28';
      break;
    }
    default:
      break;
  }
}


(async () => {

  let folder = "./data/"
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setRequestInterception(true)
  page.on('request', (request) => { request.continue() })
  page.on('response', async (response) => {
    if (response.url() == "https://sc.macromicro.me/charts/data/14703") {
      let reaData = await response.json();
      let ppi = reaData.data["c:14703"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let profile = reaData.data["c:14703"].s[2].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
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
  });
  await page.goto('https://sc.macromicro.me/charts/14703/cn-industry-finished-goods-inventory-accumulated-ppi', { waitUntil: 'networkidle2' });


  const page2 = await browser.newPage();
  await page2.setRequestInterception(true)
  page2.on('request', (request) => { request.continue() })
  page2.on('response', async (response) => {
    if (response.url() == "https://sc.macromicro.me/charts/data/260") {
      let reaData = await response.json();
      let M1 = reaData.data["c:260"].s[1].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let M2 = reaData.data["c:260"].s[0].map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      let M1_M2 = reaData.data["c:260"].s[2]
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
      let HS300 = reaData.data["c:260"].s[3].map(item => { return item })

      M1 = "let M1 = " + JSON.stringify(M1, null, 4);
      M2 = "let M2 = " + JSON.stringify(M2, null, 4);
      M1_M2 = "let M1_M2 = " + JSON.stringify(M1_M2, null, 4);
      HS300 = "let HS300 = " + JSON.stringify(reaData.data["c:260"].s[3], null, 4);
      let M_HS = M1 + "\r\n" + M2 + "\r\n" + M1_M2 + "\r\n" + HS300;
      try {
        fs.writeFileSync(folder + 'M12_HS300.js', M_HS);
        console.log("M12_HS300 JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
  });
  await page2.goto('https://sc.macromicro.me/collections/55/cn-shanghai-shengzhen-csi-300-index/260/cn-china-m1-m2', { waitUntil: 'networkidle2' });


  const page0 = await browser.newPage();
  await page0.setRequestInterception(true)
  page0.on('request', (request) => { request.continue() })
  page0.on('response', async (response) => {
    //https://antoinevastel.com/puppeteer/2021/01/23/instrumenting-requests-puppeteer-bug.html 
    //http://nanhua.net/nhzc/varietytrend.html 南华波动
    if (response.url() == "https://sc.macromicro.me/charts/data/21532") {
      let reaData = await response.json();
      let vxeem = reaData.data["c:21532"].s[0]//.map(item => { item[0] = formatDate("macromicro", item[0]); return item })
      vxeem = "let vxeem = " + JSON.stringify(vxeem, null, 4);
      try {
        fs.writeFileSync(folder + 'vxeem.js', vxeem);
        console.log("vxeem JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
  });
  await page0.goto('https://sc.macromicro.me/collections/4536/volatility/21532/vxeem', { waitUntil: 'networkidle2' });


  const req2 = http.request("http://www.woniu500.com/data/mm2.json", function (res) {
    res.setEncoding('utf-8')
    let allJson = ""
    res.on('data', function (chunk) {
      allJson += chunk
    });
    res.on("end", () => {
      let m2Total = JSON.parse(allJson)
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
    })
  });
  req2.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
  req2.end();


  const page3 = await browser.newPage();
  await page3.setRequestInterception(true)
  page3.on('request', (request) => { request.continue() })
  page3.on('response', async (response) => {
    if (response.url().includes("china-10-year-bond-yield-data")) {
      let yield = await response.json();
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
        console.log("middle_pe JSON data is saved.");
      } catch (error) {
        console.error(err);
      }
    }
  });
  await page3.goto('https://legulegu.com/stockdata/china-10-year-bond-yield', { waitUntil: 'networkidle2' });


  let allHtml = "";
  let option
  let colors
  const req = http.request("http://value500.com/CSI300.asp", function (res) {
    res.setEncoding('utf-8')
    res.on('data', function (chunk) {
      allHtml += chunk
    });
    res.on("end", () => {
      const regex = /option = ([\s\S]*?)};/g;
      const found = allHtml.match(regex);
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
    })
  });
  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();


  // let data = await page.evaluate(() => {
  //   return window.App.data
  // })

})();