const fs = require('fs')
const path = require('path');
const crypto = require('crypto')
const clipboardy = require('clipboardy')
const CONFIG = require('./config')

const optionDefinitions = [
  { name: 'file', alias: 'f', type: String },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

if(!options.file){
  throw `No correct options are specified. ${JSON.stringify(options)}`
}

const file = path.normalize(options.file)
const fileName = path.basename(file)

console.debug('Reading file: ' + file)
let fileData = fs.readFileSync(file)
let sum = crypto.createHash('md5')
sum.update(fileData)
let checkSum = sum.digest('hex')
console.debug('File md5: ' + checkSum)

console.debug("Convert file " + file + " to Base64 string...")
let base64str = new Buffer.from(fileData).toString('base64')
let splitArray = base64str.match(new RegExp(`.{1,${CONFIG.CHUNK_SIZE}}`, 'g'))
console.debug("Total chunks: " + splitArray.length)

splitArray[splitArray.length - 1] = checkSum + CONFIG.END_WORD + splitArray[splitArray.length - 1]
splitArray[0] = fileName + CONFIG.START_WORD + splitArray[0]

let i = 0
function chankToClipboard() { 
  setTimeout(function() {
    console.debug((i + 1) + " of " + splitArray.length)
    clipboardy.writeSync(splitArray[i]);
    i++
    if (i < splitArray.length) {
        chankToClipboard();    
    }
  }, CONFIG.SEND_TIMEOUT)
}

console.debug("Sending...")
chankToClipboard()