const { screenshotsDir } = require('../utils');
const path = require('path');

async function automateAmazon(page, product, random) {
  try {
    const screenshotPath = path.join(screenshotsDir, `${product.id}_AmazonUK_${random}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Amazon UK screenshot saved:', screenshotPath);
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateAmazon ~ error:", error)
    return {success: false, screenshotPath: '', error: error.message};
  }
}

module.exports = automateAmazon; 