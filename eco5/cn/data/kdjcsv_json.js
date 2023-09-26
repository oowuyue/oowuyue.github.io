const fs = require('fs');

function csvToJson(fileName) {

    fs.readFile(`./${fileName}.csv`, "utf-8", (err, data) => {
        if (err) console.log(err)
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

            try {
                fs.writeFileSync(`./${fileName}.js`, fileStr);
                console.log(`${fileName} JSON data is saved`);
            } catch (error) {
                console.error(error);
            }
            //fs.unlink(csvFile, (err) => {})
        }
    }) //readfile

}//csvToJson


csvToJson('kdj周日') 
csvToJson('kdj月周') 