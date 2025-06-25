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

async function automateAsda(page, product) {
  const screenshotPath = path.join(screenshotsDir, `${product.id}_Asda.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('ASDA screenshot saved:', screenshotPath);
  return screenshotPath;
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
  const { url, vendor_name, id, name, quantity } = product;
  console.log('Processing product ID:', id);
  let browser;
  let feedback = '';
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
        screenshotPath = await automateAsda(page, product);
        feedback = `ASDA automation completed. Screenshot: ${screenshotPath}`;
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
    console.log('..automation complete. \nUpdating db..');
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