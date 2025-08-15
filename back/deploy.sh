#!/bin/bash

# Script de deploy para PM2
echo "🚀 Iniciando deploy do WhatsApp Bot..."

# Navegar para o diretório do backend
cd "$(dirname "$0")"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build falhou - diretório 'dist' não encontrado"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Parar processo PM2 se estiver rodando
echo "🛑 Parando processo PM2 existente..."
pm2 stop whatsapp-bot 2>/dev/null || true
pm2 delete whatsapp-bot 2>/dev/null || true

# Iniciar com PM2
echo "🔄 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# Mostrar status
echo "📊 Status da aplicação:"
pm2 status

# Salvar configuração PM2
pm2 save

echo "✅ Deploy concluído!"
echo "💡 Para ver os logs: pm2 logs whatsapp-bot"
echo "💡 Para ver o status: pm2 status"
echo "💡 Para reiniciar: pm2 restart whatsapp-bot"
