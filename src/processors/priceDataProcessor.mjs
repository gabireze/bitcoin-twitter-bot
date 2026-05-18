import { ValidationError } from '../utils/errors.mjs';
import { calculatePercentageChange, formatCurrency } from '../utils/formatUtils.mjs';

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

const getClosestPointIndex = (series, targetTimestamp) => {
  if (!Array.isArray(series) || series.length === 0) {
    throw new ValidationError('Invalid or empty series data');
  }

  let closestIndex = 0;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 0; index < series.length; index += 1) {
    const point = series[index];
    if (!Array.isArray(point) || typeof point[0] !== 'number') {
      throw new ValidationError(`Invalid timestamp entry at index ${index}`);
    }

    const difference = Math.abs(point[0] - targetTimestamp);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  }

  return closestIndex;
};

const getReferencePoint = (series, currentIndex, lookbackMs) => {
  const currentPoint = series[currentIndex];
  if (!Array.isArray(currentPoint) || typeof currentPoint[0] !== 'number') {
    throw new ValidationError(`Invalid current point at index ${currentIndex}`);
  }

  const targetTimestamp = currentPoint[0] - lookbackMs;
  const referenceIndex = getClosestPointIndex(series, targetTimestamp);
  return { referenceIndex, targetTimestamp };
};

export const getCurrentPrice = (data, currency = 'USD') => {
  validateDataStructure(data);
  const currentIndex = data.prices.length - 1;
  validatePriceData(data.prices, currentIndex);

  return formatCurrency(data.prices[currentIndex][1], currency);
};

export const getPriceChange1h = data => {
  validateDataStructure(data);

  const currentIndex = data.prices.length - 1;
  const oneHourAgoIndex = getReferencePoint(data.prices, currentIndex, 60 * 60 * 1000).referenceIndex;

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
  const startIndex = getReferencePoint(data.prices, currentIndex, 24 * 60 * 60 * 1000).referenceIndex;
  validatePriceData(data.prices, currentIndex);
  validatePriceData(data.prices, startIndex);

  const currentPrice = data.prices[currentIndex][1];
  const startPrice = data.prices[startIndex][1];

  return calculatePercentageChange(currentPrice, startPrice).toFixed(2) + '%';
};

export const getCurrentMarketCap = (data, currency = 'USD') => {
  validateDataStructure(data);
  const currentIndex = data.market_caps.length - 1;

  if (
    currentIndex < 0 ||
    !data.market_caps[currentIndex] ||
    typeof data.market_caps[currentIndex][1] !== 'number'
  ) {
    throw new ValidationError('Invalid market cap data');
  }

  return formatCurrency(data.market_caps[currentIndex][1], currency);
};

export const getMarketCapChange24h = data => {
  validateDataStructure(data);

  const currentIndex = data.market_caps.length - 1;
  const startIndex = getReferencePoint(data.market_caps, currentIndex, 24 * 60 * 60 * 1000).referenceIndex;

  if (currentIndex < 0 || !data.market_caps[currentIndex] || !data.market_caps[startIndex]) {
    throw new ValidationError('Invalid market cap data for 24h calculation');
  }

  const currentMarketCap = data.market_caps[currentIndex][1];
  const startMarketCap = data.market_caps[startIndex][1];

  return calculatePercentageChange(currentMarketCap, startMarketCap).toFixed(2) + '%';
};

export const getTotalVolume = (data, currency = 'USD') => {
  validateDataStructure(data);
  const currentIndex = data.total_volumes.length - 1;

  if (
    currentIndex < 0 ||
    !data.total_volumes[currentIndex] ||
    typeof data.total_volumes[currentIndex][1] !== 'number'
  ) {
    throw new ValidationError('Invalid volume data');
  }

  return formatCurrency(data.total_volumes[currentIndex][1], currency);
};

export const getTotalVolumeChange24h = data => {
  validateDataStructure(data);

  const currentIndex = data.total_volumes.length - 1;
  const startIndex = getReferencePoint(data.total_volumes, currentIndex, 24 * 60 * 60 * 1000).referenceIndex;

  if (
    currentIndex < 0 ||
    !data.total_volumes[currentIndex] ||
    !data.total_volumes[startIndex]
  ) {
    throw new ValidationError('Invalid volume data for 24h calculation');
  }

  const currentVolume = data.total_volumes[currentIndex][1];
  const startVolume = data.total_volumes[startIndex][1];

  return calculatePercentageChange(currentVolume, startVolume).toFixed(2) + '%';
};
