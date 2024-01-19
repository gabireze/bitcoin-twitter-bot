import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const fetchPriceData = async (coinId, currency) => {
  const endpoint = `${process.env.COINGECKO_API_URL}/coins/${coinId}/market_chart`;
  try {
    const response = await axios.get(endpoint, {
      params: { vs_currency: currency, days: 1, precision: 2 },
    });
    return response.data;
  } catch (error) {
    return { message: "Error fetching price data", error: error };
  }
};
