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
                    itemArr = item.split("\t")
                    //"07/22/1992",
                    dates = itemArr[0].split("/")
                    itemArr[0] = dates[2] + "-" + dates[0] + "-" + dates[1]
                    itemArr[1] = parseFloat(itemArr[1])
                    return itemArr
                })
                console.log(lines)

                let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                resolve(fileStr)
            }
        }) //readfile
    })//return Promise

}//txtToJson    


let csvToJson = async (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./${fileName}.csv`, "utf-8", (err, data) => {
            if (err) reject(err)
            else {
                let lines = data.split(/\r?\n/)
                lines.shift()
                lines.shift()
                //lines.pop()

                lines = lines.map((item) => {
                    let newItem = []
                    
                    itemArr = item.split("\t")
                    //console.log(item)
                    newItem[0] = "20"+itemArr[0].substring(0, 2) + "-" + itemArr[0].substring(2, 4) + "-" + itemArr[0].substring(4,6)
                    newItem[1] = parseFloat( itemArr[1] ) 
                    newItem[2] = parseFloat( itemArr[2] ) 
                    return newItem
                })

                let fileStr = `let ${fileName} = ` + JSON.stringify(lines, null, 4) + "\r\n"
                resolve(fileStr)
            }
        }) //readfile
    })//return Promise

}//csvToJson



//https://www.physixfan.com/yigeyouyisidezhibiaoinsider-purchases/


(async () => {

    let lastFileStr = await csvToJson('股Insider_trading') 
    try {
        fs.writeFileSync(`股Insider_trading.js`, lastFileStr);
        console.log(`股Insider_trading JSON data is saved`);
    } catch (error) {
        console.error(error);
    }

})()


// (async () => {

//     let lastFileStr = await txtToJson('股债相关性')
//     try {
//         fs.writeFileSync(`股债相关性.js`, lastFileStr);
//         console.log(`股债相关性 JSON data is saved`);
//     } catch (error) {
//         console.error(error);
//     }

// })()