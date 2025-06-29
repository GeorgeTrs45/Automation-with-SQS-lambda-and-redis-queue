const path = require('path');
const fs = require('fs-extra');

const screenshotsDir = path.join(__dirname, '../../screenshots');

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const proxies = [
  'http://user:password@111.111.111.111:8000',
  'http://user:password@222.222.222.222:8000'
];

// Expanded user agents (add more as needed)
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:109.0) Gecko/20100101 Firefox/117.0',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36'
];

// Cookie helpers
const cookiesDir = path.join(__dirname, '../../cookies');
fs.ensureDirSync(cookiesDir);

async function saveCookies(context, key) {
  const cookies = await context.cookies();
  const filePath = path.join(cookiesDir, `${key}.json`);
  await fs.writeJson(filePath, cookies, { spaces: 2 });
}

async function loadCookies(context, key) {
  const filePath = path.join(cookiesDir, `${key}.json`);
  if (await fs.pathExists(filePath)) {
    const cookies = await fs.readJson(filePath);
    await context.addCookies(cookies);
    return true;
  }
  return false;
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

// Human-like behavior for automation
async function humanLikeBehavior(page) {
  try {
    // Random mouse moves
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * 700) + 100;
      const y = Math.floor(Math.random() * 500) + 100;
      await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 20) + 5 });
      await sleep(Math.random() * 400 + 200);
    }
    // Scroll down in chunks
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.8);
      });
      await sleep(Math.random() * 700 + 500);
    }
    // Pause and scroll up
    await sleep(Math.random() * 500 + 500);
    await page.evaluate(() => {
      window.scrollBy(0, -window.innerHeight * 0.5);
    });
    await sleep(Math.random() * 500 + 300);
    // Random click
    const bx = Math.floor(Math.random() * 700) + 50;
    const by = Math.floor(Math.random() * 500) + 50;
    await page.mouse.click(bx, by);
    await sleep(Math.random() * 1000 + 1000);
    // Random keyboard
    if (Math.random() > 0.5) {
      await page.keyboard.press('PageDown');
      await sleep(Math.random() * 500 + 200);
    }
  } catch (err) {
    console.error('Error in humanLikeBehavior:', err);
  }
}

// CAPTCHA detection and (placeholder) solving
async function detectAndSolveCaptcha(page) {
  try {
    const captchaPresent = await page.$('iframe[src*="captcha"], [id*="captcha"], [class*="captcha"]');
    if (captchaPresent) {
      console.log('CAPTCHA detected! Please solve manually or integrate a solver.');
      await page.screenshot({ path: path.join(screenshotsDir, `captcha_${Date.now()}.png`) });
      // Optionally, you could throw or handle as needed
      // throw new Error('CAPTCHA detected. Automation stopped.');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error in detectAndSolveCaptcha:', err);
    return false;
  }
}

module.exports = { sleep, autoAcceptCookies, screenshotsDir, randomDelay, proxies, userAgents, saveCookies, loadCookies, humanLikeBehavior, detectAndSolveCaptcha }; 