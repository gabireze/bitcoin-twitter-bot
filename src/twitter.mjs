import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";
import fs from "fs";

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

export const getMediaIds = async (medias) => {
  try {
    const mediaIds = await Promise.all(
      medias.map(async (media) => {
        let buffer;

        if (media.path.startsWith("http")) {
          const response = await fetch(media.path);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          buffer = fs.readFileSync(media.path);
        }
        const mediaId = await twitterClient.v1.uploadMedia(buffer, { mimeType: media.mimeType });
        console.log(`Successfully uploaded media: ${mediaId}`);
        return mediaId;
      })
    );
    return mediaIds;
  } catch (error) {
    console.error(error);
  }
};
