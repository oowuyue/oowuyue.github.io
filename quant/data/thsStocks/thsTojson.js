const fs = require('fs');

let txtToJson = async (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./${fileName}.txt`, "utf-8", (err, data) => {
            if (err) reject(err)
            else {
                let lines = data.split(/\r?\n/)
                // lines.shift()
                // lines.shift()
                // lines.pop()

                lines = lines.map((item) => {
                    let newItem = []
                    itemArr = item.split(",")
                    newItem[0] = itemArr[0].substring(0, 4) + "-" + itemArr[0].substring(4, 6) + "-" + itemArr[0].substring(6, 8)
                    newItem[1] = parseFloat(itemArr[1]) //open
                    newItem[2] = parseFloat(itemArr[4]) //close
                    newItem[3] = parseFloat(itemArr[3]) //low
                    newItem[4] = parseFloat(itemArr[2]) //hight
                    newItem[5] = parseFloat(itemArr[5])
                    newItem[6] = parseFloat(itemArr[6])
                    return newItem
                })
                console.log(lines)

                let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                resolve(fileStr)
            }
        }) //readfile
    }) //return Promise

} //txtToJson    



(async () => {


    //['广西广电', '翰博高新']   https://d.10jqka.com.cn/v6/line/33_300103/01/last1800.js
    let canshu = process.argv.slice(2)
    canshu = canshu.map(async (stockName) => {
        let lastFileStr = await txtToJson(stockName)
        try {
            fs.writeFileSync(`${stockName}.js`, lastFileStr);
            return `${stockName}保存成功`
        } catch (error) {
            return `${stockName}保存失败`
        }
    })



    let results = await Promise.all(canshu)


    console.log(results)


})()


//https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_SC02023_11_30=/InnerFuturesNewService.getDailyKLine?symbol=SC0&_=2023_11_30
//https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_SR02023_11_30=/InnerFuturesNewService.getDailyKLine?symbol=SR0&_=2023_11_30

