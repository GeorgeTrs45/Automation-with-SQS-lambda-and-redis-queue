const { screenshotsDir } = require('../utils');
const path = require('path');

async function automateSainsburys(page, product, random) {
  try {
    const screenshotPath = path.join(screenshotsDir, `${product.id}_Sainsburys_${random}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("Sainsbury's screenshot saved:", screenshotPath);
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateSainsburys ~ error:", error)
    return {success: false, screenshotPath: '', error: error.message};
  }
}

module.exports = automateSainsburys; 