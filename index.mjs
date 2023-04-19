import * as bitcoinHelper from "./src/bitcoin.mjs";
import * as fearGreedIndexHelper from "./src/fearGreedIndex.mjs";
import * as dotenv from "dotenv";
import * as twitterHelper from "./src/twitter.mjs";

dotenv.config();

const postFearGreedIndexTweet = async () => {
  const fearGreedIndexData = await fearGreedIndexHelper.getFearGreedIndex();
  const fearGreedIndexMessage = await fearGreedIndexHelper.getFearGreedIndexMessage(fearGreedIndexData);
  const mediaIds = await twitterHelper.getMediaIds([{ path: process.env.FEAR_GREED_INDEX_IMAGE_URL, mimeType: "image/png" }]);
  await twitterHelper.postTweet(fearGreedIndexMessage, mediaIds);
};

const postBitcoin1hPriceTweet = async () => {
  const priceData = await bitcoinHelper.getPriceData(process.env.COINGECKO_API_URL, process.env.COIN_ID, process.env.CURRENCY);
  const priceMessage = await bitcoinHelper.getBitcoin1hPriceMessage(priceData);
  await twitterHelper.postTweet(priceMessage);
};

const postBitcoin24hPriceTweet = async () => {
  const priceData = await bitcoinHelper.getPriceData(process.env.COINGECKO_API_URL, process.env.COIN_ID, process.env.CURRENCY);
  const priceMessage = await bitcoinHelper.getBitcoin24hPriceMessage(priceData);
  await twitterHelper.postTweet(priceMessage);
};

await postFearGreedIndexTweet();
await postBitcoin1hPriceTweet();
await postBitcoin24hPriceTweet();

/* This is a commented out function that exports the postTweet
function for use in an AWS Lambda function. When uncommented,
this function can be used to trigger the postTweet function on a
regular schedule AWS environment. */

// export const handler = async (event, context) => {
//   const action = event["action"];
//   if (action === "postBitcoin1hPriceTweet") {
//     return await postBitcoin1hPriceTweet();
//   }
//   if (action === "postBitcoin24hPriceTweet") {
//     return await postBitcoin24hPriceTweet();
//   }
//   if (action === "postFearGreedIndexTweet") {
//     return await postFearGreedIndexTweet();
//   }
// };
