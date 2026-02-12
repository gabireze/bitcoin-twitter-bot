import { config, validateEnvironment } from '../config/config.mjs';
import { createFearGreedMessage } from '../messageTemplates/fearGreedMessages.mjs';
import { createMonthlyReturnsMessage } from '../messageTemplates/monthlyReturnsMessages.mjs';
import {
  createDailyPriceUpdate,
  createHourlyPriceUpdate,
} from '../messageTemplates/priceMessages.mjs';
import { createDonationReminderMessage } from '../messageTemplates/donationMessages.mjs';
import { captureMonthlyReturnsChart } from '../processors/screenshotProcessor.mjs';
import { fetchPriceData } from '../services/bitcoinDataService.mjs';
import { postBlueSkyWithMedia, postBlueSkyWithoutMedia } from '../services/blueskyService.mjs';
import { getFearGreedIndex } from '../services/fearGreedIndexService.mjs';
import { downloadAndSaveImage, saveImageLocally } from '../services/localImageService.mjs';
import { ValidationError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

export class BotController {
  constructor() {
    validateEnvironment();
  }

  async postHourlyPriceUpdate() {
    try {
      logger.info('Starting Bitcoin 1h price update (UNIFIED - BOTH PLATFORMS)');

      const response = await fetchPriceData(config.bitcoin.coinId, config.bitcoin.currency);

      if (!response) {
        throw new ValidationError('No data returned from the fetchPriceData function');
      }

      const summaryMessage = createHourlyPriceUpdate(response);

      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
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

      const priceData = await fetchPriceData(config.bitcoin.coinId, config.bitcoin.currency);

      if (!priceData) {
        throw new ValidationError('Failed to fetch Bitcoin price data or received empty response');
      }

      const summaryMessage = createDailyPriceUpdate(priceData);

      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
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

      const fearGreedIndexData = await getFearGreedIndex();
      if (!fearGreedIndexData?.data?.length) {
        throw new ValidationError('Invalid or empty Fear & Greed Index data received');
      }

      const fearGreedIndexMessage = createFearGreedMessage(fearGreedIndexData);
      const indexValue = fearGreedIndexData.data[0].value;
      const classification = fearGreedIndexData.data[0].value_classification;

      const imageResult = await downloadAndSaveImage(
        config.images.fearGreedIndexUrl,
        'fearGreedIndex.png'
      );

      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        Promise.resolve({ id: 'disabled_' + Date.now(), text: fearGreedIndexMessage }),
        postBlueSkyWithMedia(
          fearGreedIndexMessage,
          imageResult.localPath,
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

      const screenshotBuffer = await captureMonthlyReturnsChart();
      if (!screenshotBuffer) {
        throw new ValidationError('Failed to capture Bitcoin Monthly Returns screenshot');
      }

      const imageResult = await saveImageLocally(
        screenshotBuffer,
        config.images.bitcoinMonthlyReturnsPath
      );
      if (!imageResult) {
        throw new ValidationError('Failed to save Bitcoin Monthly Returns screenshot');
      }

      const tweetMessage = await createMonthlyReturnsMessage();

      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        Promise.resolve({ id: 'disabled_' + Date.now(), text: tweetMessage }),
        postBlueSkyWithMedia(tweetMessage, imageResult.localPath, 'Bitcoin Monthly Returns Heatmap'),
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
        imageUrl: imageResult.publicUrl,
      });

      return results;
    } catch (error) {
      logger.error('Error in postMonthlyReturns', error);
      throw error;
    }
  }

  async postDonationReminder() {
    try {
      const { donations } = config;

      if (!donations.enabled) {
        logger.info('Donation reminder is disabled via configuration. Skipping post.');
        return {
          twitter: { success: false, data: null, error: 'disabled' },
          bluesky: { success: false, data: null, error: 'disabled' },
        };
      }

      if (!donations.onchainAddress || !donations.lightningAddress) {
        throw new ValidationError(
          'Donation addresses are not properly configured. Please set DONATION_ONCHAIN_ADDRESS and DONATION_LIGHTNING_ADDRESS in the environment.'
        );
      }

      logger.info('Starting donation reminder post to ALL platforms (optimized)');

      const summaryMessage = createDonationReminderMessage(
        donations.onchainAddress,
        donations.lightningAddress,
        donations.intervalDays
      );

      const [twitterResponse, blueSkyResponse] = await Promise.allSettled([
        // Twitter remains disabled: stubbed response only
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

      logger.info('Donation reminder posted', {
        twitter: results.twitter.success ? 'SUCCESS' : 'FAILED',
        bluesky: results.bluesky.success ? 'SUCCESS' : 'FAILED',
        message: summaryMessage,
      });

      return results;
    } catch (error) {
      logger.error('Error in postDonationReminder', error);
      throw error;
    }
  }

  async runAllTasks() {
    const results = {
      unified: {},
      errors: [],
    };

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
      {
        name: 'donationReminder',
        method: () => this.postDonationReminder(),
      },
    ];

    for (const task of unifiedTasks) {
      try {
        logger.info(`Executing unified task: ${task.name} (posting to both platforms)`);
        const result = await task.method();
        results.unified[task.name] = { success: true, result };

        const twitterSuccess = result.twitter?.success || false;
        const blueSkySuccess = result.bluesky?.success || false;

        logger.info(`Unified task ${task.name} completed`, {
          twitter: twitterSuccess ? 'SUCCESS' : 'FAILED',
          bluesky: blueSkySuccess ? 'SUCCESS' : 'FAILED',
        });
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
