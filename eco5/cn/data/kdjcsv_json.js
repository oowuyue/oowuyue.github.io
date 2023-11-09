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

                let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                resolve(fileStr)
            }
        }) //readfile
    })//return Promise

}//csvToJson


(async () => {

    let lastFileStr = await csvToJson('kdj日周月') + await csvToJson('kdj日周') + await csvToJson('kdj日周2') + await csvToJson('kdj日')
    try {
        fs.writeFileSync(`kdj等技术指标.js`, lastFileStr);
        console.log(`kdj等技术指标 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }

})()

