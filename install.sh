#!/bin/bash

# 🚀 Script de Instalação Automatizada - Bitcoin Bot
# Execute este script no seu servidor KVM Linux da Hostinger

set -e  # Parar se algum comando falhar

echo "🚀 Iniciando instalação do Bitcoin Bot..."
echo "=================================="
echo ""
echo "💡 Este script deve ser executado APÓS fazer o git clone:"
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

# Função para logs coloridos
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_warning "Executando como root. Recomendamos usar um usuário normal por segurança."
   log_warning "Continuando mesmo assim em 5 segundos... (Ctrl+C para cancelar)"
   sleep 5
fi

# 1. Atualizar sistema
log_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
log_success "Sistema atualizado!"

# 2. Instalar Node.js 18
log_info "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js instalado! Versão: $(node --version)"
else
    log_warning "Node.js já está instalado. Versão: $(node --version)"
fi

# 3. Instalar PM2
log_info "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_success "PM2 instalado!"
else
    log_warning "PM2 já está instalado."
fi

# 4. Instalar Google Chrome
log_info "Instalando Google Chrome..."
if ! command -v google-chrome &> /dev/null; then
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
    sudo apt update
    sudo apt install -y google-chrome-stable
    log_success "Google Chrome instalado!"
else
    log_warning "Google Chrome já está instalado."
fi

# 5. Instalar dependências do Puppeteer
log_info "Instalando dependências do Puppeteer..."
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
log_success "Dependências do Puppeteer instaladas!"

# 6. Instalar Git se necessário
if ! command -v git &> /dev/null; then
    log_info "Instalando Git..."
    sudo apt install -y git
    log_success "Git instalado!"
fi

# 7. Configurar diretórios
log_info "Criando diretórios necessários..."
# Criar logs no diretório atual do projeto
mkdir -p ./logs
sudo mkdir -p /var/log/bitcoin-bot
sudo chown $USER:$USER /var/log/bitcoin-bot
log_success "Diretórios criados!"

# 8. Verificar se estamos no diretório correto da aplicação
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado no diretório atual!"
    log_error "Certifique-se de executar este script dentro do diretório bitcoin-twitter-bot"
    log_info "Comandos corretos:"
    log_info "  git clone https://github.com/gabireze/bitcoin-twitter-bot.git"
    log_info "  cd bitcoin-twitter-bot"
    log_info "  ./install.sh"
    exit 1
fi

log_success "Diretório da aplicação confirmado: $(pwd)"

# 9. Instalar dependências npm
log_info "Instalando dependências npm..."
npm install
log_success "Dependências instaladas!"

# 10. Verificar arquivo .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_info "Criando arquivo .env baseado no .env.example..."
        cp .env.example .env
        log_warning "IMPORTANTE: Edite o arquivo .env com suas credenciais!"
        log_warning "Execute: nano .env"
    else
        log_warning "Arquivo .env não encontrado. Você precisará criar um manualmente."
    fi
else
    log_success "Arquivo .env já existe."
fi

# 11. Configurar PM2 startup
log_info "Configurando PM2 para iniciar automaticamente..."
pm2 startup > /tmp/pm2_startup.txt 2>&1 || true
if grep -q "sudo" /tmp/pm2_startup.txt; then
    log_warning "Execute o comando sudo mostrado abaixo para configurar o auto-start do PM2:"
    cat /tmp/pm2_startup.txt | grep "sudo"
fi

# 12. Script para iniciar a aplicação
cat > start_bot.sh << 'EOF'
#!/bin/bash
echo "🤖 Iniciando Bitcoin Bot..."

# Verificar se .env existe e está configurado
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Verificar se as principais variáveis estão definidas
if ! grep -q "TWITTER_API_KEY=" .env || ! grep -q "BLUESKY_USERNAME=" .env; then
    echo "⚠️  ATENÇÃO: Configure suas credenciais no arquivo .env primeiro!"
    echo "Execute: nano .env"
    exit 1
fi

# Iniciar com PM2
npm run pm2:start

echo "✅ Bot iniciado com sucesso!"
echo "Use 'pm2 status' para verificar o status"
echo "Use 'pm2 logs bitcoin-bot' para ver os logs"
EOF

chmod +x start_bot.sh

# 13. Script para parar a aplicação
cat > stop_bot.sh << 'EOF'
#!/bin/bash
echo "🛑 Parando Bitcoin Bot..."
pm2 stop bitcoin-bot
echo "✅ Bot parado!"
EOF

chmod +x stop_bot.sh

# 14. Script de status
cat > status_bot.sh << 'EOF'
#!/bin/bash
echo "📊 Status do Bitcoin Bot:"
echo "========================"
pm2 status bitcoin-bot
echo ""
echo "🏥 Health Check:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health
echo ""
echo "📝 Últimos logs:"
pm2 logs bitcoin-bot --lines 5 --nostream
EOF

chmod +x status_bot.sh

# Resumo final
log_success "=================================="
log_success "🎉 Instalação concluída!"
log_success "=================================="
echo ""
log_info "Próximos passos:"
echo "1. Configure suas credenciais: nano .env"
echo "2. Inicie o bot: ./start_bot.sh"
echo "3. Verifique o status: ./status_bot.sh"
echo "4. Para parar: ./stop_bot.sh"
echo ""
log_info "Comandos úteis:"
echo "• pm2 status - Ver status dos processos"
echo "• pm2 logs bitcoin-bot - Ver logs em tempo real"
echo "• pm2 restart bitcoin-bot - Reiniciar o bot"
echo "• curl http://localhost:3001/health - Health check"
echo ""
log_warning "⚠️  IMPORTANTE: Configure o arquivo .env antes de iniciar o bot!"
echo ""

# Verificar se tudo está OK
log_info "Verificação final:"
node --version && log_success "✓ Node.js OK"
npm --version && log_success "✓ NPM OK"
pm2 --version && log_success "✓ PM2 OK"
google-chrome --version && log_success "✓ Chrome OK"
log_success "✓ Código da aplicação OK"

echo ""
log_success "🚀 Tudo pronto para uso!"