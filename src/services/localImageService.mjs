import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.mjs';
const PUBLIC_DIR = './public/images';
const BASE_URL = process.env.BASE_URL || 'https://gabireze.cloud/api/bitcoin';
const ensureDirectoryExists = async () => {
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
  } catch (error) {
    logger.error('Failed to create public images directory', error);
    throw error;
  }
};


export const saveImageLocally = async (buffer, filename) => {
  try {
    await ensureDirectoryExists();
    const timestamp = Date.now();
    const fileExtension = path.extname(filename);
    const baseName = path.basename(filename, fileExtension);
    const finalFilename = `${baseName}_${timestamp}${fileExtension}`;

    const filePath = path.join(PUBLIC_DIR, finalFilename);
    await fs.writeFile(filePath, buffer);
    const publicUrl = `${BASE_URL}/${finalFilename}`;

    logger.info('Image saved locally', {
      filename: finalFilename,
      size: buffer.length,
      url: publicUrl,
    });

    return {
      localPath: filePath,
      publicUrl: publicUrl,
    };
  } catch (error) {
    logger.error('Failed to save image locally', error);
    throw error;
  }
};


export const downloadAndSaveImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return await saveImageLocally(buffer, filename);
  } catch (error) {
    logger.error('Failed to download and save image', error);
    throw error;
  }
};


export const cleanupOldImages = async () => {
  try {
    await ensureDirectoryExists();

    const files = await fs.readdir(PUBLIC_DIR);
    const fileGroups = {};

    for (const file of files) {
      const baseName = file.split('_')[0];
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
    }
    for (const [, files] of Object.entries(fileGroups)) {
      if (files.length > 10) {
        files.sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop().split('.')[0]);
          const timestampB = parseInt(b.split('_').pop().split('.')[0]);
          return timestampB - timestampA;
        });
        const filesToDelete = files.slice(10);
        for (const file of filesToDelete) {
          try {
            await fs.unlink(path.join(PUBLIC_DIR, file));
            logger.info('Deleted old image file', { file });
          } catch (error) {
            logger.warn('Failed to delete old image file', { file, error: error.message });
          }
        }
      }
    }
  } catch (error) {
    logger.error('Failed to cleanup old images', error);
  }
};
cleanupOldImages();
