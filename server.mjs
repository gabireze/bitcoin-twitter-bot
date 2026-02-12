import express from 'express';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { BotController } from './src/controllers/botController.mjs';
import { logger } from './src/utils/logger.mjs';
import { AppError } from './src/utils/errors.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Escutar em todas as interfaces para compatibilidade com nginx
app.use(express.json());
app.use('/images', express.static('./public/images'));
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
const bot = new BotController();
const actionMap = {
  tweetFearGreedIndexTweet: () => bot.postFearGreedIndex(),
  postBlueSkyFearGreedIndexTweet: () => bot.postFearGreedIndex(),
  postFearGreedIndexToAll: () => bot.postFearGreedIndex(),
  tweetBitcoinMonthlyReturns: () => bot.postMonthlyReturns(),
  postBlueSkyBitcoinMonthlyReturns: () => bot.postMonthlyReturns(),
  postBitcoinMonthlyReturnsToAll: () => bot.postMonthlyReturns(),
  tweetBitcoin1hPriceUpdate: () => bot.postHourlyPriceUpdate(),
  postBlueSkyBitcoin1hPriceUpdate: () => bot.postHourlyPriceUpdate(),
  postBitcoin1hPriceUpdateToAll: () => bot.postHourlyPriceUpdate(),
  tweetBitcoin24hPriceUpdate: () => bot.postDailyPriceUpdate(),
  postBlueSkyBitcoin24hPriceUpdate: () => bot.postDailyPriceUpdate(),
  postBitcoin24hPriceUpdateToAll: () => bot.postDailyPriceUpdate(),
  postDonationReminderToAll: () => bot.postDonationReminder(),
  allUnifiedTasks: async () => {
    const results = {};
    try {
      results.bitcoin1h = await bot.postHourlyPriceUpdate();
      results.bitcoin24h = await bot.postDailyPriceUpdate();
      results.fearGreed = await bot.postFearGreedIndex();
      results.monthlyReturns = await bot.postMonthlyReturns();
    } catch (error) {
      logger.error('Error in allUnifiedTasks', error);
      throw error;
    }
    return results;
  },
};
app.post('/execute/:action', async (req, res) => {
  const { action } = req.params;

  try {
    logger.info('Manual action triggered', { action, ip: req.ip });

    const selectedAction = actionMap[action];
    if (!selectedAction) {
      logger.error('Unknown action provided', { action, availableActions: Object.keys(actionMap) });
      throw new AppError(`Unknown action: ${action}`, 400);
    }

    const result = await selectedAction();

    logger.info('Action completed successfully', { action });
    res.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Action execution error', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      action,
      timestamp: new Date().toISOString(),
    });
  }
});
app.post('/execute-all', async (req, res) => {
  try {
    logger.info('Execute all tasks triggered', { ip: req.ip });

    const results = await bot.runAllTasks();

    const successCount = Object.values(results.unified || {}).filter(r => r.success).length;
    const totalTasks = Object.keys(results.unified || {}).length;

    logger.info('All tasks execution completed', {
      successCount,
      totalTasks,
      errorCount: results.errors.length,
    });

    res.json({
      success: true,
      results,
      summary: {
        successCount,
        totalTasks,
        errorCount: results.errors.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Execute all tasks error', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
app.get('/actions', (req, res) => {
  res.json({
    availableActions: Object.keys(actionMap),
    description: 'Use POST /execute/:action to run any of these actions',
    timestamp: new Date().toISOString(),
  });
});
function setupCronJobs() {
  logger.info('Setting up internal cron jobs with node-cron...');
  cron.schedule(
    '0 * * * *',
    async () => {
      try {
        logger.info('🕐 Cron job triggered: hourly price update');
        await bot.postHourlyPriceUpdate();
        logger.info('✅ Hourly price update completed successfully');
      } catch (error) {
        logger.error('❌ Hourly cron job failed', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );

  // Daily check for donation reminder (runs once per day, respects interval in days)
  cron.schedule(
    '5 0 * * *',
    async () => {
      try {
        const { donations } = config;

        if (!donations.enabled) {
          logger.info(
            '🙏 Donation reminder cron is disabled via DONATION_ENABLED. Skipping for today.'
          );
          return;
        }

        const now = new Date();
        const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
        const interval = donations.intervalDays || 7;

        if (daysSinceEpoch % interval !== 0) {
          logger.info(
            `🙏 Not a scheduled donation reminder day (interval=${interval} days, daysSinceEpoch=${daysSinceEpoch}). Skipping.`
          );
          return;
        }

        logger.info('🙏 Cron job triggered: donation reminder');
        await bot.postDonationReminder();
        logger.info('✅ Donation reminder completed successfully');
      } catch (error) {
        logger.error('❌ Donation reminder cron job failed', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );
  cron.schedule(
    '0 */12 * * *',
    async () => {
      try {
        logger.info('🕛 Cron job triggered: daily price update');
        await bot.postDailyPriceUpdate();
        logger.info('✅ Daily price update completed successfully');
      } catch (error) {
        logger.error('❌ Daily cron job failed', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );
  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        logger.info('🌙 Cron job triggered: fear greed index');
        await bot.postFearGreedIndex();
        logger.info('✅ Fear & Greed index completed successfully');
      } catch (error) {
        logger.error('❌ Fear greed cron job failed', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );
  cron.schedule(
    '0 12 28-31 * *',
    async () => {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        if (tomorrow.getMonth() !== today.getMonth()) {
          logger.info('📅 Cron job triggered: monthly returns (last day of month)');
          await bot.postMonthlyReturns();
          logger.info('✅ Monthly returns completed successfully');
        } else {
          logger.info('📆 Not the last day of month, skipping monthly returns');
        }
      } catch (error) {
        logger.error('❌ Monthly returns cron job failed', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );

  logger.info('🎯 Cron jobs configured successfully:');
  logger.info('  • Hourly (0 * * * *): Bitcoin 1h Price Update');
  logger.info('  • Every 12h (0 */12 * * *): Bitcoin 24h Price Update');
  logger.info('  • Daily at 00:00 (0 0 * * *): Fear & Greed Index');
  logger.info('  • Last day of month at 12:00 (0 12 28-31 * *): Monthly Returns');
  logger.info(
    '  • Daily at 00:05 (5 0 * * *): Donation reminder (runs every N days based on DONATION_INTERVAL_DAYS)'
  );
  logger.info('  • All times in UTC timezone');
}
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
const server = app.listen(PORT, HOST, () => {
  logger.info(`Bitcoin Bot Server started on ${HOST}:${PORT} (all interfaces)`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Available actions: http://localhost:${PORT}/actions`);
  logger.info('🔒 Server accessible via nginx proxy (firewalled externally)');
  setupCronJobs();
});

export default app;
