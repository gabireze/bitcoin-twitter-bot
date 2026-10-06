import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchPriceData } from '../src/services/bitcoinDataService.mjs';

const validResponse = {
  data: {
    prices: [[1, 2]],
    market_caps: [[1, 3]],
    total_volumes: [[1, 4]],
  },
};

test('retries a transient timeout and returns the recovered response', async () => {
  const calls = [];
  const delays = [];
  const httpClient = {
    async get() {
      calls.push(true);
      if (calls.length === 1) {
        const error = new Error('timeout');
        error.code = 'ECONNABORTED';
        throw error;
      }
      return validResponse;
    },
  };

  const result = await fetchPriceData('bitcoin', 'usd', {
    httpClient,
    wait: async (delayMs) => delays.push(delayMs),
  });

  assert.equal(calls.length, 2);
  assert.deepEqual(delays, [1000]);
  assert.deepEqual(result, validResponse.data);
});

test('does not retry a client error other than rate limiting', async () => {
  let calls = 0;
  const httpClient = {
    async get() {
      calls += 1;
      const error = new Error('bad request');
      error.response = { status: 400, statusText: 'Bad Request' };
      throw error;
    },
  };

  await assert.rejects(
    fetchPriceData('bitcoin', 'usd', { httpClient, wait: async () => {} }),
    /CoinGecko API Error: HTTP 400: Bad Request/,
  );
  assert.equal(calls, 1);
});
