const fs = require('fs')
const os = require('os')

const getTemplatesFromFile = () => {
    const inputFile = 'indexes_with_shards.json'
    const outputFile = 'templates_from_es_with_three_shards.csv'
    let sortedMap
    try {
        let rawdata = fs.readFileSync(inputFile)
        let templates = JSON.parse(rawdata)
        let map = new Map(Object.entries(templates))
        sortedMap = new Map([...map.entries()].sort())
    } catch(err) {
        console.log('Error reading ' + inputFile + ' file: ' + err)
    }
    if(sortedMap) {
        try {fs.unlinkSync(outputFile)} catch(err) {}
        try {
            let fileId = fs.openSync(outputFile, 'w', 666)
            fs.writeSync(fileId, 'Template, Shards' + os.EOL)
            sortedMap.forEach((value, key) => {
                if(value.settings.index.number_of_shards == 3) {
                    fs.writeSync(fileId, key + os.EOL)
                }
            })
            fs.closeSync(fileId)
        } catch(err) {
            console.log('Error processing ' + inputFile + ' file: ' + err)
        }
    }
}

getTemplatesFromFile()