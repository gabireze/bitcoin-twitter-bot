import * as dotenv from 'dotenv';

dotenv.config();

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'COIN_ID',
  'CURRENCY',
  'COINGECKO_API_URL',
  'APP_KEY',
  'APP_SECRET',
  'ACCESS_TOKEN',
  'ACCESS_SECRET',
  'BLUESKY_APP_USERNAME',
  'BLUESKY_APP_PASSWORD',
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
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET,
  },
  bluesky: {
    username: process.env.BLUESKY_APP_USERNAME,
    password: process.env.BLUESKY_APP_PASSWORD,
  },
  aws: {
    region: process.env.AWS_REGION,
    s3Bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.MY_CUSTOM_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_CUSTOM_SECRET_ACCESS_KEY,
  },
  images: {
    fearGreedIndexUrl: process.env.FEAR_GREED_INDEX_IMAGE_URL,
    fearGreedIndexPath: process.env.FEAR_GREED_INDEX_IMAGE_PATH,
    bitcoinMonthlyReturnsPath: process.env.BITCOIN_MONTHLY_RETURNS_IMAGE_PATH,
  },
};
