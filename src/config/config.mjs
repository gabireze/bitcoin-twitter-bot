import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'COIN_ID',
  'CURRENCY',
  'COINGECKO_API_URL',
  'BLUESKY_USERNAME',
  'BLUESKY_PASSWORD',
  'FEAR_GREED_INDEX_IMAGE_URL',
  'FEAR_GREED_INDEX_IMAGE_PATH',
  'BITCOIN_MONTHLY_RETURNS_IMAGE_PATH',
  'DONATION_ONCHAIN_ADDRESS',
  'DONATION_LIGHTNING_ADDRESS',
];

export const validateEnvironment = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const parseBoolean = value =>
  typeof value === 'string' ? value.trim().toLowerCase() === 'true' : Boolean(value);

const parseInteger = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }
  return parsed;
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
  images: {
    fearGreedIndexUrl: process.env.FEAR_GREED_INDEX_IMAGE_URL,
    fearGreedIndexPath: process.env.FEAR_GREED_INDEX_IMAGE_PATH,
    bitcoinMonthlyReturnsPath: process.env.BITCOIN_MONTHLY_RETURNS_IMAGE_PATH,
  },
  donations: {
    onchainAddress: process.env.DONATION_ONCHAIN_ADDRESS,
    lightningAddress: process.env.DONATION_LIGHTNING_ADDRESS,
    enabled: parseBoolean(process.env.DONATION_ENABLED ?? 'false'),
    intervalDays: parseInteger(process.env.DONATION_INTERVAL_DAYS ?? '7', 7),
  },
};

