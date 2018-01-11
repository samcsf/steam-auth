const Authenticator = require('../')

let auth = new Authenticator({
  adbPath: '/Users/sam/Library/Android/sdk/platform-tools/adb'
})
async function run () {
  auth.saveCapture()
  await auth.cropCapture()
  // auth.parseCodeWithOcrad()
  auth.parseCodeWithTesseract()
}
run()