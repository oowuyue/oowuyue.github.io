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
*/
let csvFile = `20230203164614.csv`


fs.readFile(csvFile, "utf-8", (err, data) => {
    if (err) console.log(err)
    else {
        const lines = data.split(/\r?\n/)
        lines.shift()
        lines.shift()
        lines.reverse()
        lines.shift()

       

          
        let time 
        for (let index = 0; index < lines.length; index++) {

            let datas = lines[index].split(",")
            let time = datas[2]
            let yield = datas[6]
            
           

            
            let tmp = start * (1 + yield)
            console.log(`${start} * (1 + ${yieldStr})=${tmp}`)
            start = tmp


        }
    }
})//readfile








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