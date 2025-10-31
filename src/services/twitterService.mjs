import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import { APIError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

dotenv.config();

export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Enhanced Rate limit tracker with circuit breaker
let lastTweetTime = 0;
let consecutiveFailures = 0;
let circuitBreakerOpen = false;
let circuitBreakerOpenTime = 0;

// Twitter API rate limits:
// Free tier: 1 request per reset period (very restrictive)
// Portal shows 100 posts/month but real API is much more limited
// EventBridge triggers every 1 hour, so using 1.5h interval for balance
const MIN_INTERVAL_BETWEEN_TWEETS = 90 * 60 * 1000; // 1.5 hours between tweets (conservative but reasonable)
const MAX_CONSECUTIVE_FAILURES = 3;
const CIRCUIT_BREAKER_TIMEOUT = 900000; // 15 minutes

const resetCircuitBreaker = () => {
  circuitBreakerOpen = false;
  circuitBreakerOpenTime = 0;
  consecutiveFailures = 0;
  logger.info('Circuit breaker reset - Twitter posting resumed');
};

const openCircuitBreaker = () => {
  circuitBreakerOpen = true;
  circuitBreakerOpenTime = Date.now();
  logger.warn(
    `Circuit breaker opened due to ${consecutiveFailures} consecutive failures. Twitter posting paused for ${CIRCUIT_BREAKER_TIMEOUT / 1000 / 60} minutes.`
  );
};

const checkCircuitBreaker = () => {
  if (circuitBreakerOpen) {
    const timeSinceOpen = Date.now() - circuitBreakerOpenTime;
    if (timeSinceOpen >= CIRCUIT_BREAKER_TIMEOUT) {
      resetCircuitBreaker();
      return false; // Circuit breaker is now closed
    }
    return true; // Circuit breaker is still open
  }
  return false;
};

const ensureRateLimit = async () => {
  // Check if circuit breaker is open
  if (checkCircuitBreaker()) {
    const timeRemaining = CIRCUIT_BREAKER_TIMEOUT - (Date.now() - circuitBreakerOpenTime);
    throw new APIError(
      `Twitter circuit breaker is open. Retry in ${Math.ceil(timeRemaining / 1000 / 60)} minutes.`,
      'Twitter',
      429
    );
  }

  const now = Date.now();
  const timeSinceLastTweet = now - lastTweetTime;

  if (timeSinceLastTweet < MIN_INTERVAL_BETWEEN_TWEETS) {
    const waitTime = MIN_INTERVAL_BETWEEN_TWEETS - timeSinceLastTweet;
    logger.info(
      `Rate limiting: waiting ${waitTime}ms (${Math.ceil(waitTime / 1000)}s) before next tweet`,
      {
        lastTweetTime: new Date(lastTweetTime).toISOString(),
        minInterval: MIN_INTERVAL_BETWEEN_TWEETS,
        timeSinceLastTweet,
      }
    );
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastTweetTime = Date.now();
  logger.info('Rate limit check passed', {
    newTweetTime: new Date(lastTweetTime).toISOString(),
    consecutiveFailures,
  });
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      // Success - reset consecutive failures
      consecutiveFailures = 0;
      return result;
    } catch (error) {
      // Track consecutive failures for circuit breaker
      if (error.message && error.message.includes('429')) {
        consecutiveFailures++;
        logger.warn(
          `Rate limit error (attempt ${attempt}), consecutive failures: ${consecutiveFailures}`,
          {
            error: error.message,
            maxRetries,
            attempt,
          }
        );

        // Open circuit breaker if too many consecutive failures
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          openCircuitBreaker();
          throw new APIError(
            'Twitter circuit breaker opened due to repeated rate limiting',
            'Twitter',
            429
          );
        }
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with longer delays for rate limiting
      const baseDelay = error.message && error.message.includes('429') ? 30000 : initialDelay; // 30s for rate limits
      const delayMs = baseDelay * Math.pow(2, attempt - 1);

      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delayMs}ms (${Math.ceil(delayMs / 1000)}s)`,
        {
          error: error.message,
          isRateLimit: error.message && error.message.includes('429'),
          consecutiveFailures,
        }
      );

      await delay(delayMs);
    }
  }
};

export const postTweet = async (message, mediaIds) => {
  try {
    // Check circuit breaker and apply rate limiting
    await ensureRateLimit();

    logger.info('Posting tweet', {
      messageLength: message.length,
      hasMedia: !!mediaIds,
      circuitBreakerOpen,
      consecutiveFailures,
      lastTweetTime: new Date(lastTweetTime).toISOString(),
    });

    const result = await retryWithBackoff(
      async () => {
        return await twitterClient.v2.tweet({
          text: message,
          media: mediaIds ? { media_ids: mediaIds } : undefined,
        });
      },
      3,
      5000 // 5 second initial delay
    );

    logger.info('Tweet posted successfully', {
      tweetId: result.data.id,
      consecutiveFailures: 0, // Reset after success
    });
    return result.data;
  } catch (error) {
    logger.error('Failed to post tweet', {
      error: error.message,
      isRateLimit: error.message && error.message.includes('429'),
      circuitBreakerOpen,
      consecutiveFailures,
    });

    // Don't throw circuit breaker errors as they are expected
    if (error.message && error.message.includes('circuit breaker')) {
      throw error; // Re-throw as-is for proper handling upstream
    }

    throw new APIError(`Failed to post tweet: ${error.message}`, 'Twitter');
  }
};

export const uploadMediaAndGetIds = async medias => {
  try {
    // Check circuit breaker before attempting media upload
    if (checkCircuitBreaker()) {
      const timeRemaining = CIRCUIT_BREAKER_TIMEOUT - (Date.now() - circuitBreakerOpenTime);
      throw new APIError(
        `Twitter circuit breaker is open for media upload. Retry in ${Math.ceil(timeRemaining / 1000 / 60)} minutes.`,
        'Twitter',
        429
      );
    }

    logger.info('Uploading media files', {
      count: medias.length,
      circuitBreakerOpen,
      consecutiveFailures,
    });

    const mediaIds = await Promise.all(
      medias.map(async (media, index) => {
        return retryWithBackoff(
          async () => {
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

            logger.info(`Media uploaded successfully`, {
              index,
              mediaId,
              mimeType: media.mimeType,
              isUrl: media.path.startsWith('http'),
            });
            return mediaId;
          },
          3,
          10000
        ); // 10 second initial delay for media uploads
      })
    );

    logger.info('All media files uploaded successfully', {
      totalCount: mediaIds.length,
      mediaIds,
    });

    return mediaIds;
  } catch (error) {
    logger.error('Failed to upload media', {
      error: error.message,
      isRateLimit: error.message && error.message.includes('429'),
      circuitBreakerOpen,
      consecutiveFailures,
    });
    throw new APIError(`Error uploading media: ${error.message}`, 'Twitter');
  }
};
