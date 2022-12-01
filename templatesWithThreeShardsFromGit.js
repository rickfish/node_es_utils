const fs = require('fs')
const os = require('os')

const templateDirectory = 'c:\\Users\\I1320\\gitrepos\\isc_elastic\\index_templates\\dev'

const getTemplatesFromDirectory = () => {
    const outputFile = 'templates_from_git_with_three_shards.csv'
    try {
        let templateFiles = fs.readdirSync(templateDirectory)
        try {fs.unlinkSync(outputFile)} catch(err) {}
        let fileId
        try {
            fileId = fs.openSync(outputFile, 'w', 666)
        } catch(err) {
            console.log('Error processing ' + inputFile + ' file: ' + err)
        }
        templateFiles.forEach(templateFilename => {
            processTemplateFile(templateFilename, fileId)
        })
//        fs.closeSync(fileId)
    } catch(err) {
        console.log('Error reading directory ' + templateDirectory + ': ' + err)
    }
}

const processTemplateFile = (templateFilename, outputFileId) => {
    console.log(`processing template ${templateFilename}`)
    let templateFullFilename = `${templateDirectory}\\${templateFilename}`
    try {
        fs.readFile(templateFullFilename, 'utf8', (err, jsonString) => {
            if(err) {
                console.log('File read failed: ' + err)
            } else {
                let actualJsonString = jsonString.substring(jsonString.indexOf('{'))
                try {
                    let templateJson = JSON.parse(actualJsonString)
                    let shardCount = parseInt(templateJson.settings.index.number_of_shards)
                    if(shardCount === 3) {
                        fs.writeSync(outputFileId, templateFilename + os.EOL)
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

getTemplatesFromDirectory()