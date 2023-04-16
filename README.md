# Bitcoin Twitter Bot

This is a simple Node.js application that posts the latest Bitcoin price, market cap, and volume information on Twitter using the [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api).

## Prerequisites

Before running the application, you need to set up a Twitter developer account, create a new Twitter app, and obtain the following credentials:

- **APP_KEY**: your Twitter app's API key
- **APP_SECRET**: your Twitter app's API secret key
- **ACCESS_TOKEN**: your Twitter account's access token
- **ACCESS_SECRET**: your Twitter account's access token secret

You also need to install Node.js and the following packages:

- **axios**: a promise-based HTTP client for Node.js
- **twitter-api-v2**: a wrapper library for the Twitter API v2
- **dotenv**: a zero-dependency module that loads environment variables from a .env file

## Installation

1. Clone this repository to your local machine:

```
git clone https://github.com/gabireze/bitcoin-twitter-bot.git
```

2. Install the required packages:

```
cd bitcoin-twitter-bot
npm install
```

3. Create a **.env** file in the root directory of the project and add your Twitter API credentials:

```
APP_KEY=your-app-key
APP_SECRET=your-app-secret
ACCESS_TOKEN=your-access-token
ACCESS_SECRET=your-access-token-secret
```

4. Run the application:

```
npm start
```

The application will fetch the latest Bitcoin price data from the [CoinGecko API](https://www.coingecko.com/api/documentations/v3), format the data into a tweet, and post it on Twitter using your account's credentials.

## Customization

You can customize the application by changing the following variables in the **index.mjs** file:

- **CURRENCY**: the currency in which to display the price and market cap information (default: **"usd"**)
- **COIN_ID**: the CoinGecko ID of the cryptocurrency to track (default: **"bitcoin"**)
- **DAYS**: the number of days of historical data to retrieve from the CoinGecko API (default: **1**)
  You can also modify the tweet message by editing the **getPriceData** function in the index.mjs file.

## Follow us on Twitter

Stay up to date with the latest #Bitcoin news and price updates by following [@BitcoinFocusNow](https://twitter.com/BitcoinFocusNow) on Twitter!

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit/) file for more information.
