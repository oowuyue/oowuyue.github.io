
//html
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return false;
}

function checkOrTryHttp(dataName, site, fuc,) {
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement
    var JS1 = document.createElement("script")
    if (site == "sina") {
        JS1.src = `cn/data/新浪期货行情/${dataName}.js`
    }
    if (site == "xueqiu") {
        JS1.src = `cn/data/雪球行情/${dataName}.js`
    }
    if (site == "ths") {
        JS1.src = `cn/data/同花顺行情/${dataName}.js`
    }
    JS1.onload = function () { fuc() }
    JS1.onerror = function (e) { console.log(e) }
    head.insertBefore(JS1, head.firstChild);
}


//DateTime [date,data]
function unifyDate(site, date, dataName) {
    if (false
        || dataName.includes("Day")
        || dataName.includes("日")
        || dataName.includes("Week")
        || (dataName.includes("周") && !dataName.includes("周期"))
    ) return unifyDayDate(site, date)

    if (dataName.includes("Quarter") || dataName.includes("季"))
        return unifyQuarterDate(site, date)

    return unifyMonthDate(site, date) //默认月
}

let currentDayYMD = stampToDate(new Date().getTime())
let currentDayYM = currentDayYMD.substring(0, 7)
let preDayYMD = stampToDate(new Date().getTime() - 24 * 60 * 60 * 1000)

//month 统一显示格式+统一日期28(1,28,monthLastDay)
function unifyMonthDate(site, date) {

    if (typeof date === 'number') date = stampToDate(date)

    let resultDate
    if (site == "macromicro") {//2023-05-01
        resultDate = date.substring(0, 7) + "-28"
    }
    if (site == "macroview") {//2023-11-28
        resultDate = date.substring(0, 7) + "-28"
    }
    if (site == "legulegu") {//stampToDate(毫秒)=>2008-08-09  or 200001 
        resultDate = date.includes("-") ? date.substring(0, 7) + "-28" : date.slice(0, 4) + "-" + date.slice(4, 6) + '-28';
    }

    if (site == "value500") {//2006年01月
        let month = date.split("年")[1].split("月")[0]
        if (month.length == 1) month = '0' + month
        resultDate = date.slice(0, 4) + "-" + month + '-28'
    }
    if (site == "woniu500") { //200801
        resultDate = date.slice(0, 4) + "-" + date.slice(4, 6) + '-28'
    }
    if (site == "fredDown") {//2019-09-01
        resultDate = date.substring(0, 7) + "-28"
    }

    if (resultDate.substring(0, 7) == currentDayYM) return preDayYMD //当月返回昨日或今日或不处理
    return resultDate
}

// day week 统一显示格式
function unifyDayDate(site, date) {
    if (typeof date === 'number') date = stampToDate(date)

    if (site == "macromicro") return date
    if (site == "macroview") return date
    if (site == "legulegu") return date
    if (site == "value500") {//2006年01月03日
        if (date.includes("日")) return date.slice(0, 4) + "-" + date.split("年")[1].split("月")[0] + "-" + date.substring(8, 10)
        if (date.includes("/")) return date.replaceAll('/', '-')
    }
    if (site == "woniu500") {//20080122
        return date.slice(0, 4) + "-" + date.slice(4, 6) + '-' + date.slice(6, 8);
    }
    if (site == "fredDown") return date
}

//Quarter 统一显示格式+统一日期28(1,28,monthLastDay)
function unifyQuarterDate(site, date) {
    if (site == "fredDown") {//2019-04-01
        let month = parseInt(date.substring(5, 7)) - 1
        month = month < 10 ? "0" + month : "" + month
        return date.substring(0, 4) + "-" + month + "-28"
    }
}

//毫秒=>2008-08-09
function stampToDate(stamp) {
    let date1 = new Date(stamp);
    let y = date1.getFullYear(),
        m = date1.getMonth() + 1,
        d = date1.getDate();

    if (m < 10)
        m = '0' + m;
    if (d < 10)
        d = '0' + d;

    return y + '-' + m + '-' + d;
}

//2008-08-09=>毫秒
function dateToStamp(date) {
    return new Date(date).getTime()
}

//获取日期所在周的周五
function getLastDayOf(dateStr) {
    let day = new Date(dateStr).getDay() || 7
    let date = new Date(dateStr)
    let restlDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 5 - day)
    return stampToDate(restlDate.getTime())
}

function findSameTime(array, time) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element[0] == time) return element
    }
    return null
}

function isSameWeek(d1, d2) {
    if (d1 == "" || d2 == "") return false
    d1 = new Date(d1)
    d2 = new Date(d2)
    const ONE_DAY = 1000 * 60 * 60 * 24
    const difftime = Math.abs(d2 - d1)
    let bigDay = (d1 > d2 ? d1.getDay() : d2.getDay()) || 7
    let smallDay = (d1 < d2 ? d1.getDay() : d2.getDay()) || 7
    return !(difftime >= ONE_DAY * 7 || bigDay < smallDay || (bigDay === smallDay && difftime > ONE_DAY))
}

function isSameMonth(date) {
    var current_date = new Date();
    var current_y = current_date.getFullYear(),
        current_m = current_date.getMonth() + 1,
        current_d = current_date.getDate();
    if (current_m < 10)
        current_m = '0' + current_m;
    if (current_d < 10)
        current_d = '0' + current_d;

    if (date.substring(0, 7) == (current_y + '-' + current_m)) { //当月不处理
        return true
    } else {
        return false
    }
}

function isMonthLastDay(ymd) {
    //"2000-01-09" 传入年份和月份 获取该年对应月份的天数 第三个参数是0，第二个参数是人类意识中的月份
    let monthDays = new Date(ymd.substring(0, 4), ymd.substring(5, 7), 0).getDate() //月的天数
    return monthDays == parseInt(ymd.substring(8, 10))
}

function pre5Month(ym) {
    //"2000-09"
    let result = []
    let year = parseInt(ym.substring(0, 4))
    let month = parseInt(ym.substring(5, 7))
    if (month >= 5) {
        for (var i = 4; i >= 0; i--) {
            let m = (month - i) >= 10 ? "" + (month - i) : "0" + (month - i)
            result.push("" + year + "-" + m)
        }
    } else {
        // 11 12   1 2 3
        let preYCount = 5 - month
        for (var i = preYCount; i > 0; i--) {
            let m = (13 - i) >= 10 ? "" + (13 - i) : "0" + (13 - i)
            result.push("" + (year - 1) + "-" + m)
        }
        for (var i = 1; i <= month; i++) {
            let m = i >= 10 ? "" + i : "0" + i
            result.push("" + (year) + "-" + m)
        }

    }
    return result
}

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

//DateTime [date, o, h, l, c]
function xueqiuFormatDate(stamp, period = "month") {
    var date = new Date(stamp);
    var y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate();
    if (m < 10)
        m = '0' + m;
    if (d < 10)
        d = '0' + d;

    if (period == "month") {
        var current_date = new Date();
        var current_y = current_date.getFullYear(),
            current_m = current_date.getMonth() + 1,
            current_d = current_date.getDate();
        if (current_m < 10)
            current_m = '0' + current_m;
        if (current_d < 10)
            current_d = '0' + current_d;

        if ((y + '-' + m) == (current_y + '-' + current_m)) { //当月不处理
            var t = y + '-' + m + '-' + d;
        } else {
            var t = y + '-' + m + '-28';
        }
    }

    if (period == "day") {
        var t = y + '-' + m + '-' + d;
    }


    return t;
}

//格式数据
Array.prototype.chartDataMaN = function (MA, dataIndex = 1) {
    let dataList = this
    dataList = dataList.map((item, index) => {
        const copyItem = [...item];
        if (index < MA) {
            return copyItem
        }

        let sum = 0
        for (let i = index - MA; i < index; i++) {
            sum += parseFloat(dataList[i][dataIndex])
        }
        let avg = (sum / MA).toFixed(2)

        copyItem[1] = avg
        return copyItem
    })
    return dataList
}

Array.prototype.xueqiuData2Obj = function (period = "day") {
    let dataList = this
    dataList = dataList.map((data, index) => {
        return {
            date: xueqiuFormatDate(data[0], period),
            timestamp: data[0],
            open: data[2],
            high: data[3],
            low: data[4],
            close: data[5],
            percent: data[7],
            volume: Math.ceil(+data[1]),
        }
    })
    return dataList
}

Array.prototype.objYoY = function (period = "day") {
    let dataList = this
    dataList = dataList.map((ele, index, dataList) => {
        // const preItem = dataList.find(element => {
        //     let preYear = '' + (parseInt(ele.date.slice(0, 4)) - 1) + ele.date.substring(4, 10)
        //     return element.date == preYear
        // })
        preItem = dataList[index - 250]
        if (preItem) {
            let openYoY = (ele.open - preItem.open) / preItem.open
            let closeYoY = (ele.close - preItem.close) / preItem.close
            let highYoY = (ele.high - preItem.high) / preItem.high
            let lowYoY = (ele.low - preItem.low) / preItem.low
            ele.openYoY = openYoY
            ele.closeYoY = closeYoY
            ele.highYoY = highYoY
            ele.lowYoY = lowYoY
        } else {
            ele.openYoY = ""
            ele.closeYoY = ""
            ele.highYoY = ""
            ele.lowYoY = ""
        }
        return ele
    })
    return dataList
}

//技术指标https://github.com/kimboqi/stock-indicators
function dayToPeriod(dayIndexList, period) {
    let open, high, low, close, volume
    let preDayIndexDate = ""
    let periodIndexList = []
    let dayIndexListLastIndex = dayIndexList.length - 1

    dayIndexList.forEach((dayIndex, i, dayIndexList) => {

        //统一数据
        currentDate = dayIndex.date
        currentOpen = parseFloat(dayIndex.open)
        currentHigh = parseFloat(dayIndex.high)
        currentLow = parseFloat(dayIndex.low)
        currentClose = parseFloat(dayIndex.close)
        currentVolume = parseFloat(dayIndex.volume)


        let samePeriod
        if (period == "week")
            samePeriod = isSameWeek(preDayIndexDate, currentDate)
        if (period == "month")
            samePeriod = preDayIndexDate.substring(0, 7) == currentDate.substring(0, 7) ? true : false

        if (!samePeriod) {
            let prPeriodIndex = {
                "date": preDayIndexDate,
                "timestamp": new Date(preDayIndexDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "period": period
            }
            periodIndexList.push(prPeriodIndex)

            open = currentOpen
            high = currentHigh
            low = currentLow
            close = currentClose
            volume = currentVolume
            preDayIndexDate = currentDate
        }

        if (samePeriod) {
            high = currentHigh > high ? currentHigh : high
            low = currentLow < low ? currentLow : low
            close = currentClose
            volume = volume + currentVolume
            preDayIndexDate = currentDate
        }
        if (dayIndexListLastIndex == i) {
            let currentPeriodIndex = {
                "date": currentDate,
                "timestamp": new Date(currentDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "period": period
            }
            periodIndexList.push(currentPeriodIndex)
        }
    })

    periodIndexList.shift()
    return periodIndexList
}

var ema = function (lastEma, closePrice, units) {
    return (lastEma * (units - 1) + closePrice * 2) / (units + 1);
}
var dea = function (lastDea, curDiff) {
    return (lastDea * 8 + curDiff * 2) / 10;
}
Array.prototype.calMacd = function () {

    var candleList = this;

    var ema12 = [],
        ema26 = [],
        diffs = [],
        deas = [],
        bars = [];
    for (var i = 0; i < candleList.length; i++) {
        var c = candleList[i].close;
        if (i == 0) {
            ema12.push(c);
            ema26.push(c);
            deas.push(0);
        } else {
            ema12.push(ema(ema12[i - 1], c, 12));
            ema26.push(ema(ema26[i - 1], c, 26));
        }
        diffs.push(ema12[i] - ema26[i]);
        if (i != 0) {
            deas.push(dea(deas[i - 1], diffs[i]));
        }
        bars.push((diffs[i] - deas[i]) * 2);
    }

    candleList = candleList.map((ele, index) => {
        ele.diff = diffs[index]
        ele.dea = deas[index]
        ele.bar = bars[index]
        return ele
    })
    return candleList

}

Array.prototype.calKdj = function () {
    var getMaxHighAndMinLow = function (ticks) {
        var maxHigh = ticks[0].high,
            minLow = ticks[0].low;
        for (var i = 0; i < ticks.length; i++) {
            var t = ticks[i],
                high = t.high,
                low = t.low;
            if (high > maxHigh) {
                maxHigh = high;
            }
            if (low < minLow) {
                minLow = low;
            }
        }
        return [maxHigh, minLow];
    };
    let candleList = this
    var nineDaysTicks = [],
        days = 9,
        rsvs = [];
    var lastK, lastD, curK, curD;
    var maxAndMin, max, min;
    for (var i = 0; i < candleList.length; i++) {

        if (candleList[i].K instanceof Number) continue

        var t = candleList[i],
            close = t.close;
        nineDaysTicks.push(t);
        maxAndMin = getMaxHighAndMinLow(nineDaysTicks);
        max = maxAndMin[0];
        min = maxAndMin[1];
        if (max == min) {
            rsvs.push(0);
        } else {
            rsvs.push((close - min) / (max - min) * 100);
        }
        if (nineDaysTicks.length == days) {
            nineDaysTicks.shift();
        }
        if (i == 0) {
            lastK = lastD = rsvs[i];
        }

        curK = 2 / 3 * lastK + 1 / 3 * rsvs[i];
        lastK = curK;

        curD = 2 / 3 * lastD + 1 / 3 * curK;
        lastD = curD;

        curJ = 3 * curK - 2 * curD;

        candleList[i].K = curK
        candleList[i].D = curD
        candleList[i].J = curJ
    }

    return candleList;
}

Array.prototype.calBoll = function () {
    let candleList = this
    var maDays = 20, tickBegin = maDays - 1, maSum = 0, p = 0;
    for (var i = 0; i < candleList.length; i++) {

        if (candleList[i].ups instanceof Number) continue

        var c = candleList[i].close, ma, md, bstart, mdSum;
        maSum += c;

        if (i >= tickBegin) {
            maSum = maSum - p;
            ma = maSum / maDays;

            candleList[i].mas = ma;

            bstart = i - tickBegin;
            p = candleList[bstart].close;
            mdSum = candleList.slice(bstart, bstart + maDays).map((item) => { return item.close }).reduce(function (a, b) { return a + Math.pow(b - ma, 2); }, 0);
            md = Math.sqrt(mdSum / maDays);

            candleList[i].ups = ma + 2 * md;
            candleList[i].lows = ma - 2 * md;
        }
        else {
            candleList[i].ups = null
            candleList[i].mas = null
            candleList[i].lows = null
        }
    }
    return candleList;
}

Array.prototype.maN = function (MA, Attribute) {
    let dataList = this
    dataList = dataList.map((item, index) => {
        if (index < MA) return item
        if (item[`ma${MA}`] instanceof Number) return item

        let copyItem = Object.assign({}, item)
        let sum = 0
        for (let i = index - MA; i < index; i++) {
            sum += parseFloat(dataList[i][Attribute])
        }
        let avg = (sum / MA).toFixed(2)

        copyItem[`ma${MA}`] = avg
        return copyItem
    })
    return dataList
}

//当期涨跌幅 阳线阴线
function getDayPercent(dayItem) {
    return parseFloat(((dayItem.close - dayItem.open) / dayItem.open * 100).toFixed(2))
}

//当期涨跌幅 阳线阴线
function curtPercent(periodItem) {
    return parseFloat(((periodItem.close - periodItem.open) / periodItem.open * 100).toFixed(2))
}

//同比涨跌幅 昨收买-今收卖 / 昨收买   标准
function PtPPercent(prePeriodItem, currentPeriodItem) {
    return parseFloat(((currentPeriodItem.close - prePeriodItem.close) / prePeriodItem.close * 100).toFixed(2))
}

//同比涨跌幅 今日最高-前日最低 = 差
function myPtPPercent(prePeriodItem, currentPeriodItem) {
    let preOCLow = prePeriodItem.close > prePeriodItem.open ? prePeriodItem.open : prePeriodItem.close
    let curtOCHigh = currentPeriodItem.close > currentPeriodItem.open ? currentPeriodItem.close : currentPeriodItem.open
    return curtOCHigh - preOCLow
}

//当期振幅 开收/高低长度占比
function curtAmp(periodItem) {
    return +((periodItem.close - periodItem.open) / (periodItem.high - periodItem.low) * 100).toFixed(2)
}

//同比振幅 标准
function PtPAmp(prePeriodItem, currentPeriodItem) {
    return +((currentPeriodItem.high - currentPeriodItem.low) / prePeriodItem.close * 100).toFixed(2)
}


//nodejs 导出
if (typeof module !== "undefined" && module.exports) {
    const fs = require('fs');
    const nodemailer = require("nodemailer");

    function writeDataToFile(dataName, dayDatas, folder = "./data/") {
        let promise = new Promise((resolve, reject) => {
            fs.writeFile(`${folder}${dataName}.js`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, 2), 'utf8', (err) => {
                if (err) {
                    console.log(`${dataName}写入失败${err}`)
                    resolve(false)
                    return
                }
                console.log(`${dataName}写入成功`)
                resolve(true)
            })
        })
        return promise
    }

    function getDataFromFile(dataName, folder = "./data/", forceNew = true, format = "json") {
        let promise = new Promise((resolve, reject) => {
            fs.readFile(`${folder}${dataName}.js`, 'utf8', (err, data) => {
                if (err) {
                    console.log(dataName, "文件不存在")
                    resolve(false)
                    return
                }
                if (forceNew) {//强制最新的当天的
                    let stat = fs.statSync(`${folder}${dataName}.js`)
                    let modifyDate = stat.mtime.toISOString().substring(0, 10)
                    if (currentDayYMD !== modifyDate) {
                        console.log(dataName, "文件数据不是最新的")
                        resolve(false)
                        return
                    }

                }

                try {
                    console.log(`${dataName} getDataFromFile`)
                    if (format == "json") {
                        if (data.indexOf("=") >= 0)
                            data = data.substring(data.indexOf("=") + 1)
                        resolve(JSON.parse(data))//返回json
                    } else {
                        resolve(data)//返回str
                    }
                } catch (error) {
                    resolve(false)
                }

            })
        })
        return promise
    }


    const transporter = nodemailer.createTransport({
      host: "smtp.163.com",
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: "oowuyue@163.com",
        pass: "AEUORGVIOHTDGDGZ",
      },
    });
    async function mySendMail(msg) {
      const info = await transporter.sendMail({
        from: '"oowuyue" <oowuyue@163.com>', // sender address
        to: "3434384699@qq.com, 851616860@qq.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: msg, // plain text body
        html: msg, // html body
      });

      //console.log("Message sent: %s", msg);
      //return true
      //Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    }

    exports.currentDayYM = currentDayYM
    exports.currentDayYMD = currentDayYMD
    exports.preDayYMD = preDayYMD
    
    exports.stampToDate = stampToDate
    exports.dateToStamp = dateToStamp
    exports.getLastDayOf = getLastDayOf
    

    exports.unifyDate = unifyDate
    exports.findSameTime = findSameTime
    exports.isSameWeek = isSameWeek
    exports.isSameMonth = isSameMonth
    exports.isMonthLastDay = isMonthLastDay
    exports.pre5Month = pre5Month
    exports.wait = wait
    exports.xueqiuFormatDate = xueqiuFormatDate

    exports.dayToPeriod = dayToPeriod
    exports.getDayPercent = getDayPercent
    exports.curtPercent = curtPercent
    exports.PtPPercent = PtPPercent
    exports.myPtPPercent = myPtPPercent
    exports.curtAmp = curtAmp
    exports.PtPAmp = PtPAmp

    exports.writeDataToFile = writeDataToFile
    exports.getDataFromFile = getDataFromFile
    exports.mySendMail = mySendMail



} 