import puppeteer from 'puppeteer';

const fetchBitcoinMonthlyReturnsScreenshotCoinglass = async (url, width, height) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    console.log('📖 Navigating to:', url);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (_) {
      console.log('Navigation had issues, but continuing...');
    }

    console.log('⏳ Waiting for page to load...');
    await new Promise(r => setTimeout(r, 12000));
    console.log('🔍 Locating Bitcoin Monthly returns card...');
    
    const cardElement = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('div.MuiCard-root'));
      const correctCard = cards.find(card => {
        const h2 = card.querySelector('h2');
        return h2 && h2.textContent.includes('Bitcoin Monthly returns');
      });
      
      return correctCard || cards[0];
    });
    
    if (!cardElement || cardElement.asElement() === null) {
      console.log('⚠️ Card element is null, capturing page...');
      const buffer = await page.screenshot({ fullPage: true });
      await page.close();
      await browser.close();
      return buffer;
    }

    console.log('✅ Found correct card, capturing...');
    const buffer = await cardElement.screenshot();

    await page.close();
    await browser.close();

    console.log('✅ Screenshot successful, size:', buffer.length);
    return buffer;
  } catch (error) {
    console.error('❌ Screenshot error:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e.message);
      }
    }
    throw error;
  }
};

const _fetchBitcoinMonthlyReturnsScreenshot = async (url, width, height) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    ignoreHTTPSErrors: true,
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--hide-scrollbars',
      '--disable-web-security',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    });

    console.log('Navegando para NewHedge...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
    let isCloudflare = false;
    try {
      const cloudflareElements = await page.$$eval('*', elements =>
        elements.some(
          el =>
            el.textContent?.includes('Checking if the site connection is secure') ||
            el.textContent?.includes('needs to review the security') ||
            el.textContent?.includes('Verification successful') ||
            el.id === 'challenge-success-text'
        )
      );
      isCloudflare = cloudflareElements;
    } catch (e) {
      console.log('Erro verificando Cloudflare:', e.message);
    }

    if (isCloudflare) {
      console.log('🛡️ Cloudflare security check detectado. Aguardando...');
      await page.mouse.move(500, 300);
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        console.log('⏳ Aguardando redirect automático do Cloudflare...');
        await page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 90000,
        });
        console.log('✅ Redirect do Cloudflare completado!');
      } catch (_) {
        console.log('❌ Timeout no redirect. Tentando recarregar...');
        await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    const popupSelectors = [
      'button[class*="close"]',
      'button[class*="dismiss"]',
      '.modal-close',
      '[aria-label*="close"]',
      '[aria-label*="Close"]',
    ];

    for (const selector of popupSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`Fechando popup: ${selector}`);
          await elements[0].click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (_) {
      }
    }
    console.log('Procurando elemento #monthly-returns-heatmap...');
    const availableElements = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      return allDivs
        .filter(
          div =>
            div.id ||
            (div.className &&
              (div.className.includes('heatmap') || div.className.includes('return')))
        )
        .map(div => ({
          id: div.id,
          className: div.className,
          tagName: div.tagName,
          textContent: div.textContent?.substring(0, 50),
        }))
        .slice(0, 20);
    });

    console.log('Elementos disponíveis na página:', JSON.stringify(availableElements, null, 2));

    let chartElement;
    try {
      chartElement = await page.waitForSelector('#monthly-returns-heatmap', { timeout: 60000 });
    } catch (_) {
      console.log(
        'Timeout aguardando #monthly-returns-heatmap. Tentando seletores alternativos...'
      );
      const alternativeSelectors = [
        'div[id*="heatmap"]',
        'div[class*="heatmap"]',
        'div[id*="return"]',
        'div[class*="return"]',
        '.highcharts-container',
        '.chart-container',
      ];

      for (const selector of alternativeSelectors) {
        try {
          chartElement = await page.$(selector);
          if (chartElement) {
            console.log(`Elemento encontrado com seletor alternativo: ${selector}`);
            break;
          }
        } catch (_) {
          console.log(`Seletor ${selector} falhou`);
        }
      }
    }

    if (!chartElement) {
      console.log('Nenhum elemento do heatmap encontrado. Capturando página inteira para debug...');
      const screenshot = await page.screenshot({ fullPage: true });
      return screenshot;
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.evaluate(() => {
      const exportingGroup = document.querySelector('.highcharts-exporting-group');
      if (exportingGroup) {
        exportingGroup.remove();
      }
      const popup = document.querySelector('[data-restricted-info-popup-target="popup"]');
      if (popup) {
        popup.style.display = 'none';
      }
    });

    console.log('Using #monthly-returns-heatmap selector');
    const elementScreenshot = await chartElement.screenshot();
    return elementScreenshot;
  } catch (error) {
    console.error('Error in fetchBitcoinMonthlyReturnsScreenshot:', error.message, error.stack);
    throw error;
  } finally {
    await browser.close();
  }
};

export const captureMonthlyReturnsChart = async () => {
  try {
    const url = 'https://www.coinglass.com/today';
    const width = 1370;
    const height = 2000;

    console.log('Tentando capturar Bitcoin Monthly Returns do Coinglass...');
    
    try {
      const elementScreenshot = await fetchBitcoinMonthlyReturnsScreenshotCoinglass(
        url,
        width,
        height
      );
      console.log('✅ Screenshot capturado com sucesso do Coinglass');
      return elementScreenshot;
    } catch (error) {
      console.log('❌ Erro ao capturar do Coinglass:', error.message);
      console.log('ℹ️ A captura do Monthly Returns requer acesso direto. Verifique:');
      console.log('  1. Conexão com internet estável');
      console.log('  2. Se Coinglass não está bloqueando requisições automatizadas');
      console.log('  3. O servidor pode estar temporariamente indisponível');
      throw error;
    }
  } catch (error) {
    console.error('❌ Falha ao capturar Bitcoin Monthly Returns');
    throw new Error(
      `Falha ao capturar Monthly Returns do Coinglass: ${error.message}`
    );
  }
};
