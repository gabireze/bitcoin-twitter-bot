# Bitcoin Twitter & BlueSky Bot

A robust Node.js application that automatically posts Bitcoin price updates, market cap, volume data, and Fear & Greed Index information on both Twitter and BlueSky. Built with modern JavaScript practices, comprehensive error handling, and designed for flexible deployment.

## ✨ Features

- 🔄 **Automated Posting**: Schedules regular updates on both Twitter and BlueSky
- 📊 **Multi-Data Sources**: Integrates with CoinGecko API and Fear & Greed Index
- 📈 **Screenshot Generation**: Creates visual charts using Puppeteer and Chromium
- 🛡️ **Error Handling**: Comprehensive error management with retry logic
- 📝 **Structured Logging**: JSON-formatted logs for better monitoring
- 🏗️ **Modern Architecture**: Clean separation of concerns and modular design

## 🔧 Architecture

```
src/
├── config/           # Configuration management
├── controllers/      # Business logic controllers
├── services/         # External API integrations
├── processors/       # Data processing logic
├── messageBuilders/  # Message formatting
└── utils/           # Utilities and helpers
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Twitter Developer Account
- BlueSky Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gabireze/bitcoin-twitter-bot.git
   cd bitcoin-twitter-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.exemple .env
   # Edit .env with your credentials
   ```

4. **Run the application**
   ```bash
   npm start
   ```

## 🏗️ Development

### Available Scripts

```bash
npm start          # Run the application
npm run lint       # Lint code
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

## 🚀 Deployment

### Local/Server Deployment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.exemple .env
# Edit .env with your credentials

# Run the application
npm start
```

### Docker

```bash
# Build image
docker build -t bitcoin-twitter-bot .

# Run container
docker run --env-file .env bitcoin-twitter-bot
```

## 🔒 Security Considerations

- **Never commit `.env` files** - Use environment variables or secure configuration management
- **Rotate API keys regularly**
- **Use minimal permissions for service accounts**
- **Enable structured logging** for monitoring

## 📊 Monitoring

The application includes structured logging:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "Tweet posted successfully",
  "tweetId": "1234567890"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting

## 🐛 Error Handling

The application includes comprehensive error handling:

- **API Errors**: Retry logic with exponential backoff
- **Validation Errors**: Input validation for all data
- **Configuration Errors**: Environment variable validation
- **Graceful Degradation**: Continues operation if individual tasks fail

## 📋 API Integrations

### CoinGecko API
- Fetches Bitcoin price, market cap, and volume data
- Handles rate limiting and API errors
- Validates data structure

### Twitter API v2
- Posts tweets with media support
- Retry logic for failed posts
- Media upload handling

### BlueSky API
- Rich text formatting
- Image uploads with alt text
- Proper error handling

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COIN_ID` | Yes | CoinGecko coin identifier |
| `CURRENCY` | Yes | Base currency for prices |
| `APP_KEY` | Yes | Twitter API key |
| `BLUESKY_APP_USERNAME` | Yes | BlueSky handle |
| `LOG_LEVEL` | No | Logging level (DEBUG, INFO, WARN, ERROR) |

See `.env.exemple` for complete configuration options.

## 📈 Performance

- **Retry Logic**: Exponential backoff for failed requests
- **Timeout Handling**: 10-second timeout for API requests
- **Memory Optimization**: Efficient buffer handling for images
- **Concurrent Operations**: Parallel processing where possible

## 🆕 Recent Improvements

- ✅ Refactored monolithic `index.mjs` into modular architecture
- ✅ Added comprehensive error handling and custom error classes
- ✅ Implemented structured logging with JSON format
- ✅ Added retry logic with exponential backoff
- ✅ Enhanced data validation and error recovery
- ✅ Configured ESLint and Prettier for code quality
- ✅ Added Docker support for containerized deployment
- ✅ Improved environment variable validation
- ✅ Enhanced security practices and documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for cryptocurrency data
- [Twitter API](https://developer.twitter.com) for social media integration
- [BlueSky](https://bsky.app) for decentralized social networking

---

**Follow us for Bitcoin updates:**
- Twitter: [@BitcoinFocusNow](https://twitter.com/BitcoinFocusNow)
- BlueSky: [@bitcoinprice.bsky.social](https://bsky.app/profile/bitcoinprice.bsky.social)
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

COINGECKO_API_URL=https://api.coingecko.com/api/v3
CURRENCY=usd
COIN_ID=bitcoin
FEAR_GREED_INDEX_IMAGE_URL=https://alternative.me/crypto/fear-and-greed-index.png
FEAR_GREED_INDEX_IMAGE_PATH=./fearAndGreedIndex.png
BITCOIN_MONTHLY_RETURNS_IMAGE_PATH=bitcoinMonthlyReturns.png
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

<!-- GitAds-Verify: FOIDMP7E98H76ZX3FE1E9JSUE7J8YRAZ -->
