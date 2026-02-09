
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { logger } from '../utils/logger.mjs';

dotenv.config();

export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});


export const postTweet = async (message, mediaIds) => {
  logger.info('Twitter posting is DISABLED - postTweet function commented out', {
    messageLength: message.length,
    hasMedia: !!mediaIds,
  });
  return {
    id: 'disabled_' + Date.now(),
    text: message,
  };

  
};
export const uploadMediaAndGetIds = async medias => {
  logger.info('Twitter media upload is DISABLED - uploadMediaAndGetIds function commented out', {
    count: medias.length,
  });
  return medias.map((_, index) => `disabled_media_${Date.now()}_${index}`);

  
};
