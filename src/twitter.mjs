import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";

dotenv.config();

export const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

export async function postTweet(message, mediaIds) {
  try {
    const tweet = await twitterClient.v2.tweet({
      text: message,
      media: mediaIds ? { media_ids: mediaIds } : undefined,
    });

    console.log(`Successfully posted tweet: ${JSON.stringify(tweet.data, null, 2)}`);
  } catch (error) {
    console.error(error);
  }
}

export const getMediaIds = async (mediaPaths) => {
  const mediaIds = await Promise.all(mediaPaths.map((mediaPath) => twitterClient.v1.uploadMedia(mediaPath)));
  return mediaIds;
};
