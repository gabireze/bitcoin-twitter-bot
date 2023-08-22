import puppeteer from "puppeteer";

const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts
const RETRY_INTERVAL = 30000; // Interval between retry attempts in milliseconds

const getBitcoinMonthlyReturns = async (url, width, height) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setViewport({ width, height });

  await page.goto(url);

  let retryAttempts = 0;
  let elementHandle = null;

  while (retryAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      elementHandle = await page.waitForSelector(".MuiGrid-root.MuiGrid-direction-xs-row.MuiGrid-grid-xs-12.cg-style-ipi2ni", { timeout: RETRY_INTERVAL });
      break; // Exit the loop if element is found
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

    const fs = await import("fs");
    fs.writeFileSync("./bitcoinMonthlyReturns.png", elementScreenshot);

    console.log("Screenshot captured and saved.");
  } catch (error) {
    throw new Error(error);
  }
};

export const getBitcoinMonthlyReturnsMessage = async () => {
  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  const tweetMessage = `#Bitcoin Monthly Returns (%) for ${currentMonth} ${currentYear} by @coinglass_com`;
  return tweetMessage;
};
