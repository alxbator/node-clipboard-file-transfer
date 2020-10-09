const clipboardListener = require('clipboard-event')
const clipboardy = require('clipboardy')
const fs = require('fs')
const path = require('path');
const crypto = require('crypto')
const CONFIG = require('./config')

const optionDefinitions = [
    { name: 'outdir', alias: 'o', type: String },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

if (!options.outdir) {
    options.outdir = './files/'
    console.warn('No outdir option is specified, default value is: ' + options.outdir)
}


let inProcess = false
let fileName = 'in.file'
let base64Data = ''
let chunkIndex = 1

clipboardListener.startListening()

console.debug('Start listening clipboard...')

clipboardListener.on('change', () => {
    let clipboardText = clipboardy.readSync()
    if (!inProcess) {
        let startWordIndex = clipboardText.indexOf(CONFIG.START_WORD)
        if (startWordIndex !== -1) {
            fileName = clipboardText.substring(0, startWordIndex)
            console.debug('Process started, file name: ' + fileName)
            inProcess = true
            clipboardText = clipboardText.substring(startWordIndex + CONFIG.START_WORD.length)

            chunkIndex++
        }
    }
    if (inProcess) {
        let endWordIndex = clipboardText.indexOf(CONFIG.END_WORD)
        if (endWordIndex !== -1) {
            checkSum = clipboardText.substring(0, endWordIndex)
            console.debug('Last chunk, writing data to file...')
            inProcess = false
            clipboardText = clipboardText.substring(endWordIndex + CONFIG.END_WORD.length)
            writeFileFromBase64(base64Data + clipboardText, path.normalize(options.outdir + fileName), checkSum)
            return
        }
        base64Data += clipboardText;

        console.debug(`Add chunk #${chunkIndex}`)
        chunkIndex++
    }

});

function writeFileFromBase64(base64str, file, checkSum) {
    let fileData = new Buffer.from(base64str, 'base64');

    console.debug('Checking file hash...')

    let sum = crypto.createHash('md5')
    sum.update(fileData);
    let dataCheckSum = sum.digest('hex')

    if (checkSum !== dataCheckSum) {
        console.error('Check summ is not valid! File is not created.')
    } else {
        console.debug('Ok.')
        fs.writeFileSync(file, fileData);
        console.log('File "' + file + '" created.')
    }

    clipboardListener.stopListening()
}