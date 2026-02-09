# Bitcoin Twitter & BlueSky Bot

A robust Node.js application that automatically posts Bitcoin price updates, market cap, volume data, and Fear & Greed Index information to BlueSky. Built with modern JavaScript practices, comprehensive error handling, and designed for flexible deployment.

> **Note**: Twitter/X posting is currently disabled due to API access restrictions and strict rate limiting policies that have been implemented since Twitter's rebranding to X. Only BlueSky is active. See [TWITTER_DISABLED.md](TWITTER_DISABLED.md) for details on re-enabling Twitter support when access becomes available.

## GitAds Sponsored
[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=gabireze/bitcoin-twitter-bot@github)](https://gitads.dev/v1/ad-track?source=gabireze/bitcoin-twitter-bot@github)

## Features

- **Dual Platform Support**: Posts to BlueSky (currently active) and Twitter/X (when enabled)
- **Multi-Data Sources**: Integrates with CoinGecko API and Fear & Greed Index
- **Screenshot Generation**: Creates visual charts using Puppeteer and Chromium
- **Error Handling**: Comprehensive error management with retry logic
- **Structured Logging**: JSON-formatted logs for better monitoring
- **Modern Architecture**: Clean separation of concerns and modular design
- **Scheduled Tasks**: Hourly, 12-hourly, daily, and monthly automated posts via node-cron

## Architecture

```
src/
├── config/           # Configuration management
├── controllers/      # Business logic controllers
├── services/         # External API integrations
├── processors/       # Data processing logic
├── messageBuilders/  # Message formatting
└── utils/           # Utilities and helpers
```

## Quick Start

### Prerequisites

- Node.js 20+
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

## Development

### Available Scripts

```bash
npm start          # Run the application
npm run lint       # Lint code
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

## Deployment

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

## Security Considerations

- **Never commit `.env` files** - Use environment variables or secure configuration management
- **Rotate API keys regularly**
- **Use minimal permissions for service accounts**
- **Enable structured logging** for monitoring

## Monitoring

The application includes structured logging:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "Tweet posted successfully",
  "tweetId": "1234567890"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Retry logic with exponential backoff
- **Validation Errors**: Input validation for all data
- **Configuration Errors**: Environment variable validation
- **Graceful Degradation**: Continues operation if individual tasks fail

## API Integrations

### CoinGecko API
- Fetches Bitcoin price, market cap, and volume data
- Handles rate limiting and API errors
- Validates data structure

### Twitter/X API v2 (Currently Disabled)
- Designed to post tweets with media support
- Includes retry logic for failed posts
- Media upload handling
- **Status**: Disabled due to API access restrictions (see [TWITTER_DISABLED.md](TWITTER_DISABLED.md))

### BlueSky API (Active)
- Rich text formatting
- Image uploads with alt text
- Proper error handling
- Fully operational

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COIN_ID` | Yes | CoinGecko coin identifier (e.g., 'bitcoin') |
| `CURRENCY` | Yes | Base currency for prices (e.g., 'usd') |
| `COINGECKO_API_URL` | Yes | CoinGecko API endpoint |
| `BLUESKY_USERNAME` | Yes | BlueSky handle (e.g., username.bsky.social) |
| `BLUESKY_PASSWORD` | Yes | BlueSky app password |
| `FEAR_GREED_INDEX_IMAGE_URL` | Yes | Fear & Greed Index image URL |
| `FEAR_GREED_INDEX_IMAGE_PATH` | Yes | Local path to store Fear & Greed image |
| `BITCOIN_MONTHLY_RETURNS_IMAGE_PATH` | Yes | Local path to store monthly returns chart |
| `LOG_LEVEL` | No | Logging level (DEBUG, INFO, WARN, ERROR) |

See `.env.exemple` for complete configuration options.

## Performance

- **Retry Logic**: Exponential backoff for failed requests
- **Timeout Handling**: 10-second timeout for API requests
- **Memory Optimization**: Efficient buffer handling for images
- **Concurrent Operations**: Parallel processing where possible

## Recent Improvements

- Refactored monolithic `index.mjs` into modular architecture
- Added comprehensive error handling and custom error classes
- Implemented structured logging with JSON format
- Added retry logic with exponential backoff
- Enhanced data validation and error recovery
- Configured ESLint and Prettier for code quality
- Added Docker support for containerized deployment
- Improved environment variable validation
- Enhanced security practices and documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CoinGecko](https://coingecko.com) for cryptocurrency data
- [Twitter/X](https://developer.twitter.com) for social media API (legacy support)
- [BlueSky](https://bsky.app) for decentralized social networking
- [Puppeteer](https://pptr.dev) for automated screenshot generation

---

**Follow us for Bitcoin updates on BlueSky:**
- [@bitcoinprice.bsky.social](https://bsky.app/profile/bitcoinprice.bsky.social)

## Dependencies

- **@atproto/api**: BlueSky protocol client
- **axios**: HTTP client for API requests
- **dotenv**: Environment variable management
- **express**: Web framework for server endpoints
- **node-cron**: Task scheduling
- **puppeteer**: Automated browser for screenshots


