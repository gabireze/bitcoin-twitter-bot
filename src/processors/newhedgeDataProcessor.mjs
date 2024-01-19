import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const fetchBitcoinMonthlyReturnsScreenshot = async (url, width, height) => {
  chromium.setHeadlessMode = true;

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security", "--disable-setuid-sandbox", "--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    const elementSelector = ".highcharts-root";
    const elementHandle = await page.waitForSelector(elementSelector, { timeout: 30000 });

    if (!elementHandle) {
      throw new Error(`Could not find element that matches selector: ${elementSelector}.`);
    }

    await page.evaluate(() => {
      const exportingGroup = document.querySelector(".highcharts-exporting-group");
      if (exportingGroup) {
        exportingGroup.remove();
      }
    });

    const elementScreenshot = await elementHandle.screenshot();
    return elementScreenshot;
  } catch (error) {
    console.error("Error in fetchBitcoinMonthlyReturnsScreenshot:", error.message, error.stack);
    throw error;
  } finally {
    await browser.close();
  }
};

export const getBitcoinReturnsScreenshot = async () => {
  try {
    const url = "https://newhedge.io/terminal/bitcoin/monthly-returns-heatmap";
    const width = 1370;
    const height = 2000;

    const elementScreenshot = await fetchBitcoinMonthlyReturnsScreenshot(url, width, height);
    console.log("Screenshot captured", elementScreenshot);
    return elementScreenshot;
  } catch (error) {
    throw new Error(error);
  }
};
