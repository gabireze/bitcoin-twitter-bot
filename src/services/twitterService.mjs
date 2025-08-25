import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import { APIError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

dotenv.config();

export const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// Rate limit tracker
let lastTweetTime = 0;
const MIN_INTERVAL_BETWEEN_TWEETS = 65000; // 65 segundos entre tweets (para ficar abaixo do limite de 50 tweets/15min)

const ensureRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastTweet = now - lastTweetTime;

  if (timeSinceLastTweet < MIN_INTERVAL_BETWEEN_TWEETS) {
    const waitTime = MIN_INTERVAL_BETWEEN_TWEETS - timeSinceLastTweet;
    logger.info(`Rate limiting: waiting ${waitTime}ms before next tweet`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastTweetTime = Date.now();
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delayMs = initialDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms`, { error: error.message });
      await delay(delayMs);
    }
  }
};

export const postTweet = async (message, mediaIds) => {
  try {
    // Aplicar rate limiting antes de tentar postar
    await ensureRateLimit();

    logger.info('Posting tweet', { messageLength: message.length, hasMedia: !!mediaIds });

    const result = await retryWithBackoff(
      async () => {
        return await twitterClient.v2.tweet({
          text: message,
          media: mediaIds ? { media_ids: mediaIds } : undefined,
        });
      },
      3,
      2000
    ); // 3 tentativas com delay inicial de 2 segundos

    logger.info('Tweet posted successfully', { tweetId: result.data.id });
    return result.data;
  } catch (error) {
    logger.error('Failed to post tweet', error);
    throw new APIError(`Failed to post tweet: ${error.message}`, 'Twitter');
  }
};

export const uploadMediaAndGetIds = async medias => {
  try {
    logger.info('Uploading media files', { count: medias.length });

    const mediaIds = await Promise.all(
      medias.map(async (media, index) => {
        return retryWithBackoff(async () => {
          const buffer = media.path.startsWith('http')
            ? Buffer.from(
                (
                  await axios.get(media.path, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                  })
                ).data,
                'binary'
              )
            : fs.readFileSync(media.path);

          const mediaId = await twitterClient.v1.uploadMedia(buffer, {
            mimeType: media.mimeType,
          });

          logger.info(`Media uploaded successfully`, { index, mediaId });
          return mediaId;
        });
      })
    );

    return mediaIds;
  } catch (error) {
    logger.error('Failed to upload media', error);
    throw new APIError(`Error uploading media: ${error.message}`, 'Twitter');
  }
};
