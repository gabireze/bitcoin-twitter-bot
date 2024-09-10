import * as dotenv from "dotenv";
import {
  create24hPriceUpdateSummary,
  createCurrentPriceAnd1hChangeSummary,
} from "./src/messageBuilders/bitcoinMessageBuilders.mjs";
import { createFearGreedIndexMessage } from "./src/messageBuilders/fearGreedIndexMessages.mjs";
import { createBitcoinMonthlyReturnsMessage } from "./src/messageBuilders/newhedgeMessageBuilders.mjs";
import { getBitcoinReturnsScreenshot } from "./src/processors/newhedgeDataProcessor.mjs";
import { fetchPriceData } from "./src/services/bitcoinDataService.mjs";
import {
  postBlueSkyWithMedia,
  postBlueSkyWithoutMedia,
} from "./src/services/blueskyService.mjs";
import { getFearGreedIndex } from "./src/services/fearGreedIndexService.mjs";
import { uploadFileByBuffer } from "./src/services/s3Service.mjs";
import {
  postTweet,
  uploadMediaAndGetIds,
} from "./src/services/twitterService.mjs";

dotenv.config();

const tweetBitcoin1hPriceUpdate = async () => {
  try {
    const response = await fetchPriceData(
      process.env.COIN_ID,
      process.env.CURRENCY
    );

    if (!response) {
      throw new Error("No data returned from the fetchPriceData function.");
    }

    const summaryMessage = createCurrentPriceAnd1hChangeSummary(response);
    const tweetResponse = await postTweet(summaryMessage);

    if (tweetResponse.error) {
      console.error("Failed to post tweet:", tweetResponse.details);
    } else {
      console.log("Tweet successfully posted. Message:", summaryMessage);
    }
  } catch (error) {
    console.error(
      "Error occurred in tweetBitcoin1hPriceUpdate:",
      error.message,
      error.stack
    );
  }
};

const tweetBitcoin24hPriceUpdate = async () => {
  try {
    const priceData = await fetchPriceData(
      process.env.COIN_ID,
      process.env.CURRENCY
    );

    if (!priceData) {
      throw new Error(
        "Failed to fetch Bitcoin price data or received empty response."
      );
    }

    const summaryMessage = create24hPriceUpdateSummary(priceData);
    const tweetResponse = await postTweet(summaryMessage);

    if (tweetResponse.error) {
      console.error("Failed to post tweet:", tweetResponse.details);
    } else {
      console.log("Tweet successfully posted. Message:", summaryMessage);
    }
  } catch (error) {
    console.error(
      "Error in tweetBitcoin24hPriceUpdate:",
      error.message,
      error.stack
    );
  }
};

const tweetFearGreedIndexTweet = async () => {
  try {
    const fearGreedIndexData = await getFearGreedIndex();

    if (
      !fearGreedIndexData ||
      !fearGreedIndexData.data ||
      fearGreedIndexData.data.length === 0
    ) {
      throw new Error("Invalid or empty Fear & Greed Index data received.");
    }

    const fearGreedIndexMessage =
      createFearGreedIndexMessage(fearGreedIndexData);
    const mediaIds = await uploadMediaAndGetIds([
      { path: process.env.FEAR_GREED_INDEX_IMAGE_URL, mimeType: "image/png" },
    ]);
    await postTweet(fearGreedIndexMessage, mediaIds);

    console.log("Fear & Greed Index tweet successfully posted.");
  } catch (error) {
    console.error(
      "Error in postFearGreedIndexTweet: ",
      error.message,
      error.stack
    );
  }
};

const tweetBitcoinMonthlyReturns = async () => {
  try {
    const screenshotBuffer = await getBitcoinReturnsScreenshot();
    if (!screenshotBuffer) {
      throw new Error("Failed to capture Bitcoin Monthly Returns screenshot.");
    }

    const imageUrl = await uploadFileByBuffer(
      screenshotBuffer,
      process.env.BITCOIN_MONTHLY_RETURNS_IMAGE_PATH
    );
    if (!imageUrl) {
      throw new Error("Failed to upload Bitcoin Monthly Returns screenshot.");
    }

    const mediaIds = await uploadMediaAndGetIds([
      { path: imageUrl, mimeType: "image/png" },
    ]);
    if (!mediaIds || mediaIds.length === 0) {
      throw new Error("Failed to get media ID for the uploaded image.");
    }

    const tweetMessage = await createBitcoinMonthlyReturnsMessage();

    await postTweet(tweetMessage, mediaIds);
    console.log("Bitcoin Monthly Returns tweet successfully posted.");
  } catch (error) {
    console.error("Error in tweetBitcoinMonthlyReturns:", error.message);
    console.log("Failed to post the tweet. Please try again later.");
  }
};

const postBlueSkyBitcoin1hPriceUpdate = async () => {
  try {
    const response = await fetchPriceData(
      process.env.COIN_ID,
      process.env.CURRENCY
    );

    if (!response) {
      throw new Error("No data returned from the fetchPriceData function.");
    }

    const summaryMessage = createCurrentPriceAnd1hChangeSummary(response);
    await postBlueSkyWithoutMedia(summaryMessage);

    console.log("BlueSky post successfully created. Message:", summaryMessage);
  } catch (error) {
    console.error(
      "Error occurred in postBlueSkyBitcoin1hPriceUpdate:",
      error.message,
      error.stack
    );
  }
};

const postBlueSkyBitcoin24hPriceUpdate = async () => {
  try {
    const priceData = await fetchPriceData(
      process.env.COIN_ID,
      process.env.CURRENCY
    );

    if (!priceData) {
      throw new Error(
        "Failed to fetch Bitcoin price data or received empty response."
      );
    }

    const summaryMessage = create24hPriceUpdateSummary(priceData);
    await postBlueSkyWithoutMedia(summaryMessage);

    console.log("BlueSky post successfully created. Message:", summaryMessage);
  } catch (error) {
    console.error(
      "Error in postBlueSkyBitcoin24hPriceUpdate:",
      error.message,
      error.stack
    );
  }
};

const postBlueSkyFearGreedIndexTweet = async () => {
  try {
    const fearGreedIndexData = await getFearGreedIndex();
    const indexValue = fearGreedIndexData.data[0].value;
    const classification = fearGreedIndexData.data[0].value_classification;

    if (
      !fearGreedIndexData ||
      !fearGreedIndexData.data ||
      fearGreedIndexData.data.length === 0
    ) {
      throw new Error("Invalid or empty Fear & Greed Index data received.");
    }

    const fearGreedIndexMessage =
      createFearGreedIndexMessage(fearGreedIndexData);

    await postBlueSkyWithMedia(
      fearGreedIndexMessage,
      process.env.FEAR_GREED_INDEX_IMAGE_URL,
      `Fear & Greed Index is ${indexValue} (${classification})`
    );

    console.log("Fear & Greed Index post on BlueSky successfully created.");
  } catch (error) {
    console.error(
      "Error in postBlueSkyFearGreedIndexTweet: ",
      error.message,
      error.stack
    );
  }
};

const postBlueSkyBitcoinMonthlyReturns = async () => {
  try {
    const screenshotBuffer = await getBitcoinReturnsScreenshot();
    if (!screenshotBuffer) {
      throw new Error("Failed to capture Bitcoin Monthly Returns screenshot.");
    }

    const imageUrl = await uploadFileByBuffer(
      screenshotBuffer,
      process.env.BITCOIN_MONTHLY_RETURNS_IMAGE_PATH
    );

    await postBlueSkyWithMedia(
      await createBitcoinMonthlyReturnsMessage(),
      imageUrl,
      "Bitcoin Monthly Returns Heatmap"
    );

    console.log(
      "Bitcoin Monthly Returns post on BlueSky successfully created."
    );
  } catch (error) {
    console.error("Error in postBlueSkyBitcoinMonthlyReturns:", error.message);
    console.log("Failed to post on BlueSky. Please try again later.");
  }
};

await tweetBitcoin1hPriceUpdate();
await tweetBitcoin24hPriceUpdate();
await tweetFearGreedIndexTweet();
await tweetBitcoinMonthlyReturns();

await postBlueSkyBitcoin1hPriceUpdate();
await postBlueSkyBitcoin24hPriceUpdate();
await postBlueSkyFearGreedIndexTweet();
await postBlueSkyBitcoinMonthlyReturns();

/* This is a commented out function that exports the postTweet
function for use in an AWS Lambda function. When uncommented,
this function can be used to trigger the postTweet function on a
regular schedule AWS environment. */

// export const handler = async (event, context) => {
//   const action = event["action"];
//   if (action === "tweetBitcoin1hPriceUpdate") {
//     return await tweetBitcoin1hPriceUpdate();
//   }
//   if (action === "tweetBitcoin24hPriceUpdate") {
//     return await tweetBitcoin24hPriceUpdate();
//   }
//   if (action === "tweetFearGreedIndexTweet") {
//     return await tweetFearGreedIndexTweet();
//   }
//   if (action === "tweetBitcoinMonthlyReturns") {
//     return await tweetBitcoinMonthlyReturns();
//   }
//   if (action === "postBlueSkyBitcoin1hPriceUpdate") {
//     return await postBlueSkyBitcoin1hPriceUpdate();
//   }
//   if (action === "postBlueSkyBitcoin24hPriceUpdate") {
//     return await postBlueSkyBitcoin24hPriceUpdate();
//   }
//   if (action === "postBlueSkyFearGreedIndexTweet") {
//     return await postBlueSkyFearGreedIndexTweet();
//   }
//   if (action === "postBlueSkyBitcoinMonthlyReturns") {
//     return await postBlueSkyBitcoinMonthlyReturns();
//   }
// };
