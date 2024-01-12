function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function checkOrTryHttp(dataName, site, fuc,) {
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement
    var JS1 = document.createElement("script")
    if (site == "sina") JS1.src = `data/sinaFutures/${dataName}.json`
    if (site == "xueqiu") JS1.src = `data/xqStocks/${dataName}.json`
    if (site == "ths") JS1.src = `data/thsStocks/${dataName}.json`
    JS1.onload = function () { fuc() }
    JS1.onerror = function (e) { console.log(e) }
    head.insertBefore(JS1, head.firstChild);
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

//https://github.com/kimboqi/stock-indicators
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

function getDayPercent(dayItem) {
    return parseFloat(((dayItem.close - dayItem.open) / dayItem.open * 100).toFixed(2))
}

//当期涨跌幅 阳线阴线
function curtPercent(periodItem) {
    return parseFloat(((periodItem.close - periodItem.open) / periodItem.open * 100).toFixed(2))
}

//同比涨跌幅 今日最高-前日最低 = 差
function myPtPPercent(prePeriodItem, currentPeriodItem) {
    let preOCLow = prePeriodItem.close > prePeriodItem.open ? prePeriodItem.open : prePeriodItem.close
    let curtOCHigh = currentPeriodItem.close > currentPeriodItem.open ? currentPeriodItem.close : currentPeriodItem.open
    return curtOCHigh - preOCLow
}

//同比涨跌幅 昨收买-今收卖 / 昨收买   标准
function PtPPercent(prePeriodItem, currentPeriodItem) {
    return parseFloat(((currentPeriodItem.close - prePeriodItem.close) / prePeriodItem.close * 100).toFixed(2))
}



//当期振幅 开收/高低长度占比
function curtAmp(periodItem) {
    return +((periodItem.close - periodItem.open) / (periodItem.high - periodItem.low) * 100).toFixed(2)
}

//同比振幅 标准
function PtPAmp(prePeriodItem, currentPeriodItem) {
    return +((currentPeriodItem.high - currentPeriodItem.low) / prePeriodItem.close * 100).toFixed(2)
}


if (typeof module !== "undefined" && module.exports) {
    exports.isMonthLastDay = isMonthLastDay
    exports.pre5Month = pre5Month
    exports.isSameWeek = isSameWeek
    exports.dayToPeriod = dayToPeriod
    exports.xueqiuFormatDate = xueqiuFormatDate
    exports.getDayPercent = getDayPercent

    exports.curtPercent = curtPercent
    exports.myPtPPercent = myPtPPercent
    exports.PtPPercent = PtPPercent
    exports.curtAmp = curtAmp
    exports.PtPAmp = PtPAmp
} else {

}