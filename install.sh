#!/bin/bash

# Automated Installation Script - Bitcoin BlueSky Bot
# Run this script on your Linux server

set -e  # Exit if any command fails

echo "Starting Bitcoin BlueSky Bot installation..."
echo "=================================="
echo ""
echo "This script should be run after git clone:"
echo "   git clone https://github.com/gabireze/bitcoin-twitter-bot.git"
echo "   cd bitcoin-twitter-bot"
echo "   ./install.sh"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Colored logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_warning "Running as root. We recommend using a regular user for security."
   log_warning "Continuing in 5 seconds... (Ctrl+C to cancel)"
   sleep 5
fi

# 1. Update system
log_info "Updating system..."
sudo apt update && sudo apt upgrade -y
log_success "System updated!"

# 2. Install Node.js 18
log_info "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js installed! Version: $(node --version)"
else
    log_warning "Node.js is already installed. Version: $(node --version)"
fi

# 3. Install PM2
log_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_success "PM2 installed!"
else
    log_warning "PM2 is already installed."
fi

# 4. Install Google Chrome
log_info "Installing Google Chrome..."
if ! command -v google-chrome &> /dev/null; then
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
    sudo apt update
    sudo apt install -y google-chrome-stable
    log_success "Google Chrome installed!"
else
    log_warning "Google Chrome is already installed."
fi

# 5. Install Puppeteer dependencies
log_info "Installing Puppeteer dependencies..."
sudo apt install -y \
  libasound2t64 \
  libatk1.0-0t64 \
  libc6 \
  libcairo2 \
  libcups2t64 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc-s1 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0t64 \
  libgtk-3-0t64 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget
log_success "Puppeteer dependencies installed!"

# 6. Install Git if needed
if ! command -v git &> /dev/null; then
    log_info "Installing Git..."
    sudo apt install -y git
    log_success "Git installed!"
fi

# 7. Configure directories
log_info "Creating required directories..."
# Create logs in project directory
mkdir -p ./logs
sudo mkdir -p /var/log/bitcoin-bot
sudo chown $USER:$USER /var/log/bitcoin-bot
log_success "Directories created!"

# 8. Verify we are in the correct application directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found in current directory!"
    log_error "Make sure to run this script inside the bitcoin-twitter-bot directory"
    log_info "Correct commands:"
    log_info "  git clone https://github.com/gabireze/bitcoin-twitter-bot.git"
    log_info "  cd bitcoin-twitter-bot"
    log_info "  ./install.sh"
    exit 1
fi

log_success "Application directory confirmed: $(pwd)"

# 9. Install npm dependencies
log_info "Installing npm dependencies..."
npm install
log_success "Dependencies installed!"

# 10. Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.exemple" ]; then
        log_info "Creating .env file from .env.exemple..."
        cp .env.exemple .env
        log_warning "IMPORTANT: Edit .env with your credentials!"
        log_warning "Run: nano .env"
    else
        log_warning ".env file not found. You will need to create one manually."
    fi
else
    log_success ".env file already exists."
fi

# 11. Configure PM2 startup
log_info "Configuring PM2 for automatic startup..."
pm2 startup > /tmp/pm2_startup.txt 2>&1 || true
if grep -q "sudo" /tmp/pm2_startup.txt; then
    log_warning "Execute the sudo command shown below to configure PM2 auto-start:"
    cat /tmp/pm2_startup.txt | grep "sudo"
fi

# 12. Script to start the application
cat > start_bot.sh << 'EOF'
#!/bin/bash
echo "Starting Bitcoin BlueSky Bot..."

# Check if .env exists and is configured
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    exit 1
fi

# Check if main variables are defined
if ! grep -q "BLUESKY_USERNAME=" .env || ! grep -q "BLUESKY_PASSWORD=" .env; then
    echo "WARNING: Configure your BlueSky credentials in .env first!"
    echo "Run: nano .env"
    exit 1
fi

# Start with PM2
npm run pm2:start

echo "Bot started successfully!"
echo "Use 'pm2 status' to check status"
echo "Use 'pm2 logs bitcoin-bot' to view logs"
EOF

chmod +x start_bot.sh

# 13. Script to stop the application
cat > stop_bot.sh << 'EOF'
#!/bin/bash
echo "Stopping Bitcoin BlueSky Bot..."
pm2 stop bitcoin-bot
echo "Bot stopped!"
EOF

chmod +x stop_bot.sh

# 14. Status script
cat > status_bot.sh << 'EOF'
#!/bin/bash
echo "Bitcoin BlueSky Bot Status:"
echo "==========================="
pm2 status bitcoin-bot
echo ""
echo "Health Check:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health
echo ""
echo "Latest logs:"
pm2 logs bitcoin-bot --lines 5 --nostream
EOF

chmod +x status_bot.sh

# Final summary
log_success "=================================="
log_success "Installation completed!"
log_success "=================================="
echo ""
log_info "Next steps:"
echo "1. Configure your credentials: nano .env"
echo "2. Start the bot: ./start_bot.sh"
echo "3. Check status: ./status_bot.sh"
echo "4. To stop: ./stop_bot.sh"
echo ""
log_info "Useful commands:"
echo "• pm2 status - View process status"
echo "• pm2 logs bitcoin-bot - View logs in real-time"
echo "• pm2 restart bitcoin-bot - Restart the bot"
echo "• curl http://localhost:3001/health - Health check"
echo ""
log_warning "IMPORTANT: Configure the .env file before starting the bot!"
echo ""

# Final verification
log_info "Final verification:"
node --version && log_success "Node.js OK"
npm --version && log_success "NPM OK"
pm2 --version && log_success "PM2 OK"
google-chrome --version && log_success "Chrome OK"
log_success "Application code OK"

echo ""
log_success "Setup complete and ready to use!"