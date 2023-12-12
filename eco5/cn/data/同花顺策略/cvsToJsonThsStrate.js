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


let kdjmwd = async () => {

    let fileStr = ""
    fileStr += `let kdj日周月 = ` + JSON.stringify(await csvToJson('kdj日周月'), null, 4) + "\r\n"
    fileStr += `let kdj日周 = ` + JSON.stringify(await csvToJson('kdj日周'), null, 4) + "\r\n"
    fileStr += `let kdj日周2 = ` + JSON.stringify(await csvToJson('kdj日周2'), null, 4) + "\r\n"

    try {
        fs.writeFileSync(`同花顺策略统计.js`, fileStr);
        console.log(`kdj信号 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}


let buySignal = async () => {

    let fileStr = ""
    fileStr += `let 买入信号 = ` + JSON.stringify(await csvToJson('买入信号'), null, 4) + "\r\n"
    fileStr += `let 买入信号2 = ` + JSON.stringify(await csvToJson('买入信号2'), null, 4) + "\r\n"

    try {
        fs.writeFileSync(`同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`买入信号 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }
    return true
}




let bigCom = async () => {

    let lines = await csvToJson('大市值')
    lines = lines.reverse()
    lines = lines.map((item) => {
        return [item[3], item[6], item[1]]
    })
    let continues = 1
    lines = lines.map((ele, index) => {
        if (index == 0) return ele
        let percent = parseFloat(ele[1].substring(0, ele[1].length - 1))
        if (percent < 0) { //pre<0?   
            let preEle = lines[index - 1]
            let prePercent = parseFloat(preEle[1].substring(0, preEle[1].length - 1))
            if (prePercent < 0) ele.push(++continues)
        } else {
            continues = 1
        }
        return ele
    })
    //console.dir(lines, { 'maxArrayLength': 500 })


    let continuesMax = lines.filter((item, index) => {
        return item[3] >= 2 && isNaN(lines[index + 1][3])
    })


    let continues2 = lines.filter((item, index) => {
        return item[3] == 2
    })
    //console.log(continuesMax, continues2)



    let fileStr = `let continuesMax = ` + JSON.stringify(continuesMax, null, 4) + "\r\n"
    fileStr += `let continues2 = ` + JSON.stringify(continues2, null, 4) + "\r\n"

    try {
        fs.writeFileSync(`同花顺策略统计.js`, fileStr, { flag: 'a' });
        console.log(`大市值统计 JSON data is saved`);
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
    await kdjmwd()
    await buySignal()

    //策略回测
    await bigCom()
    await smallCom()

})()