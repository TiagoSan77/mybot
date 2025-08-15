module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'dist/index.js',
    cwd: '/root/mybot/back',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Configurações específicas para WhatsApp Web.js
    node_args: '--max-old-space-size=1024',
    exec_mode: 'fork',
    // Restart em caso de falha
    min_uptime: '10s',
    max_restarts: 10,
    // Configurações de log
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true
  }]
};
