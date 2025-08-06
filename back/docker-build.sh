#!/bin/bash

# ===================================
# SCRIPT PARA BUILD E EXECUÇÃO DOCKER
# ===================================

echo "🐳 Iniciando processo de containerização..."

# Função para log colorido
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    log_error "Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Build da imagem
log_info "Construindo imagem Docker..."
if docker build -t whatsapp-bot:latest .; then
    log_success "Imagem construída com sucesso!"
else
    log_error "Falha ao construir imagem"
    exit 1
fi

# Verificar se deve usar Docker Compose
if [ "$1" = "compose" ]; then
    log_info "Iniciando com Docker Compose..."
    
    # Copiar arquivo de ambiente
    if [ ! -f .env ]; then
        log_info "Copiando .env.docker para .env"
        cp .env.docker .env
    fi
    
    # Executar Docker Compose
    if docker-compose up -d; then
        log_success "Aplicação iniciada com Docker Compose!"
        log_info "Serviços disponíveis:"
        echo "  🚀 API WhatsApp: http://localhost:3000"
        echo "  🗄️  MongoDB: localhost:27017"
        echo "  🌐 Mongo Express: http://localhost:8081"
        echo ""
        log_info "Para ver logs: docker-compose logs -f"
        log_info "Para parar: docker-compose down"
    else
        log_error "Falha ao iniciar Docker Compose"
        exit 1
    fi
else
    # Executar container standalone
    log_info "Iniciando container standalone..."
    
    # Parar container existente se houver
    docker stop whatsapp-bot-container 2>/dev/null
    docker rm whatsapp-bot-container 2>/dev/null
    
    # Executar novo container
    if docker run -d \
        --name whatsapp-bot-container \
        -p 3000:3000 \
        --env-file .env.docker \
        -v whatsapp_auth:/app/.wwebjs_auth \
        -v whatsapp_qr:/app/qr-codes \
        whatsapp-bot:latest; then
        
        log_success "Container iniciado com sucesso!"
        log_info "API disponível em: http://localhost:3000"
        echo ""
        log_info "Para ver logs: docker logs -f whatsapp-bot-container"
        log_info "Para parar: docker stop whatsapp-bot-container"
    else
        log_error "Falha ao iniciar container"
        exit 1
    fi
fi

echo ""
log_success "🎉 Processo concluído!"
