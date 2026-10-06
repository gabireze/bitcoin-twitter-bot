import axios from 'axios';
import * as dotenv from 'dotenv';
import { APIError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

dotenv.config();

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;
const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

const isRetryable = (error) =>
  error?.code === 'ECONNABORTED' ||
  !error?.response ||
  error.response.status === 429 ||
  error.response.status >= 500;

export const fetchPriceData = async (
  coinId,
  currency,
  { httpClient = axios, wait = sleep, maxAttempts = MAX_ATTEMPTS } = {},
) => {
  const endpoint = `${process.env.COINGECKO_API_URL}/coins/${coinId}/market_chart`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      logger.info('Fetching Bitcoin price data', { coinId, currency, attempt, maxAttempts });

      const response = await httpClient.get(endpoint, {
        params: { vs_currency: currency, days: 1, precision: 2 },
        timeout: 10000,
      });

      if (
        !response.data ||
        !response.data.prices ||
        !response.data.market_caps ||
        !response.data.total_volumes
      ) {
        throw new APIError('Invalid data structure from CoinGecko API', 'CoinGecko');
      }

      logger.info('Successfully fetched Bitcoin price data', { attempt });
      return response.data;
    } catch (error) {
      if (!(error instanceof APIError) && isRetryable(error) && attempt < maxAttempts) {
        const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        logger.warn('Retrying CoinGecko request after transient failure', {
          attempt,
          nextAttempt: attempt + 1,
          delayMs,
          statusCode: error?.response?.status || null,
          code: error?.code || null,
        });
        await wait(delayMs);
        continue;
      }

      if (error instanceof APIError) {
        throw error;
      }

      if (error.code === 'ECONNABORTED') {
        throw new APIError('Request timeout', 'CoinGecko', 408);
      }

      if (error.response) {
        const statusCode = error.response.status;
        const message = `HTTP ${statusCode}: ${error.response.statusText}`;
        throw new APIError(message, 'CoinGecko', statusCode);
      }

      if (error.request) {
        throw new APIError('No response received from API', 'CoinGecko', 503);
      }

      logger.error('Unexpected error fetching price data', error);
      throw new APIError('Unexpected error occurred', 'CoinGecko');
    }
  }

  throw new APIError('Retry attempts exhausted', 'CoinGecko', 503);
};
