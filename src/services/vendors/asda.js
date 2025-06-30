const { randomDelay, screenshotsDir, moveMouseRandomly } = require('../utils');
const path = require('path');

async function automateAsda(page, product, random) {
  const screenshotPath = path.join(screenshotsDir, `${product.id}_Asda_${random}.png`);
  const email = process.env.ASDA_EMAIL || 'test@example.com';
  const password = process.env.ASDA_PASSWORD || 'your_password_here';

  try {
    // Navigate to product and trigger login redirect
    await page.waitForSelector('button:has-text("Add")', { timeout: 30000 });
    await page.waitForTimeout(randomDelay());
    await page.click('button:has-text("Add")');
    console.log('Clicked "Add" button.');

    await page.waitForURL(/sign-in|login/i, { timeout: 50000 });
    console.log('Redirected to sign-in page.');
    await page.waitForTimeout(randomDelay());
    moveMouseRandomly(page);

    // Fill login credentials
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 30000 });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.waitForTimeout(randomDelay());

    await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 30000 });
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.waitForTimeout(randomDelay());

    // Wait for CAPTCHA to be solved (input token to appear)
    const captchaResolved = await waitForCaptchaResolution(page, 50000);
    if (!captchaResolved) {
      throw new Error('CAPTCHA not resolved. Cannot proceed with login.');
    }

    // Submit login
    await page.waitForSelector('button:has-text("Sign in")', { timeout: 10000 });
    await page.click('button:has-text("Sign in")');
    console.log('Submitted login form.');

    // Stop here as requested
    return { success: true, screenshotPath, error: '' };

  } catch (error) {
    console.log('🚀 ~ automateAsda ~ error:', error);
    return { success: false, screenshotPath: '', error: error.message };
  }
}

// Helper: Wait until CAPTCHA token appears in DOM
async function waitForCaptchaResolution(page, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const solved = await page.evaluate(() => {
      const tokenInput = document.querySelector('input[name="cf-turnstile-response"], input[name="g-recaptcha-response"]');
      return tokenInput && tokenInput.value && tokenInput.value.trim().length > 0;
    });
    if (solved) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

module.exports = automateAsda;
