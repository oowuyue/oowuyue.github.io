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
    })//return Promise

}//csvToJson



(async () => {

    let lines = await csvToJson('k大市值')
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
    console.dir(lines, { 'maxArrayLength': 500 })


    let continuesMax = lines.filter((item, index) => {
        return item[3] >= 2 && isNaN(lines[index + 1][3])
    })


    let continues2 = lines.filter((item, index) => {
        return item[3] == 2 
    })
    console.log(continuesMax,continues2)



    let fileStr = `let continuesMax = ` + JSON.stringify(continuesMax, null, 4) + "\r\n"
    fileStr += `let continues2 = ` + JSON.stringify(continues2, null, 4) + "\r\n" 

    try {
        fs.writeFileSync(`k大市值统计.js`, fileStr);
        console.log(`k大市值统计 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }



})()