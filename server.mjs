import express from 'express';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { BotController } from './src/controllers/botController.mjs';
import { logger } from './src/utils/logger.mjs';
import { AppError } from './src/utils/errors.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost'; // Apenas localhost por padrão

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Bot controller instance
const bot = new BotController();

// Action mapping - mesmas ações que eram usadas no Lambda
const actionMap = {
  // Fear & Greed Index (com imagem)
  tweetFearGreedIndexTweet: () => bot.postFearGreedIndex(),
  postBlueSkyFearGreedIndexTweet: () => bot.postFearGreedIndex(),
  postFearGreedIndexToAll: () => bot.postFearGreedIndex(),

  // Bitcoin Monthly Returns (com screenshot)
  tweetBitcoinMonthlyReturns: () => bot.postMonthlyReturns(),
  postBlueSkyBitcoinMonthlyReturns: () => bot.postMonthlyReturns(),
  postBitcoinMonthlyReturnsToAll: () => bot.postMonthlyReturns(),

  // Bitcoin 1h Price Update (texto simples)
  tweetBitcoin1hPriceUpdate: () => bot.postHourlyPriceUpdate(),
  postBlueSkyBitcoin1hPriceUpdate: () => bot.postHourlyPriceUpdate(),
  postBitcoin1hPriceUpdateToAll: () => bot.postHourlyPriceUpdate(),

  // Bitcoin 24h Price Update (texto simples)
  tweetBitcoin24hPriceUpdate: () => bot.postDailyPriceUpdate(),
  postBlueSkyBitcoin24hPriceUpdate: () => bot.postDailyPriceUpdate(),
  postBitcoin24hPriceUpdateToAll: () => bot.postDailyPriceUpdate(),

  // Todas as tarefas
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

// Generic endpoint to execute any action
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

// Endpoint para executar todas as tarefas
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

// Lista todas as ações disponíveis
app.get('/actions', (req, res) => {
  res.json({
    availableActions: Object.keys(actionMap),
    description: 'Use POST /execute/:action to run any of these actions',
    timestamp: new Date().toISOString(),
  });
});

// Configuração dos cron jobs
function setupCronJobs() {
  logger.info('Setting up internal cron jobs with node-cron...');

  // A cada hora (no minuto 0) - Bitcoin 1h Price Update
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

  // A cada 12 horas (00:00 e 12:00 UTC) - Bitcoin 24h Price Update
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

  // A cada 24 horas (às 00:00 UTC) - Fear & Greed Index
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

  // Último dia do mês às 12:00 UTC - Monthly Returns
  cron.schedule(
    '0 12 28-31 * *',
    async () => {
      try {
        // Verificar se é realmente o último dia do mês
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Se o mês de amanhã for diferente do mês de hoje, é o último dia do mês
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
  logger.info('  • All times in UTC timezone');
}

// Graceful shutdown
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

// Start server - APENAS localhost para segurança
const server = app.listen(PORT, HOST, () => {
  logger.info(`Bitcoin Bot Server started on ${HOST}:${PORT} (localhost only)`);
  logger.info(`Health check: http://${HOST}:${PORT}/health`);
  logger.info(`Available actions: http://${HOST}:${PORT}/actions`);
  logger.info('🔒 Server is only accessible from localhost for security');

  // Setup cron jobs after server starts
  setupCronJobs();
});

export default app;
