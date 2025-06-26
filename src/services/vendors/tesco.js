const { screenshotsDir } = require('../utils');
const path = require('path');

async function automateTesco(page, product, random) {
  try {
    const screenshotPath = path.join(screenshotsDir, `${product.id}_Tesco_${random}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Tesco screenshot saved:', screenshotPath);
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateTesco ~ error:", error)
    return {success: false, screenshotPath: '', error: error.message};
  }
}

module.exports = automateTesco; 