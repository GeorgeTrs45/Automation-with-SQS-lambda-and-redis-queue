const { sleep, screenshotsDir, randomDelay, humanLikeBehavior } = require('../utils');
const path = require('path');

async function automateAsda(page, product, random) {
  try {
    const screenshotPath = path.join(screenshotsDir, `${product.id}_Asda_${random}.png`);
    await page.waitForSelector('button:has-text("Add")', { timeout: 5000 });
    await page.waitForTimeout(randomDelay());
    await page.click('button:has-text("Add")');
    console.log('Clicked "Add" button.');
    await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
    console.log('Redirected to sign-in page.');
    await page.waitForTimeout(randomDelay());
    //Adding email password
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
    await page.fill('input[type="email"], input[name="email"]', process.env.ASDA_EMAIL || 'test@example.com');
    await page.waitForTimeout(randomDelay());
    await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 5000 });
    await page.fill('input[type="password"], input[name="password"]', process.env.ASDA_PASSWORD || 'your_password_here');
    await sleep(1500 + Math.random() * 15000);
    await humanLikeBehavior(page);
    //sign in button click
    // await page.waitForSelector('button:has-text("Sign in")', { timeout: 5000 });
    // await page.click(selector);
    // console.log('Clicked login button.');

    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('ASDA screenshot saved:', screenshotPath); 
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateAsda ~ error:", error);
    return {success: false, screenshotPath: '', error: error.message};
  }
}

module.exports = automateAsda; 