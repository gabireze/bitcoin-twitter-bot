import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL = 30000;

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const getBitcoinMonthlyReturns = async (url, width, height) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  await page.setViewport({ width, height });

  await page.goto(url);

  let retryAttempts = 0;
  let elementHandle = null;

  while (retryAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      elementHandle = await page.waitForSelector(".MuiGrid-root.MuiGrid-direction-xs-row.MuiGrid-grid-xs-12.cg-style-ipi2ni", { timeout: RETRY_INTERVAL });
      break;
    } catch (error) {
      retryAttempts++;
      console.log(`Element not found, retry attempt ${retryAttempts}`);
    }
  }

  if (!elementHandle) {
    throw new Error("Element not found after retries");
  }

  const elementScreenshot = await elementHandle.screenshot();

  await browser.close();

  return elementScreenshot;
};

export const captureBitcoinMonthlyReturnsScreenshot = async () => {
  try {
    const url = "https://www.coinglass.com/today";
    const width = 1370;
    const height = 2000;

    const elementScreenshot = await getBitcoinMonthlyReturns(url, width, height);
    console.log("Screenshot captured", elementScreenshot);
    return elementScreenshot;
  } catch (error) {
    throw new Error(error);
  }
};

export const getBitcoinMonthlyReturnsMessage = async () => {
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prevMonthName = monthNames[previousMonth.getMonth()];
  const prevYear = previousMonth.getFullYear();

  const tweetMessage = `#Bitcoin Monthly Returns (%) for ${prevMonthName} ${prevYear} by @coinglass_com`;

  return tweetMessage;
};
