import puppeteer from 'puppeteer';
import { logError, logScreenshotEvent } from '../utils/screenshotLogger.mjs';

const fetchBitcoinMonthlyReturnsScreenshotCoinglass = async (url, width, height) => {
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

    // Configurar user agent mais convincente e atualizado
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );

    // Adicionar headers extras para simular navegador real
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

    logScreenshotEvent('navigation_start', { site: 'Coinglass' });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

    // Aguardar o carregamento básico da página
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Procurar pelo h2 com texto "Bitcoin Monthly returns(%)"
    logScreenshotEvent('searching_title', { title: 'Bitcoin Monthly returns(%)' });

    // Usar JavaScript para encontrar o elemento pelo texto
    const titleElement = await page.evaluateHandle(() => {
      const h2Elements = Array.from(document.querySelectorAll('h2'));
      return h2Elements.find(
        h2 =>
          h2.textContent.includes('Bitcoin Monthly returns(%)') ||
          h2.textContent.includes('Monthly returns(%)')
      );
    });

    if (!titleElement || titleElement.asElement() === null) {
      logScreenshotEvent('title_not_found', { action: 'capturing_full_page' });
      const screenshot = await page.screenshot({ fullPage: true });
      return screenshot;
    }

    // Navegar 3 divs acima do h2 conforme sugerido
    logScreenshotEvent('finding_container', { levels_up: 3 });
    const containerElement = await page.evaluateHandle(titleEl => {
      // Subir 3 níveis na hierarquia DOM
      let currentElement = titleEl;
      for (let i = 0; i < 3; i++) {
        if (currentElement && currentElement.parentElement) {
          currentElement = currentElement.parentElement;
        } else {
          break;
        }
      }
      return currentElement;
    }, titleElement);

    // Aguardar mais um pouco para garantir que tudo carregou
    await new Promise(resolve => setTimeout(resolve, 5000));

    logScreenshotEvent('capturing_screenshot', { target: 'container' });
    const screenshot = await containerElement.screenshot();
    return screenshot;
  } catch (error) {
    logError('Error in fetchBitcoinMonthlyReturnsScreenshotCoinglass', error);
    throw error;
  } finally {
    await browser.close();
  }
};

const fetchBitcoinMonthlyReturnsScreenshot = async (url, width, height) => {
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

    // Configurar user agent mais convincente e atualizado
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );

    // Adicionar headers extras para simular navegador real
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

    // Verificar se estamos na página de verificação do Cloudflare
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

      // Simular comportamento humano - aguardar e mover mouse
      await page.mouse.move(500, 300);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Aguardar até 90 segundos pelo redirect automático
      try {
        console.log('⏳ Aguardando redirect automático do Cloudflare...');
        await page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 90000,
        });
        console.log('✅ Redirect do Cloudflare completado!');
      } catch (redirectError) {
        console.log('❌ Timeout no redirect. Tentando recarregar...');
        // Recarregar a página
        await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Aguardar o carregamento básico da página
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar se existem popups ou overlays para fechar
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
      } catch (e) {
        // Ignorar erros de popup
      }
    }

    // Aguardar diretamente pelo elemento do heatmap
    console.log('Procurando elemento #monthly-returns-heatmap...');

    // Primeiro vamos verificar que elementos existem na página
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
        .slice(0, 20); // Primeiros 20 elementos
    });

    console.log('Elementos disponíveis na página:', JSON.stringify(availableElements, null, 2));

    let chartElement;
    try {
      chartElement = await page.waitForSelector('#monthly-returns-heatmap', { timeout: 60000 });
    } catch (timeoutError) {
      console.log(
        'Timeout aguardando #monthly-returns-heatmap. Tentando seletores alternativos...'
      );

      // Tentar seletores alternativos baseados no que encontramos
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
        } catch (e) {
          console.log(`Seletor ${selector} falhou`);
        }
      }
    }

    if (!chartElement) {
      console.log('Nenhum elemento do heatmap encontrado. Capturando página inteira para debug...');
      const screenshot = await page.screenshot({ fullPage: true });
      return screenshot;
    }

    // Aguardar mais um pouco para garantir que tudo carregou
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Remover elementos de exportação se existirem
    await page.evaluate(() => {
      const exportingGroup = document.querySelector('.highcharts-exporting-group');
      if (exportingGroup) {
        exportingGroup.remove();
      }

      // Remover popup de restrição se existir
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
    // URL do Coinglass.com
    const url = 'https://www.coinglass.com/today';
    const width = 1370;
    const height = 2000;

    const elementScreenshot = await fetchBitcoinMonthlyReturnsScreenshotCoinglass(
      url,
      width,
      height
    );
    console.log('Screenshot captured from Coinglass', elementScreenshot);
    return elementScreenshot;
  } catch (error) {
    console.log('Erro capturando do Coinglass, tentando NewHedge como fallback...');

    // Fallback para NewHedge se Coinglass falhar
    try {
      const url = 'https://newhedge.io/bitcoin/monthly-returns-heatmap';
      const width = 1370;
      const height = 2000;

      const elementScreenshot = await fetchBitcoinMonthlyReturnsScreenshot(url, width, height);
      console.log('Screenshot captured from NewHedge fallback', elementScreenshot);
      return elementScreenshot;
    } catch (fallbackError) {
      throw new Error(
        `Ambos falharam - Coinglass: ${error.message}, NewHedge: ${fallbackError.message}`
      );
    }
  }
};
