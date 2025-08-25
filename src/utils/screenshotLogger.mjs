import { logger } from '../utils/logger.mjs';

/**
 * Helper functions para Puppeteer com logging estruturado
 */

export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logError = (message, error = null) => {
  logger.error(message, error);
};

export const logProgress = (step, total, message) => {
  logger.info('Screenshot progress', {
    step,
    total,
    message,
    progress: `${step}/${total}`
  });
};

export const logScreenshotEvent = (event, details = {}) => {
  logger.info('Screenshot event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};
