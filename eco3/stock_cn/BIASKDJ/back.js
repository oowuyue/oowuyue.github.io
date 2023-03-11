const fs = require('fs');
const { arrayBuffer } = require('stream/consumers');

/*
收盘获利小于10%；最近3日收盘获利小于10%的天数>=1；量涨价不涨；dde大单净量大于0%； 近7日有>=2次的资金流向>0；最近10个交易日的阶段放量；最近10个交易日的阶段放量出现次数>=1
前2天涨跌幅小于-2%；跳空高开；振幅小于2%；缩量；今日收盘价大于前两日最高价
10，20


排除st；上市天数>100；0<pe<100；周kdj金叉；日kdj金叉；BIAS买入信号；

排除st；上市天数>100；0<pe<100；周kdj金叉；日kdj金叉；BIAS买入信号； 最近30个交易日的阶段放量出现次数>=1；

排除st；上市天数>100；pe<100；放量； 周kdj金叉；日kdj金叉或日kdj底背离；BIAS买入信号；最近3日收盘获利小于5%的天数>0；  


                                   月季金叉   周底背离  大周期          
排除st；上市天数>100；pe<100；放量； 周kdj金叉；日kdj金叉或日kdj底背离；BIAS买入信号； 最近3日收盘获利小于5%的天数>0；振幅小于8



2015-06-01  
排除st；上市天数>100；pe<100；放量； 周kdj金叉；日kdj金叉或日kdj底背离；BIAS买入信号； 最近3日收盘获利小于5%的天数>0；振幅小于8 ；




http://backtest.10jqka.com.cn/backtest/app.html#/strategybacktest?query=%E6%89%80%E5%B1%9E%E4%B8%AD%E8%AF%81500%E6%88%90%E5%88%86%E8%82%A1%EF%BC%9B%E6%8E%92%E9%99%A4st%EF%BC%9B%E4%B8%8A%E5%B8%82%E5%A4%A9%E6%95%B0%3E100%EF%BC%9B0%3Cpe%2apb%3C250%EF%BC%9B%E6%9C%80%E8%BF%9110%E6%97%A5%E6%94%BE%E9%87%8F%EF%BC%9B%E6%8C%AF%E5%B9%85%3C%3D8%25%EF%BC%9B%E6%88%90%E4%BA%A4%E4%BB%B7%3E%3D20%E5%9D%87%E7%BA%BF%EF%BC%9B%20%20%E7%AD%B9%E7%A0%81%E9%9B%86%E4%B8%AD%E5%BA%A690%3C%3D15%25%EF%BC%9B%E5%B8%82%E5%80%BC%E4%BB%8E%E5%B0%8F%E5%88%B0%E5%A4%A7%E6%8E%92%E5%88%97&daysForSaleStrategy=20,50,60&startDate=2014-01-01&endDate=2018-12-31&stockHoldCount=1&dayBuyStockNum=1&upperIncome=23&lowerIncome=13&fallIncome=10&engine=undefined&capital=100000









*/
let csvFile = `20230204180701.csv`


// fs.readFile(csvFile, "utf-8", (err, data) => {
//     if (err) console.log(err)
//     else {
//         const lines = data.split(/\r?\n/)
//         lines.shift()
//         lines.shift()
//         lines.reverse()
//         lines.shift()

       

          
//         let time 
//         for (let index = 0; index < lines.length; index++) {

//             let datas = lines[index].split(",")
//             let time = datas[2]
//             let yield = datas[6]
            
           
//             let tmp = start * (1 + yield)
//             console.log(`${start} * (1 + ${yieldStr})=${tmp}`)
//             start = tmp


//         }
//     }
// })//readfile



fs.readFile(csvFile, "utf-8", (err, data) => {
    if (err) console.log(err)
    else {
        const lines = data.split(/\r?\n/)
        lines.shift()
        lines.shift()
        lines.reverse()
        lines.shift()

        let start = 10000
        for (let index = 0; index < lines.length; index++) {

            let yieldStr = lines[index].split(",")[6]
            let yield = parseFloat(yieldStr.slice(0, -1)) * 0.01

            
            let tmp = start * (1 + yield)
            console.log(`${start} * (1 + ${yieldStr})=${tmp}`)
            start = tmp


        }
    }
})//readfile