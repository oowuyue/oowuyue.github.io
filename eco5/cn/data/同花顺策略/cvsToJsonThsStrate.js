const fs = require('fs');

let csvToJson = async (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./${fileName}.csv`, "utf-8", (err, data) => {
            if (err) reject(err)
            else {
                let lines = data.split(/\r?\n/)
                lines.shift()
                lines.shift()
                lines.pop()

                lines = lines.map((item) => {
                    item = item.substring(1)
                    itemArr = item.split(",")
                    itemArr[2] = itemArr[2].substring(0, 4) + "-" + itemArr[2].substring(4, 6) + "-" + itemArr[2].substring(6)
                    itemArr[3] = itemArr[3].substring(0, 4) + "-" + itemArr[3].substring(4, 6) + "-" + itemArr[3].substring(6)
                    return itemArr
                })

                resolve(lines)
                // let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                // resolve(fileStr)
            }
        }) //readfile
    }) //return Promise
} //csvToJson



let signal = async () => {

    let fileStr = ""

    fileStr += `let 左侧长短周期组合 = ` + JSON.stringify(await csvToJson('左侧长短周期组合'), null, 4) + "\r\n"
    fileStr += `let 右侧长短周期组合 = ` + JSON.stringify(await csvToJson('右侧长短周期组合'), null, 4) + "\r\n"


    fileStr += `let 日周信号组合 = ` + JSON.stringify(await csvToJson('日周信号组合'), null, 4) + "\r\n"
    fileStr += `let 日周信号组合2 = ` + JSON.stringify(await csvToJson('日周信号组合2'), null, 4) + "\r\n"



    fileStr += `let 日买入信号组合 = ` + JSON.stringify(await csvToJson('日买入信号组合'), null, 4) + "\r\n"
    fileStr += `let 日买入信号组合2 = ` + JSON.stringify(await csvToJson('日买入信号组合2'), null, 4) + "\r\n"

    try {
        fs.writeFileSync(`同花顺策略统计.js`, fileStr);
        console.log(`同花顺策略统计 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}


let smallCom = async () => {

    let lines = await csvToJson('小市值')
    lines = lines.reverse()

    let smallDown = lines.filter((item) => {
        //"8.32%"
        return parseFloat(item[6].substring(0, item[6].length - 1)) < 2

    })

    let fileStr = `let smallDown = ` + JSON.stringify(smallDown, null, 4) + "\r\n"

    try {
        fs.writeFileSync(`同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`大市值统计 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}


(async () => {

    //回测一下
    await signal()

    //策略回测
    await smallCom()

})()