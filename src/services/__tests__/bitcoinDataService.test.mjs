import { jest } from '@jest/globals';
import axios from 'axios';
import { fetchPriceData } from '../bitcoinDataService.mjs';
import { APIError } from '../../utils/errors.mjs';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('bitcoinDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  });

  describe('fetchPriceData', () => {
    it('should fetch Bitcoin price data successfully', async () => {
      const mockData = {
        prices: [[1640995200000, 47000.12]],
        market_caps: [[1640995200000, 890000000000]],
        total_volumes: [[1640995200000, 25000000000]]
      };

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await fetchPriceData('bitcoin', 'usd');

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: { vs_currency: 'usd', days: 1, precision: 2 },
          timeout: 10000
        }
      );
    });

    it('should throw APIError when API returns invalid data structure', async () => {
      const invalidData = { invalid: 'structure' };
      mockedAxios.get.mockResolvedValue({ data: invalidData });

      await expect(fetchPriceData('bitcoin', 'usd')).rejects.toThrow(APIError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(fetchPriceData('bitcoin', 'usd')).rejects.toThrow('Request timeout');
    });

    it('should handle HTTP errors', async () => {
      const httpError = new Error('HTTP error');
      httpError.response = { status: 404, statusText: 'Not Found' };
      mockedAxios.get.mockRejectedValue(httpError);

      await expect(fetchPriceData('bitcoin', 'usd')).rejects.toThrow('HTTP 404: Not Found');
    });
  });
});
