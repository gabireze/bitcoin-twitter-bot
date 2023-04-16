// Import required modules
import axios from "axios"; // Used for making HTTP requests
import { TwitterApi } from "twitter-api-v2"; // Used for posting tweets
import * as dotenv from "dotenv"; // Used for loading environment variables

// Set API URL, currency, and coin ID
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
const CURRENCY = "usd";
const COIN_ID = "bitcoin";

// Load environment variables from .env file
dotenv.config();

// Initialize a new instance of Twitter API client using app key, app secret, access token, and access secret
const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// Async function to post a tweet
async function postTweet() {
  try {
    // Get price data from CoinGecko API
    const message = await getPriceData();

    // Post tweet using Twitter API
    const tweet = await twitterClient.v2.tweet({ text: message });

    // Log successful tweet post
    console.log(`Successfully posted tweet: ${JSON.stringify(tweet.data, null, 2)}`);
  } catch (error) {
    // Log error if tweet post fails
    console.error(error);
  }
}

// Async function to get price data from CoinGecko API
const getPriceData = async () => {
  try {
    // Make GET request to CoinGecko API to get market chart data for the past day
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${COIN_ID}/market_chart`, {
      params: {
        vs_currency: CURRENCY,
        days: 1,
      },
    });

    // Extract relevant data from API response
    const data = response.data;
    const currentPrice = data.prices.slice(-1)[0][1];
    const priceChange1h = (((currentPrice - data.prices[data.prices.length - 13][1]) / currentPrice) * 100).toFixed(2);
    const priceChange24h = (((currentPrice - data.prices[0][1]) / data.prices[0][1]) * 100).toFixed(2);
    const marketCap = data.market_caps.slice(-1)[0][1];
    const marketCapChange24h = (((marketCap - data.market_caps[0][1]) / data.market_caps[0][1]) * 100).toFixed(2);
    const totalVolume = data.total_volumes.slice(-1)[0][1];
    const totalVolumeChange24h = (((totalVolume - data.total_volumes[0][1]) / data.total_volumes[0][1]) * 100).toFixed(2);

    // Format message with relevant data
    const message1 = `🚀 #Bitcoin is currently trading at:\n💰 $${currentPrice.toLocaleString("en-US")} (${
      priceChange1h > 0 ? `+${priceChange1h}` : priceChange1h
    }% in the last 1 hour)\n\n`;
    const message2 = `📈 24h change:\n${priceChange24h > 0 ? `+${priceChange24h}` : priceChange24h}% ${priceChange24h > 0 ? "↑" : "↓"}\n\n`;
    const message3 = `💵 Market cap:\n$${marketCap.toLocaleString("en-US")} (${
      marketCapChange24h > 0 ? `+${marketCapChange24h}` : marketCapChange24h
    }% in the last 24 hours)\n${convertNumberToApproximateStringRepresentation(marketCap)}\n\n`;
    const message4 = `📊 24h volume:\n$${totalVolume.toLocaleString("en-US")} (${
      totalVolumeChange24h > 0 ? `+${totalVolumeChange24h}` : totalVolumeChange24h
    }% in the last 24 hours)\n${convertNumberToApproximateStringRepresentation(totalVolume)}`;

    // Concatenates all the messages and returns the final message to be posted on Twitter
    const final_message = message1 + message2 + message3 + message4;
    return final_message;
  } catch (error) {
    // Catches any errors that may occur and logs the error to the console
    console.error(error);
  }
};

const convertNumberToApproximateStringRepresentation = (number) => {
  const approximations = [
    { name: 'Quadrillion', limit: 1_000_000_000_000_000 },
    { name: 'Trillion', limit: 1_000_000_000_000 },
    { name: 'Billion', limit: 1_000_000_000 },
    { name: 'Million', limit: 1_000_000 },
    { name: 'Thousand', limit: 1_000 }
  ];
  for (const { name, limit } of approximations) {
    if (number >= limit) {
      const quotient = Math.floor(number / limit);
      return `${quotient} ${name}${quotient > 1 ? 's' : ''}`;
    }
  }
  return "";
}

//Calls the postTweet() function to post the message on Twitter
postTweet();

/* This is a commented out function that exports the postTweet
function for use in an AWS Lambda function. When uncommented,
this function can be used to trigger the postTweet function on a
regular schedule in the AWS environment. */

// exports.handler = async function (event, context) {
//   return postTweet();
// };
