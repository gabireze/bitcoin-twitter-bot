import * as dotenv from 'dotenv';

dotenv.config();

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'COIN_ID',
  'CURRENCY',
  'COINGECKO_API_URL',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'BLUESKY_USERNAME',
  'BLUESKY_PASSWORD',
  'AWS_REGION',
  'AWS_S3_BUCKET',
];

export const validateEnvironment = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

export const config = {
  bitcoin: {
    coinId: process.env.COIN_ID,
    currency: process.env.CURRENCY,
  },
  apis: {
    coingecko: process.env.COINGECKO_API_URL,
  },
  twitter: {
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  bluesky: {
    username: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  },
  aws: {
    region: process.env.AWS_REGION,
    s3Bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  images: {
    fearGreedIndexUrl: process.env.FEAR_GREED_INDEX_IMAGE_URL,
    fearGreedIndexPath: process.env.FEAR_GREED_INDEX_IMAGE_PATH,
    bitcoinMonthlyReturnsPath: process.env.BITCOIN_MONTHLY_RETURNS_IMAGE_PATH,
  },
};
