# 🚀 Instalação Rápida - Bitcoin Bot

## 📋 Comandos para Deploy no Servidor

```bash
# 1. Clonar o repositório
git clone https://github.com/gabireze/bitcoin-twitter-bot.git
cd bitcoin-twitter-bot

# 2. Executar instalação automatizada
chmod +x install.sh
./install.sh

# 3. Configurar credenciais
nano .env

# 4. Iniciar o bot
./start_bot.sh
```

## 📱 Comandos Úteis

```bash
# Ver status
./status_bot.sh

# Parar bot
./stop_bot.sh

# Ver logs em tempo real
pm2 logs bitcoin-bot

# Reiniciar
pm2 restart bitcoin-bot

# Health check
curl http://localhost:3001/health
```

## 📅 Agendamento Automático

O bot executa automaticamente:
- **A cada hora**: Bitcoin 1h Price Update
- **A cada 12 horas**: Bitcoin 24h Price Update  
- **A cada 24 horas (00:00 UTC)**: Fear & Greed Index
- **Último dia do mês às 12:00 UTC**: Monthly Returns

## 📖 Documentação Completa

Veja o [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) para instruções detalhadas.

## 🔒 Segurança

- ✅ Servidor aceita apenas conexões localhost
- ✅ Porta 3000 não exposta externamente
- ✅ Credenciais em arquivo .env protegido