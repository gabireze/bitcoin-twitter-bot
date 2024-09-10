import { AtpAgent, RichText } from "@atproto/api";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const BLUESKY_BOT_USERNAME = process.env.BLUESKY_APP_USERNAME;
const BLUESKY_BOT_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

const authenticateBlueSky = async () => {
  const agent = new AtpAgent({ service: "https://bsky.social/" });
  await agent.login({
    identifier: BLUESKY_BOT_USERNAME,
    password: BLUESKY_BOT_PASSWORD,
  });
  return agent;
};

const createRichTextWithHashtags = async (message) => {
  const rt = new RichText({ text: message });
  await rt.detectFacets();
  return rt;
};

export const postBlueSkyWithoutMedia = async (message) => {
  try {
    const agent = await authenticateBlueSky();

    const rt = await createRichTextWithHashtags(message);

    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    const postResponse = await agent.post(postRecord);
    console.log("BlueSky post without media successful:", postResponse);
    return postResponse;
  } catch (error) {
    throw new Error(`Error posting to BlueSky: ${error.message}`);
  }
};

const uploadBlueSkyMedia = async (agent, imagePath) => {
  try {
    let imageBuffer;
    if (imagePath.startsWith("http")) {
      const response = await axios.get(imagePath, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data, "binary");
    } else {
      imageBuffer = fs.readFileSync(imagePath);
    }

    const uploadedImage = await agent.uploadBlob(imageBuffer, {
      encoding: "image/png",
    });

    return uploadedImage.data.blob;
  } catch (error) {
    throw new Error(`Error uploading media to BlueSky: ${error.message}`);
  }
};

export const postBlueSkyWithMedia = async (message, imagePath, altText) => {
  try {
    const agent = await authenticateBlueSky();
    const imageBlob = await uploadBlueSkyMedia(agent, imagePath);

    const rt = await createRichTextWithHashtags(message);

    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: "app.bsky.embed.images",
        images: [
          {
            image: {
              $type: "blob",
              ref: {
                $link: imageBlob.ref.toString(),
              },
              mimeType: imageBlob.mimeType,
              size: imageBlob.size,
            },
            alt: altText || "Image description",
          },
        ],
      },
    };

    const postResponse = await agent.post(postRecord);
    console.log("BlueSky post with media successful:", postResponse);
    return postResponse;
  } catch (error) {
    throw new Error(`Error posting to BlueSky with media: ${error.message}`);
  }
};
