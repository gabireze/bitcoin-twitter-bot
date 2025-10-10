import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.mjs';

// Diretório público para servir imagens
const PUBLIC_DIR = './public/images';
const BASE_URL = process.env.BASE_URL || 'https://gabireze.cloud/api/bitcoin';

// Garantir que o diretório existe
const ensureDirectoryExists = async () => {
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
  } catch (error) {
    logger.error('Failed to create public images directory', error);
    throw error;
  }
};

/**
 * Salva um buffer como arquivo local e retorna a URL pública
 * @param {Buffer} buffer - Buffer da imagem
 * @param {string} filename - Nome do arquivo (ex: bitcoinMonthlyReturns.png)
 * @returns {string} URL pública da imagem
 */
export const saveImageLocally = async (buffer, filename) => {
  try {
    await ensureDirectoryExists();

    // Adicionar timestamp para evitar cache de imagens antigas
    const timestamp = Date.now();
    const fileExtension = path.extname(filename);
    const baseName = path.basename(filename, fileExtension);
    const finalFilename = `${baseName}_${timestamp}${fileExtension}`;

    const filePath = path.join(PUBLIC_DIR, finalFilename);

    // Salvar arquivo
    await fs.writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `${BASE_URL}/${finalFilename}`;

    logger.info('Image saved locally', {
      filename: finalFilename,
      size: buffer.length,
      url: publicUrl,
    });

    return publicUrl;
  } catch (error) {
    logger.error('Failed to save image locally', error);
    throw error;
  }
};

/**
 * Baixa uma imagem de URL e salva localmente
 * @param {string} imageUrl - URL da imagem para baixar
 * @param {string} filename - Nome do arquivo local
 * @returns {string} URL pública da imagem salva
 */
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

/**
 * Limpa imagens antigas (mantém apenas as últimas 10 de cada tipo)
 */
export const cleanupOldImages = async () => {
  try {
    await ensureDirectoryExists();

    const files = await fs.readdir(PUBLIC_DIR);

    // Agrupar por tipo de arquivo (bitcoinMonthlyReturns, fearGreedIndex, etc)
    const fileGroups = {};

    for (const file of files) {
      const baseName = file.split('_')[0]; // Remove timestamp
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
    }

    // Manter apenas os 10 mais recentes de cada tipo
    for (const [, files] of Object.entries(fileGroups)) {
      if (files.length > 10) {
        // Ordenar por timestamp (mais recente primeiro)
        files.sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop().split('.')[0]);
          const timestampB = parseInt(b.split('_').pop().split('.')[0]);
          return timestampB - timestampA;
        });

        // Deletar arquivos antigos
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

// Executar limpeza a cada inicialização
cleanupOldImages();
