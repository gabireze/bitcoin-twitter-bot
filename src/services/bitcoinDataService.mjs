import axios from 'axios';
import * as dotenv from 'dotenv';
import { APIError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

dotenv.config();

export const fetchPriceData = async (coinId, currency) => {
  const endpoint = `${process.env.COINGECKO_API_URL}/coins/${coinId}/market_chart`;

  try {
    logger.info('Fetching Bitcoin price data', { coinId, currency });

    const response = await axios.get(endpoint, {
      params: { vs_currency: currency, days: 1, precision: 2 },
      timeout: 10000, // 10 seconds timeout
    });

    if (
      !response.data ||
      !response.data.prices ||
      !response.data.market_caps ||
      !response.data.total_volumes
    ) {
      throw new APIError('Invalid data structure from CoinGecko API', 'CoinGecko');
    }

    logger.info('Successfully fetched Bitcoin price data');
    return response.data;
  } catch (error) {
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
};
