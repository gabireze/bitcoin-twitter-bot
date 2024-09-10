# Bitcoin Twitter & BlueSky Bot

A Node.js application that posts the latest Bitcoin price, market cap, volume updates, and other financial data on both Twitter and BlueSky. It integrates with the [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api) and the [Bluesky API](https://bsky.app). The application is deployed on AWS, using various AWS services to automate and manage tasks.

## AWS Services Used

- **AWS Lambda**: The core logic of the application runs as a serverless function in AWS Lambda, handling the process of fetching data, generating content, and posting to Twitter and BlueSky.
- **AWS S3**: Used to store and manage images, such as screenshots or charts that are posted along with updates.
- **AWS EventBridge**: Schedules cron jobs to trigger the Lambda function at specific intervals, automating the posts without manual intervention.

## Additional Tools

- **@sparticuz/chromium**: A headless version of Chromium optimized for Lambda, used to take screenshots and scrape information from websites. This is useful for gathering external data and generating visuals for the posts.
- **Puppeteer**: Used in conjunction with Chromium to automate the process of interacting with websites and collecting data via scraping.

## Prerequisites

Before running the application, you need to set up accounts and credentials for both Twitter and BlueSky:

### Twitter Setup

1. Set up a Twitter developer account.
2. Create a new Twitter app.
3. Obtain the following credentials:
   - **APP_KEY**: Your Twitter app's API key
   - **APP_SECRET**: Your Twitter app's API secret key
   - **ACCESS_TOKEN**: Your Twitter account's access token
   - **ACCESS_SECRET**: Your Twitter account's access token secret

### BlueSky Setup

1. Create a BlueSky account.
2. Obtain your BlueSky handle and password.
   - **BLUESKY_APP_USERNAME**: Your BlueSky handle
   - **BLUESKY_APP_PASSWORD**: Your BlueSky password

You will also need Node.js installed, along with the following packages:

## Dependencies

The following packages are required to run the application:

- **@atproto/api**: Used to interact with the BlueSky API for posting updates.
- **@aws-sdk/client-s3**: AWS SDK for uploading and managing files in Amazon S3.
- **@aws-sdk/lib-storage**: Provides utility methods for managing storage in AWS, used for handling uploads to S3.
- **@aws-sdk/s3-request-presigner**: Helps generate presigned URLs for securely uploading to Amazon S3.
- **@sparticuz/chromium**: A version of Chromium optimized for use in AWS Lambda environments, used for generating screenshots or headless browsing tasks.
- **axios**: Promise-based HTTP client used for making API requests (e.g., to CoinGecko for price data).
- **dotenv**: Loads environment variables from a `.env` file to manage sensitive information.
- **puppeteer-core**: A headless browser tool for generating screenshots or automating web interactions.
- **twitter-api-v2**: A wrapper for the Twitter API, used to post updates on Twitter.

## Environment Variables

Create a `.env` file in the root directory of the project and add your Twitter and BlueSky API credentials, along with other necessary environment variables.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/gabireze/bitcoin-twitter-bot.git
   ```

2. Install the required packages:

   ```bash
   cd bitcoin-twitter-bot
   npm install
   ```

3. Create a **.env** file in the root directory of the project and add your Twitter and BlueSky API credentials:

```
APP_KEY=your-app-key
APP_SECRET=your-app-secret
ACCESS_TOKEN=your-access-token
ACCESS_SECRET=your-access-token-secret

BLUESKY_APP_USERNAME=your_bluesky_handle
BLUESKY_APP_PASSWORD=your_bluesky_password

MY_CUSTOM_ACCESS_KEY_ID=
MY_CUSTOM_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
AWS_EXECUTION_ENV=AWS_Lambda_nodejs
HEADLESS=true

COINGECKO_API_URL=https://api.coingecko.com/api/v3
CURRENCY=usd
COIN_ID=bitcoin
FEAR_GREED_INDEX_IMAGE_URL=https://alternative.me/crypto/fear-and-greed-index.png
FEAR_GREED_INDEX_IMAGE_PATH=./fearAndGreedIndex.png
FEAR_GREED_INDEX_IMAGE_KEY=fearAndGreedIndex.png
BITCOIN_MONTHLY_RETURNS_IMAGE_PATH=bitcoinMonthlyReturns.png
BITCOIN_MONTHLY_RETURNS_IMAGE_KEY=bitcoinMonthlyReturns.png
```

4. Run the application:

   ```bash
   npm start
   ```

The application will fetch the latest Bitcoin price data from the [CoinGecko API](https://docs.coingecko.com/v3.0.1/reference/introduction), format the data into a tweet, and post it on both Twitter and BlueSky using your account's credentials.

## Customization

You can customize the application by changing the following variables in the **index.mjs** file:

- **CURRENCY**: the currency in which to display the price and market cap information (default: **"usd"**)
- **COIN_ID**: the CoinGecko ID of the cryptocurrency to track (default: **"bitcoin"**)
- **DAYS**: the number of days of historical data to retrieve from the CoinGecko API (default: **1**)
  You can also modify the tweet message by editing the **getPriceData** function in the index.mjs file.

## Follow us

Stay up to date with the latest #Bitcoin news and price updates by following [@BitcoinFocusNow](https://twitter.com/BitcoinFocusNow) on Twitter and [@bitcoinprice.bsky.social](https://bsky.app/profile/bitcoinprice.bsky.social) on BlueSky!

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit/) file for more information.
