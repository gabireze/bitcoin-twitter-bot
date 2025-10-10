module.exports = {
  apps: [
    {
      name: 'bitcoin-bot',
      script: 'server.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: 'localhost', // Apenas localhost para segurança
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: 'localhost', // Apenas localhost para segurança
      },

      // Logs organizados
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Configurações de restart
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Configurações avançadas
      exec_mode: 'fork',
      merge_logs: true,

      // Monitoramento de saúde
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Restart automático às 3h (opcional - para limpeza de memória)
      cron_restart: '0 3 * * *',

      // Arquivo de variáveis de ambiente
      env_file: '.env',

      // Kill timeout
      kill_timeout: 5000,

      // Descrição
      description: 'Bitcoin Twitter/BlueSky Bot com agendamento interno (node-cron)',
    },
  ],
};
