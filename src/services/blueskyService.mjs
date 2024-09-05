import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://bsky.social/xrpc";

export const authenticateBlueSky = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/com.atproto.server.createSession`,
      {
        identifier: process.env.BLUESKY_HANDLE,
        password: process.env.BLUESKY_PASSWORD,
      }
    );
    return response.data.accessJwt;
  } catch (error) {
    throw new Error(`Error authenticating with BlueSky: ${error.message}`);
  }
};

const createHashtagFacets = (message) => {
  const hashtagRegex = /#\w+/g;
  const matches = [...message.matchAll(hashtagRegex)];

  return matches.map((match) => ({
    index: {
      byteStart: match.index,
      byteEnd: match.index + match[0].length,
    },
    features: [
      {
        $type: "app.bsky.richtext.facet#tag",
        tag: match[0].substring(1),
      },
    ],
  }));
};

export const postBlueSky = async (message) => {
  try {
    const token = await authenticateBlueSky();

    const facets = createHashtagFacets(message);

    const postResponse = await axios.post(
      `${BASE_URL}/com.atproto.repo.createRecord`,
      {
        collection: "app.bsky.feed.post",
        repo: process.env.BLUESKY_HANDLE,
        record: {
          $type: "app.bsky.feed.post",
          text: message,
          facets,
          createdAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("BlueSky post with hashtags successful:", postResponse.data);
    return postResponse.data;
  } catch (error) {
    throw new Error(`Error posting to BlueSky: ${error.message}`);
  }
};

// TODO: Implement the uploadBlueSkyMedia function
// export const uploadBlueSkyMedia = async (imagePath) => {
//   try {
//     const token = await authenticateBlueSky();
//     let imageBuffer;

//     if (imagePath.startsWith("http")) {
//       const response = await axios.get(imagePath, {
//         responseType: "arraybuffer",
//       });
//       imageBuffer = Buffer.from(response.data, "binary");
//     } else {
//       imageBuffer = fs.readFileSync(imagePath);
//     }

//     const form = new FormData();
//     form.append("file", imageBuffer, { filename: "image.png" });

//     const uploadResponse = await axios.post(
//       `${BASE_URL}/com.atproto.repo.uploadBlob`,
//       form,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           ...form.getHeaders(),
//         },
//       }
//     );

//     return uploadResponse.data.blob;
//   } catch (error) {
//     throw new Error(`Error uploading media to BlueSky: ${error.message}`);
//   }
// };

// TODO: Implement the postBlueSkyWithMedia function
// export const postBlueSkyWithMedia = async (message, imagePath) => {
//   try {
//     const imageBlob = await uploadBlueSkyMedia(imagePath);
//     const token = await authenticateBlueSky();

//     const facets = createHashtagFacets(message);

//     const postResponse = await axios.post(
//       `${BASE_URL}/com.atproto.repo.createRecord`,
//       {
//         collection: "app.bsky.feed.post",
//         repo: process.env.BLUESKY_HANDLE,
//         record: {
//           $type: "app.bsky.feed.post",
//           text: message,
//           facets,
//           createdAt: new Date().toISOString(),
//           embed: {
//             $type: "app.bsky.embed.images",
//             images: [
//               {
//                 image: imageBlob,
//                 alt: "Image description",
//               },
//             ],
//           },
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log(
//       "BlueSky post with image and hashtags successful:",
//       postResponse.data
//     );
//     return postResponse.data;
//   } catch (error) {
//     throw new Error(`Error posting to BlueSky with image: ${error.message}`);
//   }
// };
