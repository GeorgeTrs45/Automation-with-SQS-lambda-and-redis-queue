const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { updateFeedbackDb } = require('../models/productModel');
const automateAsda = require('./vendors/asda');
const automateSainsburys = require('./vendors/sainsburys');
const automateTesco = require('./vendors/tesco');
const automateAmazon = require('./vendors/amazon');
const { sleep, autoAcceptCookies, screenshotsDir, randomDelay, proxies, userAgents, saveCookies, loadCookies, humanLikeBehavior, detectAndSolveCaptcha } = require('./utils');

chromium.use(StealthPlugin());

fs.ensureDirSync(screenshotsDir);

async function automateProduct(product) {
  const { url, vendor_name, id, uuid, name, quantity } = product;
  console.log('Processing product ID:', uuid, '\nStarting automation..');
  const proxy = proxies[Math.floor(Math.random() * proxies.length)];
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const headerSets = [
    { 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html,application/xhtml+xml' },
    { 'Accept-Language': 'en-GB,en;q=0.8', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9' },
    { 'Accept-Language': 'en-US,en;q=0.7', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.8' }
  ];
  const extraHTTPHeaders = headerSets[Math.floor(Math.random() * headerSets.length)];
  let browser, context;
  let feedback = '';
  let randomNo = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  const cookieKey = `${(vendor_name || '').toLowerCase()}`;
  try {
    browser = await chromium.launch({ headless: false, 
      // proxy: { server: proxy } 
    });
    context = await browser.newContext({
      userAgent: userAgent,
      extraHTTPHeaders
    });
    // Try to load cookies for this session
    await loadCookies(context, cookieKey);
    
    const page = await context.newPage();
    await page.setViewportSize({
      width: 1280 + Math.floor(Math.random() * 100),
      height: 800 + Math.floor(Math.random() * 100)
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(randomDelay());
    await autoAcceptCookies(page);
    await humanLikeBehavior(page);
    await detectAndSolveCaptcha(page);
    let automationResponse = null;
    let status = 'completed';
    
    switch ((vendor_name || '').toLowerCase()) {
      case 'asda':
        automationResponse = await automateAsda(page, product, randomNo);
        break;
      case "sainsbury's":
        automationResponse = await automateSainsburys(page, product, randomNo);
        break;
      case 'tesco':
        automationResponse = await automateTesco(page, product, randomNo);
        break;
      case 'amazon uk':
        automationResponse = await automateAmazon(page, product, randomNo);
        break;
      default:
        feedback = `Error: No automation implemented for vendor: ${vendor_name}`;
        status = 'vendor_not_supported';
    }
    
    // Save cookies after automation (for login/session reuse)
    await saveCookies(context, cookieKey);
    await sleep(5000 + Math.random() * 2000);
    
    if (automationResponse && automationResponse.error) {
      throw new Error(automationResponse.error);
    }
    
    if (automationResponse && automationResponse.success) {
      feedback = `${vendor_name} automation completed. Screenshot: ${automationResponse.screenshotPath}`;
    } else if (automationResponse) {
      feedback = `Error processing ${vendor_name} automation: ${automationResponse.error}`;
    } else if (!feedback) {
      feedback = `${vendor_name} automation completed without response`;
    }
    
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