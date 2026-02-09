import { AtpAgent, RichText } from '@atproto/api';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.mjs';

dotenv.config();

const BLUESKY_BOT_USERNAME = process.env.BLUESKY_USERNAME;
const BLUESKY_BOT_PASSWORD = process.env.BLUESKY_PASSWORD;

// Detectar MIME type correto baseado em Content-Type header ou extensão do arquivo
const guessMimeType = (imagePath, headers = {}) => {
  // Primeiro tenta o Content-Type header (para URLs)
  const contentType = (headers['content-type'] || '').toLowerCase();

  if (contentType.includes('image/jpeg')) return 'image/jpeg';
  if (contentType.includes('image/png')) return 'image/png';
  if (contentType.includes('image/webp')) return 'image/webp';
  if (contentType.includes('image/gif')) return 'image/gif';

  // Fallback para extensão do arquivo
  const ext = path.extname(imagePath).toLowerCase();
  
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';

  // Padrão seguro
  logger.warn('Could not determine image MIME type, defaulting to image/png', {
    path: imagePath,
    contentType,
    ext,
  });
  return 'image/png';
};

const authenticateBlueSky = async () => {
  const agent = new AtpAgent({ service: 'https://bsky.social/' });
  await agent.login({
    identifier: BLUESKY_BOT_USERNAME,
    password: BLUESKY_BOT_PASSWORD,
  });
  return agent;
};

const createRichTextWithHashtags = async message => {
  const rt = new RichText({ text: message });
  await rt.detectFacets();
  return rt;
};

export const postBlueSkyWithoutMedia = async message => {
  try {
    const agent = await authenticateBlueSky();

    const rt = await createRichTextWithHashtags(message);

    const postRecord = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    const postResponse = await agent.post(postRecord);
    logger.info('BlueSky post without media successful:', postResponse);
    return postResponse;
  } catch (error) {
    throw new Error(`Error posting to BlueSky: ${error.message}`);
  }
};

const uploadBlueSkyMedia = async (agent, imagePath) => {
  try {
    let imageBuffer;
    let responseHeaders = {};
    let finalMimeType = 'image/png';

    logger.info('Uploading image to BlueSky', { imagePath });

    if (imagePath.startsWith('http')) {
      // Download de URL
      const response = await axios.get(imagePath, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      responseHeaders = response.headers || {};
      imageBuffer = Buffer.from(response.data);

      // Validar que é realmente uma imagem
      const contentType = (responseHeaders['content-type'] || '').toLowerCase();
      if (!contentType.startsWith('image/')) {
        throw new Error(
          `Invalid content type from URL: ${contentType}. Expected image/*`
        );
      }

      logger.debug('Image downloaded from URL', {
        url: imagePath,
        contentType,
        size: imageBuffer.length,
      });
    } else {
      // Arquivo local
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      imageBuffer = fs.readFileSync(imagePath);

      logger.debug('Image loaded from file', {
        path: imagePath,
        size: imageBuffer.length,
      });
    }

    // Validar tamanho (Bluesky tem limite de ~976KB)
    const MAX_SIZE = 976 * 1024; // 976 KB
    if (imageBuffer.length > MAX_SIZE) {
      logger.warn('Image exceeds BlueSky size limit', {
        size: imageBuffer.length,
        limit: MAX_SIZE,
      });
      // Continuar mesmo assim, deixar Bluesky retornar erro se necessário
    }

    // Detectar MIME type correto
    finalMimeType = guessMimeType(imagePath, responseHeaders);

    logger.info('Uploading blob to BlueSky', {
      mimeType: finalMimeType,
      size: imageBuffer.length,
    });

    const uploadedImage = await agent.uploadBlob(imageBuffer, {
      encoding: finalMimeType,
    });

    logger.info('Image uploaded successfully to BlueSky', {
      mimeType: finalMimeType,
      blobSize: uploadedImage.data.blob.size,
    });

    return uploadedImage.data.blob;
  } catch (error) {
    logger.error('Error uploading media to BlueSky', {
      imagePath,
      error: error.message,
    });
    throw new Error(`Error uploading media to BlueSky: ${error.message}`);
  }
};

export const postBlueSkyWithMedia = async (message, imagePath, altText) => {
  try {
    logger.info('Starting BlueSky post with media', {
      imagePath,
      messageLength: message.length,
      altText: altText?.substring(0, 50),
    });

    const agent = await authenticateBlueSky();
    const imageBlob = await uploadBlueSkyMedia(agent, imagePath);

    const rt = await createRichTextWithHashtags(message);

    const postRecord = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: 'app.bsky.embed.images',
        images: [
          {
            image: imageBlob,
            alt: altText || 'Image description',
          },
        ],
      },
    };

    const postResponse = await agent.post(postRecord);

    logger.info('BlueSky post with media successful:', {
      uri: postResponse.uri,
      cid: postResponse.cid,
      mimeType: imageBlob.mimeType,
      blobSize: imageBlob.size,
    });

    return postResponse;
  } catch (error) {
    logger.error('Error posting to BlueSky with media', {
      imagePath,
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Error posting to BlueSky with media: ${error.message}`);
  }
};
