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
- **Donation Reminder**: Optional recurring donation post to BlueSky using your Bitcoin and Lightning addresses

## Architecture

```
src/
├── config/           # Configuration management
├── controllers/      # Business logic controllers
├── services/         # External API integrations
├── processors/       # Data processing logic
├── messageTemplates/ # Message formatting templates
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
npm start          # Run the application (index.mjs)
npm run server     # Run the HTTP server (server.mjs)
npm run dev        # Run server with nodemon (development)
npm run lint       # Lint code
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier

# PM2 Management (for production deployment)
npm run pm2:start   # Start with PM2 using ecosystem.config.cjs
npm run pm2:stop    # Stop PM2 process
npm run pm2:restart # Restart PM2 process
npm run pm2:logs    # View PM2 logs
npm run pm2:status  # Check PM2 status
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

### PM2 Deployment (Production)

For production deployment with PM2:

```bash
# Start with PM2 using ecosystem.config.cjs
npm run pm2:start
# or
pm2 start ecosystem.config.cjs

# View logs
pm2 logs bitcoin-bot

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save
pm2 startup  # Generate startup script
```

See [QUICK_START.md](QUICK_START.md) for detailed server setup instructions.

## Security Considerations

- **Never commit `.env` files** - Use environment variables or secure configuration management
- **Rotate API keys regularly**
- **Use minimal permissions for service accounts**
- **Enable structured logging** for monitoring

## API Endpoints

When running `server.mjs`, the application exposes HTTP endpoints:

- `GET /health` - Health check endpoint
- `GET /actions` - List all available actions
- `POST /execute/:action` - Execute a specific action
- `POST /execute-all` - Execute all tasks

Example:
```bash
curl http://localhost:3005/actions
curl -X POST http://localhost:3005/execute/postDonationReminderToAll
```

## Available Actions

All actions can be executed via `POST /execute/:action`. Here's a complete list:

### Price Updates

#### `postBitcoin1hPriceUpdateToAll`
- **Description**: Posts Bitcoin 1-hour price update to all platforms
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Aliases**: `tweetBitcoin1hPriceUpdate`, `postBlueSkyBitcoin1hPriceUpdate`
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/postBitcoin1hPriceUpdateToAll
  ```
- **Returns**: Current Bitcoin price with 1-hour change percentage

#### `postBitcoin24hPriceUpdateToAll`
- **Description**: Posts Bitcoin 24-hour price update with market cap and volume data
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Aliases**: `tweetBitcoin24hPriceUpdate`, `postBlueSkyBitcoin24hPriceUpdate`
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/postBitcoin24hPriceUpdateToAll
  ```
- **Returns**: Current price, 24h change, market cap, and volume information

### Market Sentiment

#### `postFearGreedIndexToAll`
- **Description**: Posts Fear & Greed Index with image
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Aliases**: `tweetFearGreedIndexTweet`, `postBlueSkyFearGreedIndexTweet`
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/postFearGreedIndexToAll
  ```
- **Returns**: Current Fear & Greed Index value and classification with chart image

### Monthly Reports

#### `postBitcoinMonthlyReturnsToAll`
- **Description**: Posts Bitcoin Monthly Returns Heatmap chart
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Aliases**: `tweetBitcoinMonthlyReturns`, `postBlueSkyBitcoinMonthlyReturns`
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/postBitcoinMonthlyReturnsToAll
  ```
- **Returns**: Monthly returns heatmap image from Aug 2010 to previous month

### Donation Reminder

#### `postDonationReminderToAll`
- **Description**: Posts donation reminder with Bitcoin on-chain and Lightning addresses
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Requirements**: 
  - `DONATION_ENABLED=true` in `.env`
  - `DONATION_ONCHAIN_ADDRESS` and `DONATION_LIGHTNING_ADDRESS` configured
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/postDonationReminderToAll
  ```
- **Returns**: Support message with donation addresses
- **Note**: This action respects the `DONATION_ENABLED` configuration. If disabled, it will return a disabled status without posting.

### Batch Operations

#### `allUnifiedTasks`
- **Description**: Executes all main tasks sequentially (price updates, Fear & Greed, monthly returns)
- **Platforms**: BlueSky (active), Twitter/X (disabled)
- **Example**:
  ```bash
  curl -X POST http://localhost:3005/execute/allUnifiedTasks
  ```
- **Returns**: Combined results from:
  - `bitcoin1h`: 1-hour price update
  - `bitcoin24h`: 24-hour price update
  - `fearGreed`: Fear & Greed Index
  - `monthlyReturns`: Monthly returns heatmap
- **Note**: Does not include donation reminder. Use `postDonationReminderToAll` separately if needed.

### Response Format

All actions return a JSON response with the following structure:

```json
{
  "success": true,
  "action": "postDonationReminderToAll",
  "result": {
    "twitter": {
      "success": true,
      "data": { "id": "...", "text": "..." },
      "error": null
    },
    "bluesky": {
      "success": true,
      "data": {
        "uri": "at://...",
        "cid": "...",
        "commit": { "cid": "...", "rev": "..." },
        "validationStatus": "valid"
      },
      "error": null
    }
  },
  "timestamp": "2026-02-12T19:29:27.928Z"
}
```

### Error Handling

If an action fails, the response will include:
```json
{
  "success": false,
  "error": "Error message",
  "action": "actionName",
  "timestamp": "2026-02-12T19:29:27.928Z"
}
```

## Scheduled Tasks

The bot automatically runs scheduled tasks via node-cron:

- **Every hour** (0 * * * *): Bitcoin 1h Price Update
- **Every 12 hours** (0 */12 * * *): Bitcoin 24h Price Update
- **Daily at 00:00 UTC** (0 0 * * *): Fear & Greed Index
- **Last day of month at 12:00 UTC** (0 12 28-31 * *): Monthly Returns
- **Daily at 00:05 UTC** (5 0 * * *): Donation reminder (runs every N days based on `DONATION_INTERVAL_DAYS`)

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

Logs are stored in `./logs/` directory when using PM2.

## Contributing

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting

### Supporting the Project

If this Bitcoin bot has been useful to you, please consider supporting the project:

**On-chain Bitcoin address:**
```
bc1q2l76s0z0a4flktrz6xgqjfep5m0padgq4x48jf
```

**Lightning address:**
```
charmedcycle31@walletofsatoshi.com
```

Your support helps keep this service running and enables future improvements.

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
| `DONATION_ONCHAIN_ADDRESS` | Yes | Bitcoin on-chain address used in the donation reminder message |
| `DONATION_LIGHTNING_ADDRESS` | Yes | Lightning address used in the donation reminder message |
| `DONATION_ENABLED` | No | Enables/disables the periodic donation reminder (`true` / `false`) |
| `DONATION_INTERVAL_DAYS` | No | Interval in days between donation reminders (default: 7) |
| `LOG_LEVEL` | No | Logging level (DEBUG, INFO, WARN, ERROR) |

See `.env.exemple` for complete configuration options.

### Donation Reminder Behavior

The donation reminder feature posts a short support message to BlueSky with your on-chain and Lightning addresses.

- **Platforms**:
  - BlueSky: **active** (posts using `postBlueSkyWithoutMedia`)
  - Twitter/X: **disabled** (stub only, no real tweet is sent)
- **Enabling**:
  - Set `DONATION_ONCHAIN_ADDRESS` and `DONATION_LIGHTNING_ADDRESS` in your `.env`
  - Set `DONATION_ENABLED=true`
- **Frequency**:
  - Internal cron job runs daily at 00:05 UTC
  - A reminder is only posted when `daysSinceEpoch % DONATION_INTERVAL_DAYS === 0`
  - Change `DONATION_INTERVAL_DAYS` to control how often the reminder runs (e.g., `7` for every 7 days)
- **Message format** (example):

  ```text
  Support this Bitcoin bot:

  On-chain: YOUR_ONCHAIN_ADDRESS
  Lightning: YOUR_LIGHTNING_ADDRESS
  ```

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
- Added donation reminder feature with configurable intervals
- Implemented HTTP API endpoints for manual task execution

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


