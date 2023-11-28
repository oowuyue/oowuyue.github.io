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
                    newItem[0] = itemArr[0].substring(0,4) + "-" + itemArr[0].substring(4,6) + "-" + itemArr[0].substring(6,8)
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

    let lastFileStr = await txtToJson('天顺风能')
    try {
        fs.writeFileSync(`天顺风能.js`, lastFileStr);
        console.log(`天顺风能 JSON data is saved`);
    } catch (error) {
        console.error(error);
    }

})()