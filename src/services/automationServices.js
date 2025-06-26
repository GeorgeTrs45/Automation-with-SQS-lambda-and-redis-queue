const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { updateFeedbackDb } = require('../models/productModel');
const automateAsda = require('./vendors/asda');
const automateSainsburys = require('./vendors/sainsburys');
const automateTesco = require('./vendors/tesco');
const automateAmazon = require('./vendors/amazon');
const { sleep, autoAcceptCookies, screenshotsDir } = require('./utils');

chromium.use(StealthPlugin());

fs.ensureDirSync(screenshotsDir);

async function automateProduct(product) {
  const { url, vendor_name, id, uuid, name, quantity } = product;
  console.log('Processing product ID:', uuid, '\nStarting automation..');
  let browser;
  let feedback = '';
  let randomNo = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({
      width: 1280 + Math.floor(Math.random() * 100),
      height: 800 + Math.floor(Math.random() * 100)
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000 + Math.random() * 2000);
    await autoAcceptCookies(page);
    let automationResponse = '', status = 'completed';
    switch ((vendor_name || '').toLowerCase()) {
      case 'asda':
        automationResponse = await automateAsda(page, product, randomNo);
        if(automationResponse.success)
          feedback = `ASDA automation completed. Screenshot: ${automationResponse.screenshotPath}`;
        else
          feedback = `Error processing ASDA automation: ${automationResponse.error}`;
        break;
      case "sainsbury's":
        automationResponse = await automateSainsburys(page, product, randomNo);
        if(automationResponse.success)
          feedback = `Sainsbury automation completed. Screenshot: ${automationResponse.screenshotPath}`;
        else
          feedback = `Error processing Sainsbury automation: ${automationResponse.error}`;
        break;
      case 'tesco':
        automationResponse = await automateTesco(page, product, randomNo);
        if(automationResponse.success)
          feedback = `tesco automation completed. Screenshot: ${automationResponse.screenshotPath}`;
        else
          feedback = `Error processing tesco automation: ${automationResponse.error}`;
        break;
      case 'amazon uk':
        automationResponse = await automateAmazon(page, product, randomNo);
        if(automationResponse.success)
          feedback = `Amazon automation completed. Screenshot: ${automationResponse.screenshotPath}`;
        else
          feedback = `Error processing amazon Automation: ${automationResponse.error}`;
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