import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

export const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

export const postTweet = async (message, mediaIds) => {
  try {
    const tweet = await twitterClient.v2.tweet({
      text: message,
      media: mediaIds ? { media_ids: mediaIds } : undefined,
    });
    return tweet.data;
  } catch (error) {
    throw new Error(`Error posting tweet: ${error.message}`);
  }
};

export const uploadMediaAndGetIds = async (medias) => {
  try {
    const mediaIds = await Promise.all(
      medias.map(async (media) => {
        const buffer = media.path.startsWith("http")
          ? Buffer.from((await axios.get(media.path, { responseType: "arraybuffer" })).data, "binary")
          : fs.readFileSync(media.path);

        const mediaId = await twitterClient.v1.uploadMedia(buffer, { mimeType: media.mimeType });
        console.log(`Successfully uploaded media: ${mediaId}`);
        return mediaId;
      })
    );
    return mediaIds;
  } catch (error) {
    throw new Error(`Error getting media ids: ${error.message}`);
  }
};
