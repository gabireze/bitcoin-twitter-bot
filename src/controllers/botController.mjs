import { fetchPriceData } from '../services/bitcoinDataService.mjs';
import { getFearGreedIndex } from '../services/fearGreedIndexService.mjs';
import { captureMonthlyReturnsChart } from '../processors/screenshotProcessor.mjs';
import { uploadFileByBuffer } from '../services/s3Service.mjs';
// IMPORTS DO TWITTER COMENTADOS TEMPORARIAMENTE
// import { postTweet, uploadMediaAndGetIds } from '../services/twitterService.mjs';
import { postBlueSkyWithMedia, postBlueSkyWithoutMedia } from '../services/blueskyService.mjs';
import {
  createDailyPriceUpdate,
  createHourlyPriceUpdate,
} from '../messageTemplates/priceMessages.mjs';
import { createFearGreedMessage } from '../messageTemplates/fearGreedMessages.mjs';
import { createMonthlyReturnsMessage } from '../messageTemplates/monthlyReturnsMessages.mjs';
import { config, validateEnvironment } from '../config/config.mjs';
import { logger } from '../utils/logger.mjs';
import { ValidationError } from '../utils/errors.mjs';

/**
 * BotController - Sistema unificado que posta simultaneamente no Twitter e BlueSky
 *
 * TODAS as ações agora postam automaticamente nas duas plataformas:
 * - Economiza recursos (1 request, 2 posts)
 * - Evita duplicação de código
 * - Sincroniza conteúdo entre plataformas
 */
export class BotController {
  constructor() {
    validateEnvironment();
  }

  // ========================================
  // UNIFIED METHODS (TWITTER + BLUESKY SIMULTANEOUSLY)
  // ========================================

  async postHourlyPriceUpdate() {
    try {
      logger.info('Starting Bitcoin 1h price update (UNIFIED - BOTH PLATFORMS)');

      // Fetch data once
      const response = await fetchPriceData(config.bitcoin.coinId, config.bitcoin.currency);

      if (!response) {
        throw new ValidationError('No data returned from the fetchPriceData function');
      }

      const summaryMessage = createHourlyPriceUpdate(response);

      // Post to both platforms simultaneously with graceful error handling
      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        // TWITTER DESABILITADO TEMPORARIAMENTE
        // postTweet(summaryMessage),
        Promise.resolve({ id: 'disabled_' + Date.now(), text: summaryMessage }),
        postBlueSkyWithoutMedia(summaryMessage),
      ]);

      const results = {
        twitter: {
          success: twitterResponse.status === 'fulfilled',
          data: twitterResponse.status === 'fulfilled' ? twitterResponse.value : null,
          error:
            twitterResponse.status === 'rejected'
              ? twitterResponse.reason?.message || twitterResponse.reason
              : null,
          isRateLimit:
            twitterResponse.status === 'rejected' &&
            (twitterResponse.reason?.message?.includes('429') ||
              twitterResponse.reason?.message?.includes('circuit breaker')),
        },
        bluesky: {
          success: blueSkyResponse.status === 'fulfilled',
          data: blueSkyResponse.status === 'fulfilled' ? blueSkyResponse.value : null,
          error:
            blueSkyResponse.status === 'rejected'
              ? blueSkyResponse.reason?.message || blueSkyResponse.reason
              : null,
        },
      };

      // Enhanced logging with better context
      logger.info(summaryMessage, {
        twitter: results.twitter.success ? 'SUCCESS' : 'FAILED',
        bluesky: results.bluesky.success ? 'SUCCESS' : 'FAILED',
        twitterError: results.twitter.isRateLimit
          ? 'RATE_LIMITED'
          : results.twitter.error
            ? 'ERROR'
            : null,
        message: summaryMessage,
      });

      return results;
    } catch (error) {
      logger.error('Error in postHourlyPriceUpdate', error);
      throw error;
    }
  }

  async postDailyPriceUpdate() {
    try {
      logger.info('Starting Bitcoin 24h price update (UNIFIED - BOTH PLATFORMS)');

      // Fetch data once
      const priceData = await fetchPriceData(config.bitcoin.coinId, config.bitcoin.currency);

      if (!priceData) {
        throw new ValidationError('Failed to fetch Bitcoin price data or received empty response');
      }

      const summaryMessage = createDailyPriceUpdate(priceData);

      // Post to both platforms simultaneously
      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        // TWITTER DESABILITADO TEMPORARIAMENTE
        // postTweet(summaryMessage),
        Promise.resolve({ id: 'disabled_' + Date.now(), text: summaryMessage }),
        postBlueSkyWithoutMedia(summaryMessage),
      ]);

      const results = {
        twitter: {
          success: twitterResponse.status === 'fulfilled',
          data: twitterResponse.status === 'fulfilled' ? twitterResponse.value : null,
          error: twitterResponse.status === 'rejected' ? twitterResponse.reason : null,
        },
        bluesky: {
          success: blueSkyResponse.status === 'fulfilled',
          data: blueSkyResponse.status === 'fulfilled' ? blueSkyResponse.value : null,
          error: blueSkyResponse.status === 'rejected' ? blueSkyResponse.reason : null,
        },
      };

      logger.info('Bitcoin 24h price update posted to both platforms', {
        twitter: results.twitter.success ? 'SUCCESS' : 'FAILED',
        bluesky: results.bluesky.success ? 'SUCCESS' : 'FAILED',
        message: summaryMessage,
      });

      return results;
    } catch (error) {
      logger.error('Error in postDailyPriceUpdate', error);
      throw error;
    }
  }

  async postFearGreedIndex() {
    try {
      logger.info('Starting Fear & Greed Index post to ALL platforms (optimized)');

      // 1. Buscar dados UMA vez só
      const fearGreedIndexData = await getFearGreedIndex();
      if (!fearGreedIndexData?.data?.length) {
        throw new ValidationError('Invalid or empty Fear & Greed Index data received');
      }

      // 2. Criar mensagem UMA vez só
      const fearGreedIndexMessage = createFearGreedMessage(fearGreedIndexData);
      const indexValue = fearGreedIndexData.data[0].value;
      const classification = fearGreedIndexData.data[0].value_classification;

      // 3. Postar simultaneamente nas duas plataformas
      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        // TWITTER DESABILITADO TEMPORARIAMENTE
        /*
        (async () => {
          const mediaIds = await uploadMediaAndGetIds([
            { path: config.images.fearGreedIndexUrl, mimeType: 'image/png' },
          ]);
          return postTweet(fearGreedIndexMessage, mediaIds);
        })(),
        */
        Promise.resolve({ id: 'disabled_' + Date.now(), text: fearGreedIndexMessage }),
        postBlueSkyWithMedia(
          fearGreedIndexMessage,
          config.images.fearGreedIndexUrl,
          `Fear & Greed Index is ${indexValue} (${classification})`
        ),
      ]);

      const results = {
        twitter: {
          success: twitterResponse.status === 'fulfilled',
          data: twitterResponse.status === 'fulfilled' ? twitterResponse.value : null,
          error: twitterResponse.status === 'rejected' ? twitterResponse.reason : null,
        },
        bluesky: {
          success: blueSkyResponse.status === 'fulfilled',
          data: blueSkyResponse.status === 'fulfilled' ? blueSkyResponse.value : null,
          error: blueSkyResponse.status === 'rejected' ? blueSkyResponse.reason : null,
        },
      };

      logger.info('Fear & Greed Index posted to both platforms', {
        twitter: results.twitter.success ? 'SUCCESS' : 'FAILED',
        bluesky: results.bluesky.success ? 'SUCCESS' : 'FAILED',
        message: fearGreedIndexMessage,
      });

      return results;
    } catch (error) {
      logger.error('Error in postFearGreedIndex', error);
      throw error;
    }
  }

  async postMonthlyReturns() {
    try {
      logger.info('Starting Bitcoin Monthly Returns post to ALL platforms (optimized)');

      // 1. Gerar screenshot UMA vez só
      const screenshotBuffer = await captureMonthlyReturnsChart();
      if (!screenshotBuffer) {
        throw new ValidationError('Failed to capture Bitcoin Monthly Returns screenshot');
      }

      // 2. Upload para S3 UMA vez só
      const imageUrl = await uploadFileByBuffer(
        screenshotBuffer,
        config.images.bitcoinMonthlyReturnsPath
      );
      if (!imageUrl) {
        throw new ValidationError('Failed to upload Bitcoin Monthly Returns screenshot');
      }

      // 3. Criar mensagem UMA vez só
      const tweetMessage = await createMonthlyReturnsMessage();

      // 4. Postar simultaneamente nas duas plataformas
      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        // TWITTER DESABILITADO TEMPORARIAMENTE
        /*
        (async () => {
          const mediaIds = await uploadMediaAndGetIds([{ path: imageUrl, mimeType: 'image/png' }]);
          return postTweet(tweetMessage, mediaIds);
        })(),
        */
        Promise.resolve({ id: 'disabled_' + Date.now(), text: tweetMessage }),
        postBlueSkyWithMedia(tweetMessage, imageUrl, 'Bitcoin Monthly Returns Heatmap'),
      ]);

      const results = {
        twitter: {
          success: twitterResponse.status === 'fulfilled',
          data: twitterResponse.status === 'fulfilled' ? twitterResponse.value : null,
          error: twitterResponse.status === 'rejected' ? twitterResponse.reason : null,
        },
        bluesky: {
          success: blueSkyResponse.status === 'fulfilled',
          data: blueSkyResponse.status === 'fulfilled' ? blueSkyResponse.value : null,
          error: blueSkyResponse.status === 'rejected' ? blueSkyResponse.reason : null,
        },
      };

      logger.info('Bitcoin Monthly Returns posted to both platforms', {
        twitter: results.twitter.success ? 'SUCCESS' : 'FAILED',
        bluesky: results.bluesky.success ? 'SUCCESS' : 'FAILED',
        imageUrl,
      });

      return results;
    } catch (error) {
      logger.error('Error in postMonthlyReturns', error);
      throw error;
    }
  }

  async runAllTasks() {
    const results = {
      unified: {},
      errors: [],
    };

    // Agora usa apenas as funções unificadas - cada uma faz 1 request e posta em ambas as plataformas
    const unifiedTasks = [
      {
        name: 'bitcoin1hPriceUpdate',
        method: () => this.postHourlyPriceUpdate(),
      },
      {
        name: 'bitcoin24hPriceUpdate',
        method: () => this.postDailyPriceUpdate(),
      },
      {
        name: 'fearGreedIndex',
        method: () => this.postFearGreedIndex(),
      },
      {
        name: 'bitcoinMonthlyReturns',
        method: () => this.postMonthlyReturns(),
      },
    ];

    for (const task of unifiedTasks) {
      try {
        logger.info(`Executing unified task: ${task.name} (posting to both platforms)`);
        const result = await task.method();
        results.unified[task.name] = { success: true, result };

        // Log individual platform results
        const twitterSuccess = result.twitter?.success || false;
        const blueSkySuccess = result.bluesky?.success || false;

        logger.info(`Unified task ${task.name} completed`, {
          twitter: twitterSuccess ? 'SUCCESS' : 'FAILED',
          bluesky: blueSkySuccess ? 'SUCCESS' : 'FAILED',
        });

        // Add any errors to the main errors array
        if (!twitterSuccess && result.twitter?.error) {
          results.errors.push({ task: `${task.name}_twitter`, error: result.twitter.error });
        }
        if (!blueSkySuccess && result.bluesky?.error) {
          results.errors.push({ task: `${task.name}_bluesky`, error: result.bluesky.error });
        }
      } catch (error) {
        logger.error(`Unified task ${task.name} failed`, error);
        results.unified[task.name] = { success: false, error: error.message };
        results.errors.push({ task: task.name, error: error.message });
      }
    }

    return results;
  }
}
