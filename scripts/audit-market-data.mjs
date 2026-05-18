import { fetchPriceData } from '../src/services/bitcoinDataService.mjs';
import { getFearGreedIndex } from '../src/services/fearGreedIndexService.mjs';
import {
  getCurrentMarketCap,
  getCurrentPrice,
  getMarketCapChange24h,
  getPriceChange1h,
  getPriceChange24h,
  getTotalVolume,
  getTotalVolumeChange24h,
} from '../src/processors/priceDataProcessor.mjs';
import { config } from '../src/config/config.mjs';

const asIso = timestamp => new Date(timestamp).toISOString();
const minutesBetween = (later, earlier) => Math.round((later - earlier) / 60000);

const logSection = (title, payload) => {
  console.log(`\n[${title}]`);
  console.log(JSON.stringify(payload, null, 2));
};

const getClosestPoint = (series, targetTimestamp) => {
  let closestPoint = series[0];
  let smallestDifference = Math.abs(series[0][0] - targetTimestamp);

  for (const point of series) {
    const difference = Math.abs(point[0] - targetTimestamp);
    if (difference < smallestDifference) {
      closestPoint = point;
      smallestDifference = difference;
    }
  }

  return closestPoint;
};

const auditPriceData = async () => {
  const data = await fetchPriceData(config.bitcoin.coinId, config.bitcoin.currency);
  const currentIndex = data.prices.length - 1;
  const firstPricePoint = data.prices[0];
  const currentPricePoint = data.prices[currentIndex];
  const oneHourAgoPoint = getClosestPoint(data.prices, currentPricePoint[0] - 60 * 60 * 1000);
  const oneDayAgoPoint = getClosestPoint(data.prices, currentPricePoint[0] - 24 * 60 * 60 * 1000);
  const firstMarketCapPoint = data.market_caps[0];
  const currentMarketCapPoint = data.market_caps[data.market_caps.length - 1];
  const oneDayAgoMarketCapPoint = getClosestPoint(
    data.market_caps,
    currentMarketCapPoint[0] - 24 * 60 * 60 * 1000
  );
  const firstVolumePoint = data.total_volumes[0];
  const currentVolumePoint = data.total_volumes[data.total_volumes.length - 1];
  const oneDayAgoVolumePoint = getClosestPoint(
    data.total_volumes,
    currentVolumePoint[0] - 24 * 60 * 60 * 1000
  );

  logSection('coinGecko-window', {
    endpoint: `${config.apis.coingecko}/coins/${config.bitcoin.coinId}/market_chart`,
    currency: config.bitcoin.currency,
    points: data.prices.length,
    firstPointAt: asIso(firstPricePoint[0]),
    lastPointAt: asIso(currentPricePoint[0]),
    totalMinutesCovered: minutesBetween(currentPricePoint[0], firstPricePoint[0]),
    oneHourLogicPointAt: asIso(oneHourAgoPoint[0]),
    oneHourLogicMinutesBack: minutesBetween(currentPricePoint[0], oneHourAgoPoint[0]),
    twentyFourHourLogicPointAt: asIso(oneDayAgoPoint[0]),
    twentyFourHourLogicMinutesBack: minutesBetween(currentPricePoint[0], oneDayAgoPoint[0]),
  });

  logSection('price-summary', {
    currentPriceRaw: currentPricePoint[1],
    oneHourAgoPriceRaw: oneHourAgoPoint[1],
    twentyFourHourReferencePriceRaw: oneDayAgoPoint[1],
    dayStartPriceRaw: firstPricePoint[1],
    formattedCurrentPrice: getCurrentPrice(data, config.bitcoin.currency),
    formattedChange1h: getPriceChange1h(data),
    formattedChange24h: getPriceChange24h(data),
  });

  logSection('market-cap-summary', {
    currentMarketCapRaw: currentMarketCapPoint[1],
    twentyFourHourReferenceMarketCapRaw: oneDayAgoMarketCapPoint[1],
    dayStartMarketCapRaw: firstMarketCapPoint[1],
    formattedCurrentMarketCap: getCurrentMarketCap(data, config.bitcoin.currency),
    formattedChange24h: getMarketCapChange24h(data),
  });

  logSection('volume-summary', {
    currentVolumeRaw: currentVolumePoint[1],
    twentyFourHourReferenceVolumeRaw: oneDayAgoVolumePoint[1],
    dayStartVolumeRaw: firstVolumePoint[1],
    formattedCurrentVolume: getTotalVolume(data, config.bitcoin.currency),
    formattedChange24h: getTotalVolumeChange24h(data),
  });
};

const auditFearGreed = async () => {
  const data = await getFearGreedIndex();
  const latest = data.data?.[0];

  logSection('fear-greed-summary', {
    endpoint: 'https://api.alternative.me/fng/',
    value: latest?.value,
    classification: latest?.value_classification,
    timestamp: latest?.timestamp,
    timeUntilUpdate: latest?.time_until_update ?? null,
  });
};

try {
  await auditPriceData();
  await auditFearGreed();
} catch (error) {
  console.error('\n[audit-error]');
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
