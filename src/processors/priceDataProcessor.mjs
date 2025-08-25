import { calculatePercentageChange, formatCurrency } from '../utils/formatUtils.mjs';
import { ValidationError } from '../utils/errors.mjs';

const validateDataStructure = data => {
  if (!data) {
    throw new ValidationError('Data is null or undefined');
  }

  if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
    throw new ValidationError('Invalid or empty prices data');
  }

  if (!data.market_caps || !Array.isArray(data.market_caps) || data.market_caps.length === 0) {
    throw new ValidationError('Invalid or empty market caps data');
  }

  if (
    !data.total_volumes ||
    !Array.isArray(data.total_volumes) ||
    data.total_volumes.length === 0
  ) {
    throw new ValidationError('Invalid or empty total volumes data');
  }
};

const validatePriceData = (prices, index) => {
  if (index < 0 || index >= prices.length) {
    throw new ValidationError(`Invalid price data index: ${index}`);
  }

  const priceEntry = prices[index];
  if (!Array.isArray(priceEntry) || priceEntry.length < 2 || typeof priceEntry[1] !== 'number') {
    throw new ValidationError(`Invalid price entry at index ${index}`);
  }
};

export const getCurrentPrice = data => {
  validateDataStructure(data);
  const currentIndex = data.prices.length - 1;
  validatePriceData(data.prices, currentIndex);

  return formatCurrency(data.prices[currentIndex][1]);
};

export const getPriceChange1h = data => {
  validateDataStructure(data);

  const currentIndex = data.prices.length - 1;
  const oneHourAgoIndex = currentIndex - 12; // Assuming 5-minute intervals

  if (oneHourAgoIndex < 0) {
    throw new ValidationError('Insufficient data for 1-hour price change calculation');
  }

  validatePriceData(data.prices, currentIndex);
  validatePriceData(data.prices, oneHourAgoIndex);

  const currentPrice = data.prices[currentIndex][1];
  const oneHourAgoPrice = data.prices[oneHourAgoIndex][1];

  return calculatePercentageChange(currentPrice, oneHourAgoPrice).toFixed(2) + '%';
};

export const getPriceChange24h = data => {
  validateDataStructure(data);

  const currentIndex = data.prices.length - 1;
  validatePriceData(data.prices, currentIndex);
  validatePriceData(data.prices, 0);

  const currentPrice = data.prices[currentIndex][1];
  const startPrice = data.prices[0][1];

  return calculatePercentageChange(currentPrice, startPrice).toFixed(2) + '%';
};

export const getCurrentMarketCap = data => {
  validateDataStructure(data);
  const currentIndex = data.market_caps.length - 1;

  if (
    currentIndex < 0 ||
    !data.market_caps[currentIndex] ||
    typeof data.market_caps[currentIndex][1] !== 'number'
  ) {
    throw new ValidationError('Invalid market cap data');
  }

  return formatCurrency(data.market_caps[currentIndex][1]);
};

export const getMarketCapChange24h = data => {
  validateDataStructure(data);

  const currentIndex = data.market_caps.length - 1;

  if (currentIndex < 0 || !data.market_caps[currentIndex] || !data.market_caps[0]) {
    throw new ValidationError('Invalid market cap data for 24h calculation');
  }

  const currentMarketCap = data.market_caps[currentIndex][1];
  const startMarketCap = data.market_caps[0][1];

  return calculatePercentageChange(currentMarketCap, startMarketCap).toFixed(2) + '%';
};

export const getTotalVolume = data => {
  validateDataStructure(data);
  const currentIndex = data.total_volumes.length - 1;

  if (
    currentIndex < 0 ||
    !data.total_volumes[currentIndex] ||
    typeof data.total_volumes[currentIndex][1] !== 'number'
  ) {
    throw new ValidationError('Invalid volume data');
  }

  return formatCurrency(data.total_volumes[currentIndex][1]);
};

export const getTotalVolumeChange24h = data => {
  validateDataStructure(data);

  const currentIndex = data.total_volumes.length - 1;

  if (currentIndex < 0 || !data.total_volumes[currentIndex] || !data.total_volumes[0]) {
    throw new ValidationError('Invalid volume data for 24h calculation');
  }

  const currentVolume = data.total_volumes[currentIndex][1];
  const startVolume = data.total_volumes[0][1];

  return calculatePercentageChange(currentVolume, startVolume).toFixed(2) + '%';
};
