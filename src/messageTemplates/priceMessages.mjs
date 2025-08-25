import {
  getCurrentMarketCap,
  getCurrentPrice,
  getMarketCapChange24h,
  getPriceChange1h,
  getPriceChange24h,
  getTotalVolume,
  getTotalVolumeChange24h,
} from '../processors/priceDataProcessor.mjs';
import { formatDate } from '../utils/formatUtils.mjs';

export const createBitcoinSection = date => {
  return `#Bitcoin 24h Update - ${formatDate(date)}\n\n`;
};

export const createPriceSection = data => {
  const currentPrice = getCurrentPrice(data);
  const priceChange1h = getPriceChange1h(data);
  const priceChange24h = getPriceChange24h(data);
  return `💰 Current Price:\n${currentPrice} (1h: ${priceChange1h}, 24h: ${priceChange24h})\n\n`;
};

export const createMarketCapSection = data => {
  const marketCap = getCurrentMarketCap(data);
  const marketCapChange24h = getMarketCapChange24h(data);
  return `💵 Market Cap:\n${marketCap} (24h Change: ${marketCapChange24h})\n\n`;
};

export const createVolumeSection = data => {
  const totalVolume = getTotalVolume(data);
  const volumeChange24h = getTotalVolumeChange24h(data);
  return `📊 Volume:\n${totalVolume} (24h Change: ${volumeChange24h})`;
};

export const createDailyPriceUpdate = data => {
  const today = new Date();
  const bitcoinSection = createBitcoinSection(today);
  const priceSection = createPriceSection(data);
  const marketCapSection = createMarketCapSection(data);
  const volumeSection = createVolumeSection(data);

  return bitcoinSection + priceSection + marketCapSection + volumeSection;
};

export const createHourlyPriceUpdate = data => {
  const currentPrice = getCurrentPrice(data);
  const priceChange1h = getPriceChange1h(data);
  return `#Bitcoin is currently trading at:\n💰 ${currentPrice} (${priceChange1h} in the last 1h)`;
};
