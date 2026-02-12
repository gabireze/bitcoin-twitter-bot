# Quick Start Guide - Bitcoin BlueSky Bot

This guide will get you up and running with the Bitcoin BlueSky Bot on your server.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Node.js 20+
- BlueSky account with app password
- CoinGecko API access (free)

## Installation

### Step 1: Clone and Enter Directory

```bash
git clone https://github.com/gabireze/bitcoin-twitter-bot.git
cd bitcoin-twitter-bot
```

### Step 2: Configure Environment Variables

```bash
cp .env.exemple .env
nano .env  # Edit with your credentials
```

Required variables:
- `BLUESKY_USERNAME`: Your BlueSky handle (e.g., yourname.bsky.social)
- `BLUESKY_PASSWORD`: Your BlueSky app password
- `COINGECKO_API_URL`: https://api.coingecko.com/api/v3
- `COIN_ID`: bitcoin
- `CURRENCY`: usd
- `FEAR_GREED_INDEX_IMAGE_URL`: https://alternative.me/crypto/fear-and-greed-index.png
- `FEAR_GREED_INDEX_IMAGE_PATH`: Local path to store Fear & Greed image
- `BITCOIN_MONTHLY_RETURNS_IMAGE_PATH`: Local path to store monthly returns chart
- `DONATION_ONCHAIN_ADDRESS`: Bitcoin on-chain address (required, no fallback)
- `DONATION_LIGHTNING_ADDRESS`: Lightning address (required, no fallback)

Optional variables:
- `DONATION_ENABLED`: Enable donation reminder (`true` / `false`, default: `false`)
- `DONATION_INTERVAL_DAYS`: Days between donation reminders (default: 7)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR)

### Step 3: Install Dependencies

```bash
npm install
```

## Running the Bot

### Option 1: Direct Execution (Development)

```bash
npm start          # Run index.mjs (one-time execution)
npm run server    # Run server.mjs (HTTP server with cron jobs)
npm run dev        # Run with nodemon (auto-reload on changes)
```

### Option 2: Server Deployment with PM2 (Production)

#### Using PM2 directly:

```bash
# Start with ecosystem.config.cjs
npm run pm2:start
# or
pm2 start ecosystem.config.cjs

# Manage the bot
npm run pm2:stop      # Stop bot
npm run pm2:restart   # Restart bot
npm run pm2:logs      # View logs
npm run pm2:status    # Check status

# Save PM2 configuration
pm2 save
pm2 startup  # Generate startup script for system reboot
```

#### Using install script:

```bash
chmod +x install.sh
./install.sh
```

Then manage with:
```bash
./start_bot.sh    # Start bot
./stop_bot.sh     # Stop bot
./status_bot.sh   # Check status
```

### Option 3: Docker Deployment

```bash
# Build image
docker build -t bitcoin-twitter-bot .

# Run container
docker run --env-file .env bitcoin-twitter-bot
```

## Scheduled Tasks

The bot automatically runs scheduled tasks via node-cron:

- **Every hour** (0 * * * *): Bitcoin 1h price update
- **Every 12 hours** (0 */12 * * *): Bitcoin 24h price update
- **Daily at 00:00 UTC** (0 0 * * *): Fear & Greed Index
- **Last day of month at 12:00 UTC** (0 12 28-31 * *): Monthly Bitcoin returns
- **Daily at 00:05 UTC** (5 0 * * *): Donation reminder (runs every N days based on `DONATION_INTERVAL_DAYS`)

**Note**: The donation reminder only posts when:
- `DONATION_ENABLED=true` in your `.env`
- The current day matches the interval (e.g., every 7 days if `DONATION_INTERVAL_DAYS=7`)

## API Endpoints

When running `server.mjs`, the bot exposes HTTP endpoints:

- `GET /health` - Health check endpoint
- `GET /actions` - List all available actions
- `POST /execute/:action` - Execute a specific action
- `POST /execute-all` - Execute all tasks

Examples:
```bash
# Check health
curl http://localhost:3005/health

# List available actions
curl http://localhost:3005/actions

# Execute donation reminder manually
curl -X POST http://localhost:3005/execute/postDonationReminderToAll

# Execute all tasks
curl -X POST http://localhost:3005/execute-all
```

See [README.md](README.md) for complete action documentation.

## Troubleshooting

### Check logs
```bash
pm2 logs bitcoin-bot
pm2 logs bitcoin-bot --lines 100  # Last 100 lines
pm2 logs bitcoin-bot --err         # Only errors
```

### Health check
```bash
# Default port (check your .env for PORT variable)
curl http://localhost:3005/health

# Or check what port is configured
pm2 env bitcoin-bot | grep PORT
```

### Check if bot is running
```bash
pm2 status
pm2 describe bitcoin-bot
```

### Restart service
```bash
pm2 restart bitcoin-bot
pm2 restart bitcoin-bot --update-env  # Reload environment variables
```

### View environment variables
```bash
pm2 env bitcoin-bot
```

### Common Issues

**Bot not posting:**
- Check if `DONATION_ENABLED=true` (if using donation reminder)
- Verify BlueSky credentials in `.env`
- Check logs for API errors

**Port already in use:**
- Check which port is configured: `grep PORT .env`
- Find what's using the port: `sudo ss -tlnp | grep :PORT`
- Change PORT in `.env` and restart: `pm2 restart bitcoin-bot --update-env`

**Cron jobs not running:**
- Ensure `server.mjs` is running (not just `index.mjs`)
- Check logs for cron job initialization messages
- Verify timezone is UTC in logs

## Documentation

- [TWITTER_DISABLED.md](TWITTER_DISABLED.md) - Why Twitter support is disabled
- [README.md](README.md) - Complete project documentation

## 🔒 Security

- ✅ Server listens on all interfaces (0.0.0.0) but should be behind a firewall/proxy
- ✅ Port not exposed externally (use nginx reverse proxy)
- ✅ Credentials stored in `.env` file (never commit to git)
- ✅ Environment variables validated on startup
- ✅ Structured logging for monitoring

## Configuration Tips

### Donation Reminder Setup

To enable the donation reminder feature:

1. Add your addresses to `.env`:
   ```bash
   DONATION_ONCHAIN_ADDRESS=your_bitcoin_address
   DONATION_LIGHTNING_ADDRESS=your_lightning_address
   DONATION_ENABLED=true
   DONATION_INTERVAL_DAYS=7
   ```

2. Restart the bot:
   ```bash
   pm2 restart bitcoin-bot --update-env
   ```

3. Test manually:
   ```bash
   curl -X POST http://localhost:3005/execute/postDonationReminderToAll
   ```

### Changing Port

If you need to change the server port:

1. Edit `.env`:
   ```bash
   PORT=3005  # Change to your desired port
   ```

2. Update `ecosystem.config.cjs` if using PM2:
   ```javascript
   env: {
     PORT: 3005,  # Match your .env
   }
   ```

3. Restart:
   ```bash
   pm2 restart bitcoin-bot --update-env
   ```

### Nginx Reverse Proxy Setup

Example nginx configuration:

```nginx
location /api/bitcoin/ {
    proxy_pass http://127.0.0.1:3005/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```