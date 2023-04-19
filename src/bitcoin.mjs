import axios from "axios";

export const getPriceData = async (coingeckoApiUrl, coinId, currency) => {
  try {
    const response = await axios.get(`${coingeckoApiUrl}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: currency,
        days: 1,
      },
    });

    const data = response.data;
    const currentPrice = data.prices.slice(-1)[0][1];
    const priceChange1h = (((currentPrice - data.prices[data.prices.length - 13][1]) / currentPrice) * 100).toFixed(2);
    const priceChange24h = (((currentPrice - data.prices[0][1]) / data.prices[0][1]) * 100).toFixed(2);
    const marketCap = data.market_caps.slice(-1)[0][1];
    const marketCapChange24h = (((marketCap - data.market_caps[0][1]) / data.market_caps[0][1]) * 100).toFixed(2);
    const totalVolume = data.total_volumes.slice(-1)[0][1];
    const totalVolumeChange24h = (((totalVolume - data.total_volumes[0][1]) / data.total_volumes[0][1]) * 100).toFixed(2);

    return {
      currentPrice,
      priceChange1h,
      priceChange24h,
      marketCap,
      marketCapChange24h,
      totalVolume,
      totalVolumeChange24h,
    };
  } catch (error) {
    console.error(error);
  }
};

export const getBitcoin24hPriceMessage = async (priceData) => {
  const priceMessage = `🚀 #Bitcoin is currently trading at:\n💰 ${priceData.currentPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
    priceData.priceChange1h
  }% in the last 1h)\n\n`;

  const priceChange24hMessage = `📈 24h change:\n${priceData.priceChange24h > 0 ? `+${priceData.priceChange24h}` : priceData.priceChange24h}% ${
    priceData.priceChange24h > 0 ? "↑" : "↓"
  }\n\n`;

  const marketCapMessage = `💵 Market cap:\n${priceData.marketCap.toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
    priceData.marketCapChange24h
  }% in the last 24h) \n\n`;

  const totalVolumeChange24hMessage = `📊 24h volume:\n${priceData.totalVolume.toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
    priceData.totalVolumeChange24h
  }% in the last 24h)`;

  const message = priceMessage + priceChange24hMessage + marketCapMessage + totalVolumeChange24hMessage;

  return message;
};

export const getBitcoin1hPriceMessage = async (priceData) => {
  const message = `🚀 #Bitcoin is currently trading at:\n💰 ${priceData.currentPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
    priceData.priceChange1h
  }% in the last 1h)`;

  return message;
};
