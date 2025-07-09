const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { updateFeedbackDb } = require('../models/productModel');
const automateAsda = require('./vendors/asda');
const automateSainsburys = require('./vendors/sainsburys');
const automateTesco = require('./vendors/tesco');
const automateAmazon = require('./vendors/amazon');
const { autoAcceptCookies, screenshotsDir, getRotatedHeaders, getRandomViewport, moveMouseRandomly, randomDelay, injectStealthScripts } = require('./utils');

chromium.use(StealthPlugin());

fs.ensureDirSync(screenshotsDir);

const SESSIONS_DIR = path.join(__dirname, './sessions');

async function automateProduct(product) {
  const { url, vendor_name, id, uuid, name, quantity } = product;
  console.log('Processing product ID:', uuid, '\nStarting automation..');
  let browser, feedback = '', headers = getRotatedHeaders(url);
  let randomNo = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  const sessionFile = path.join(SESSIONS_DIR, `${(vendor_name || 'default').replace(/\s+/g, '_').toLowerCase()}.json`);
  try {
    browser = await chromium.launch({ headless: false });
    let contextOptions = {
      viewport: getRandomViewport(),
      locale: 'en-US',
      colorScheme: 'light',
      ignoreHTTPSErrors: true,
      userAgent: headers['User-Agent'],
      extraHTTPHeaders: headers
    };
    if (fs.existsSync(sessionFile)) {
      contextOptions.storageState = sessionFile;
      console.log(`Loaded session for vendor '${vendor_name}' from ${sessionFile}`);
    }
    let context = await browser.newContext(contextOptions);
    await injectStealthScripts(context);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await moveMouseRandomly(page);
    await page.waitForTimeout(randomDelay());
    await autoAcceptCookies(page);
    let automationResponse = null;
    switch ((vendor_name || '').toLowerCase()) {
      case 'asda':
        automationResponse = await automateAsda(page, product, randomNo);
        break;
      case "sainsburys":
        automationResponse = await automateSainsburys(page, product, randomNo);
        break;
      case 'tesco':
        automationResponse = await automateTesco(page, product, randomNo);
        break;
      case 'amazon uk':
        automationResponse = await automateAmazon(page, product, randomNo);
        break;
      default:
        throw new Error(`No automation implemented for vendor: ${vendor_name}`);

    }
    await page.waitForTimeout(randomDelay());
    //response management
    if (automationResponse && automationResponse.success) {
      feedback = `${vendor_name} automation completed. Screenshot: ${automationResponse.screenshotPath}`;
    } else if (automationResponse && automationResponse.error) {
      throw new Error(automationResponse.error);
    }
    // Save session state after automation
    await context.storageState({ path: sessionFile });
    console.log(`Session state saved to ${sessionFile} \n..automation complete. feedback:`, feedback, '\nUpdating DB..');
    if (id) {
      await updateFeedbackDb(id, feedback);
    }
    console.log(`Automation for id ${id} done.`);
  } catch (err) {
    feedback = `Error processing ${url}: ${err.message}`;
    if (product && product.id) {
      await updateFeedbackDb(product.id, feedback);
    }
    console.error(feedback);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { automateProduct }; 