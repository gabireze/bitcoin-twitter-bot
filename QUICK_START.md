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

### Step 3: Install Dependencies

```bash
npm install
```

## Running the Bot

### Option 1: Direct Execution

```bash
npm start
```

### Option 2: Server Deployment with PM2

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

## Scheduled Tasks

The bot automatically runs:
- **Every hour**: Bitcoin 1h price update
- **Every 12 hours**: Bitcoin 24h price update
- **Daily at 00:00 UTC**: Fear & Greed Index
- **Last day of month at 12:00 UTC**: Monthly Bitcoin returns

## Troubleshooting

### Check logs
```bash
pm2 logs bitcoin-bot
```

### Health check
```bash
curl http://localhost:3001/health
```

### Restart service
```bash
pm2 restart bitcoin-bot
```

## Documentation

- [TWITTER_DISABLED.md](TWITTER_DISABLED.md) - Why Twitter support is disabled
- [README.md](README.md) - Complete project documentation

## 🔒 Segurança

- ✅ Servidor aceita apenas conexões localhost
- ✅ Porta 3000 não exposta externamente
- ✅ Credenciais em arquivo .env protegido