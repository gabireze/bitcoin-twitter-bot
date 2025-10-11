import * as dotenv from 'dotenv';
import { BotController } from './src/controllers/botController.mjs';
import { logger } from './src/utils/logger.mjs';
import { AppError } from './src/utils/errors.mjs';

dotenv.config();

const main = async () => {
  try {
    logger.info('Bitcoin Twitter & BlueSky Bot started');

    const bot = new BotController();
    const results = await bot.runAllTasks();

    // Log summary
    const successCount = Object.values(results.unified || {}).filter(r => r.success).length;
    const totalTasks = Object.keys(results.unified || {}).length;

    logger.info('Bot execution completed', {
      successCount,
      totalTasks,
      errorCount: results.errors.length,
      errors: results.errors,
      note: 'Each task now posts to both Twitter and BlueSky simultaneously',
    });

    if (results.errors.length > 0) {
      logger.warn(`${results.errors.length} tasks failed during execution`);
    }

    return results;
  } catch (error) {
    logger.error('Fatal error in main execution', error);
    process.exit(1);
  }
};

// Application handler (compatível com diferentes ambientes)
export const handler = async (event, context) => {
  try {
    logger.info('Application handler invoked', {
      event,
      context: context?.functionName || 'standalone',
    });

    const bot = new BotController();
    const action = event.action || event.detail?.action;

    // Se não tem action específica, executa todas as tarefas
    if (!action) {
      logger.info('No specific action provided, running all tasks');
      return await bot.runAllTasks();
    }

    // Mapeamento das ações - TODAS agora postam em ambas as plataformas simultaneamente
    const actionMap = {
      // ===== AÇÕES UNIFICADAS (UMA REQUEST, AMBAS AS PLATAFORMAS) =====

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

      // ===== AÇÕES COMBINADAS (OPCIONAIS) =====
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

    const selectedAction = actionMap[action];
    if (!selectedAction) {
      logger.error('Unknown action provided', { action, availableActions: Object.keys(actionMap) });
      throw new AppError(`Unknown action: ${action}`, 400);
    }

    logger.info('Executing specific action', { action });
    const result = await selectedAction();

    logger.info('Action completed successfully', { action });
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    logger.error('Handler error', error);

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        action: event.action,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

// Execução direta (desenvolvimento local)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
