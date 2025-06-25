const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { updateFeedbackDb } = require('../models/productModel');

chromium.use(StealthPlugin());

const screenshotsDir = path.join(__dirname, '../../screenshots');
fs.ensureDirSync(screenshotsDir);

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function autoAcceptCookies(page) {
  const selectors = [
    'button[aria-label*="accept"]',
    'button[aria-label*="cookie"]',
    'button[title*="Accept"]',
    'button:has-text("Accept")',
    'button:has-text("I agree")',
    'button:has-text("Got it")',
    'button:has-text("Allow all")',
    'button:has-text("Accept all")',
    'button:has-text("OK")',
    '[id*="accept"]',
    '[id*="cookie"]',
    '[class*="accept"]',
    '[class*="cookie"]'
  ];
  for (const selector of selectors) {
    try {
      const el = await page.$(selector);
      if (el) {
        await el.click();
        console.log(`Clicked cookie banner with selector: ${selector}`);
        return true;
      }
    } catch (e) {
      console.log("🚀 ~ autoAcceptCookies ~ e:", e)
    }
  }
  const texts = [
    'Accept', 'I agree', 'Got it', 'Allow all', 'Accept all', 'OK'
  ];
  for (const text of texts) {
    try {
      const el = await page.$(`button:has-text(\"${text}\")`);
      if (el) {
        await el.click();
        console.log(`Clicked cookie banner with text: ${text}`);
        return true;
      }
    } catch (ex) {
      console.log("🚀 ~ autoAcceptCookies ~ ex:", ex)
    }
  }
  return false;
}

async function automateAsda(page, product, random) {
  try {
    const screenshotPath = path.join(screenshotsDir, `${product.id}_Asda_${random}.png`);
    await page.waitForSelector('button:has-text("Add")', { timeout: 5000 });
    await sleep(1500 + Math.random() * 1000);
    await page.click('button:has-text("Add")');
    console.log('Clicked "Add" button.');
    await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
    console.log('Redirected to sign-in page.');
    await sleep(2000 + Math.random() * 1500);
    //Adding email password
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
    await page.fill('input[type="email"], input[name="email"]', process.env.ASDA_EMAIL || 'test@example.com');
    await sleep(1000 + Math.random() * 1000);
    await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 5000 });
    await page.fill('input[type="password"], input[name="password"]', process.env.ASDA_PASSWORD || 'your_password_here');
    await sleep(1500 + Math.random() * 1500);
    //sign in button click
    await page.waitForSelector('button:has-text("Sign in")', { timeout: 5000 });
    await page.click(selector);
    console.log('Clicked login button.');
  
  
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('ASDA screenshot saved:', screenshotPath); 
    return {success: true, screenshotPath: screenshotPath, error: ''};
  } catch (error) {
    console.log("🚀 ~ automateAsda ~ error:", error);
    return {success: false, screenshotPath: '', error: error.message};
  }
}

async function automateSainsburys(page, product) {
  const screenshotPath = path.join(screenshotsDir, `${product.id}_Sainsburys.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Sainsbury's screenshot saved:", screenshotPath);
  return screenshotPath;
}

async function automateAmazon(page, product) {
  const screenshotPath = path.join(screenshotsDir, `${product.id}_AmazonUK.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Amazon UK screenshot saved:', screenshotPath);
  return screenshotPath;
}

async function automateTesco(page, product) {
  const screenshotPath = path.join(screenshotsDir, `${product.id}_Tesco.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Tesco screenshot saved:', screenshotPath);
  return screenshotPath;
}

async function automateProduct(product) {
  const { url, vendor_name, id, uuid, name, quantity } = product;
  console.log('Processing product ID:', uuid);
  let browser;
  let feedback = '';
  let randomNo = Math.floor(Math.random() * 10000);
  try {
    console.log('-->Starting automation..');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({
      width: 1280 + Math.floor(Math.random() * 100),
      height: 800 + Math.floor(Math.random() * 100)
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000 + Math.random() * 2000);
    await autoAcceptCookies(page);
    let screenshotPath = '';
    let status = 'completed';
    switch ((vendor_name || '').toLowerCase()) {
      case 'asda':
        let automationResponse = await automateAsda(page, product, randomNo);
        if(automationResponse.success)
          feedback = `ASDA automation completed. Screenshot: ${automationResponse.screenshotPath}`;
        else
          feedback = `Error processing ASDA automation: ${automationResponse.error}`;
        break;
      case "sainsbury's":
        screenshotPath = await automateSainsburys(page, product);
        feedback = `Sainsbury's automation completed. Screenshot: ${screenshotPath}`;
        break;
      case 'tesco':
        screenshotPath = await automateTesco(page, product);
        feedback = `Tesco automation completed. Screenshot: ${screenshotPath}`;
        break;
      case 'amazon uk':
        screenshotPath = await automateAmazon(page, product);
        feedback = `Amazon UK automation completed. Screenshot: ${screenshotPath}`;
        break;
      default:
        feedback = `No automation implemented for vendor: ${vendor_name}`;
        status = 'vendor_not_supported';
    }
    await sleep(5000 + Math.random() * 2000);
    console.log('..automation complete. feedback:', feedback, '\nUpdating DB..');
    if (id) {
      await updateFeedbackDb(id, feedback);
    }
    console.log(`Automation for id ${id} done. Status: ${status}`);
  } catch (err) {
    feedback = `Error processing ${url}: ${err.message}`;
    if (product && product.id) {
      await updateFeedbackDb(product.id, feedback);
    }
    console.error(feedback);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { automateProduct }; 