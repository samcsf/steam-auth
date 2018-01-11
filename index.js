const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
const util = require('util')
const Jimp = require('jimp')
const OCRAD = require('ocrad.js')
const Canvas = require('canvas')
const Image = Canvas.Image

class Authenticator {
  constructor (options) {
    this.savePath = options.savePath || path.join(__dirname, 'screen.png')
    this.saveCropPath = options.saveCropPath || path.join(__dirname, 'crop.png')
    this.tessResName = options.tessResName || 'tess_res'
    this.adbPath = options.adbPath || 'adb'
  }
  
  saveCapture () {
    shell.exec(`${this.adbPath} shell screencap /sdcard/screen.png && exit`, {async:false})
    shell.exec(`${this.adbPath} pull /sdcard/screen.png ${this.savePath}`, {async:false})
    console.log('Capture saved to ' + this.savePath)
  }

  async cropCapture () {
    let image = await Jimp.read(this.savePath)
    image.crop(220,280,700,150)
      .contrast(1)
      .greyscale()
      .invert()
      .normalize()
    await new Promise((res, rej)=>{
      image.write(this.saveCropPath, (err, ret)=>{
        if (!err) res(ret)
      })
    })
    console.log('Crop completed.')
  }

  parseCodeWithOcrad () {
    let src = fs.readFileSync(this.saveCropPath)
    let img = new Image()
    img.src = src
    let canvas = new Canvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)
    console.log('------')
    console.log(OCRAD(canvas).trimRight())
    console.log('------')
  }
  
  parseCodeWithTesseract () {
    shell.exec(`tesseract ${this.saveCropPath} ${this.tessResName} -l eng`, {async:false})
    let result = fs.readFileSync(path.join(__dirname, this.tessResName + '.txt')).toString()
    console.log('------')
    console.log(result.trimRight())
    console.log('------')
  }
}

module.exports = Authenticator
