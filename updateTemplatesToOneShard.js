const lineReader = require('line-reader')
const fs = require('fs')

const templateDirectory = 'c:\\Users\\I1320\\gitrepos\\isc_elastic-develop\\index_templates\\dev'
const changeShardCountInPlace = true

const updateTemplates = async () => {
    const inputFile = 'templates_from_git_with_three_shards.csv'
    let sortedMap
    try {
        lineReader.eachLine(inputFile, (line, last) =>{
            processTemplate(line)
        })
    } catch(err) {
        console.log('Error processing ' + inputFile + ' file: ' + err)
    }
}

const processTemplate = (templateFilename) => {
    console.log(`processing template ${templateFilename}`)
    let templateFullFilename = `${templateDirectory}\\${templateFilename}`
    try {
        fs.readFile(templateFullFilename, 'utf8', (err, jsonString) => {
            if(err) {
                console.log('File read failed: ' + err)
            } else {
                let putRequest = jsonString.substring(0, jsonString.indexOf('{'))
                let actualJsonString = jsonString.substring(jsonString.indexOf('{'))
                try {
                    let templateJson = JSON.parse(actualJsonString)
                    let shardCountRaw = templateJson.settings.index.number_of_shards
                    //if(typeof shardCountRaw == 'number') console.log(templateFilename + ' number_of_shards is a NUMBER')
                    let shardCount = parseInt(shardCountRaw)
                    if(shardCount !== 3) {
                        console.log('shard count is not 3 for ' + templateFilename + '. It is ' + shardCount)
                    } else {
                        if(changeShardCountInPlace) {
                            const numberOfShardsKey = '"number_of_shards"'
                            let numberOfShardsLoc = jsonString.indexOf(numberOfShardsKey)
                            if(numberOfShardsLoc >= 0) {
                                let shardCountLoc = jsonString.indexOf(typeof shardCountRaw == 'number' ? '3' : '"3"', numberOfShardsLoc + numberOfShardsKey.length + 1)
                                if(shardCountLoc >= 0) {
                                    let newJsonString = jsonString.substring(0, shardCountLoc) 
                                    + (typeof shardCountRaw == 'number' ? '1' : '"1"')
                                    + jsonString.substring(shardCountLoc + (typeof shardCountRaw == 'number' ? 1 : 3))
                                    fs.writeFile(templateDirectory + '\\' + templateFilename, newJsonString, 'utf8', err => {
                                        if(err) {
                                            console.log('Error writing transformed template file: ' + templateFilename + ': ' + err)
                                        }
                                    })
                                }
                            }
                        } else {
                            templateJson.settings.index.number_of_shards = typeof shardCountRaw == 'number' ? 1 : "1"
                            fs.writeFile(templateDirectory + '\\' + templateFilename, putRequest + JSON.stringify(templateJson, null, 2), 'utf8', err => {
                                if(err) {
                                    console.log('Error writing transformed template file: ' + templateFilename + ': ' + err)
                                }
                            })
                        }
                    }
                } catch(err) {
                    console.log('Error parsing template ' + templateFullFilename + ' file: ' + err)
                }
            }
        })
    } catch(err) {
        console.log('Error reading template ' + templateFullFilename + ' file: ' + err)
    }
}
updateTemplates()