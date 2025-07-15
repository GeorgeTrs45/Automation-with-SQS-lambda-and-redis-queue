const path = require('path');
const fs = require('fs');
const screenshotsDir = path.join(__dirname, '../../screenshots');

// accept cookies function
async function autoAcceptCookies(page) {
  const selectors = [
    'button[aria-label*="accept"]',
    'button[aria-label*="cookie"]',
    'button[title*="Accept"]',
    'button:has-text("Accept")',
    'button:has-text("Accept Cookies")',
    'button:has-text("I agree")',
    'button:has-text("Got it")',
    'button:has-text("Allow all")',
    'button:has-text("Accept all")',
    'button:has-text("Continue and accept")',
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
      console.log("🚀 ~ autoAcceptCookies ~ e:", e.message)
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
      console.log("🚀 ~ autoAcceptCookies ~ ex:", ex.message)
    }
  }
  return false;
}

//session formatter
function normalizeSameSite(value) {
  const lower = String(value || '').toLowerCase();
  if (lower === 'lax') return 'Lax';
  if (lower === 'strict') return 'Strict';
  if (lower === 'none' || lower === 'no_restriction' || lower === 'unspecified') return 'None';
  return 'None';
}
async function convertCookiesToSessionFormatInPlace(filePath) {
  try {
    const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
    const cookies = Array.isArray(data) ? data : data.cookies || [];
    const formattedCookies = cookies.map(cookie => ({
      ...cookie,
      sameSite: normalizeSameSite(cookie.sameSite),
    }));
    return { cookies: formattedCookies, origins: [] };
  } catch (error) {
    console.log("🚀 ~ getSessionStorageState ~ error:", error.message)
    return error.message;
  }
}

// --- Stealth & Automation Utilities ---
function randomDelay(min = 2000, max = 6000) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
];

function getRotatedHeaders(website) {
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Referer": website,
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": userAgent,
    "X-Amzn-Trace-Id": `Root=1-${Math.random().toString(16).slice(2)}`,
    "Accept-Language": "en-US,en;q=0.9"
  };
}

function getRandomViewport() {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1600, height: 900 },
    { width: 1280, height: 720 }
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
}

async function moveMouseRandomly(page) {
  const loopCount = Math.floor(Math.random() * 5) + 1;
  let x = 500, y = 500;
  await page.mouse.move(x, y);
  for (let i = 0; i < loopCount; i++) {
    x += Math.floor(Math.random() * 200) - 100;
    y += Math.floor(Math.random() * 200) - 100;
    await page.mouse.move(x, y, { steps: 10 });
    await page.waitForTimeout(Math.floor(Math.random() * 500) + 300);
  }
}

async function injectStealthScripts(context) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.navigator.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
      return getParameter.call(this, parameter);
    };
  });
}


module.exports = { autoAcceptCookies, screenshotsDir, randomDelay, convertCookiesToSessionFormatInPlace, getRotatedHeaders, getRandomViewport, moveMouseRandomly, injectStealthScripts }; 