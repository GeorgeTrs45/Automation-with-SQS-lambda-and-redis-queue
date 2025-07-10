const { randomDelay, screenshotsDir, moveMouseRandomly } = require('../utils');
const path = require('path');

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

async function automateArgos(page, product, random) {
  try {
 
    // await sleep(200000000);
    const screenshotPath = path.join(screenshotsDir, `${product.id}_Argos_${random}.png`);
    await page.waitForTimeout(randomDelay());
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Argos UK screenshot saved:', screenshotPath);
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateArgos ~ error:", error)
    return {success: false, screenshotPath: '', error: error.message};
  }
}

module.exports = automateArgos; 