# ===================================
# SCRIPT POWERSHELL PARA DOCKER
# ===================================

param(
    [string]$Mode = "standalone"
)

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host "🐳 Iniciando processo de containerização..." -ForegroundColor Cyan

# Verificar se Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker não está rodando. Inicie o Docker Desktop primeiro."
    exit 1
}

# Build da imagem
Write-Info "Construindo imagem Docker..."
$buildResult = docker build -t whatsapp-bot:latest .
if ($LASTEXITCODE -eq 0) {
    Write-Success "Imagem construída com sucesso!"
} else {
    Write-Error "Falha ao construir imagem"
    exit 1
}

# Verificar modo de execução
if ($Mode -eq "compose") {
    Write-Info "Iniciando com Docker Compose..."
    
    # Copiar arquivo de ambiente se não existir
    if (!(Test-Path ".env")) {
        Write-Info "Copiando .env.docker para .env"
        Copy-Item ".env.docker" ".env"
    }
    
    # Executar Docker Compose
    $composeResult = docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Aplicação iniciada com Docker Compose!"
        Write-Info "Serviços disponíveis:"
        Write-Host "  🚀 API WhatsApp: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "  🗄️  MongoDB: localhost:27017" -ForegroundColor Yellow
        Write-Host "  🌐 Mongo Express: http://localhost:8081" -ForegroundColor Yellow
        Write-Host ""
        Write-Info "Para ver logs: docker-compose logs -f"
        Write-Info "Para parar: docker-compose down"
    } else {
        Write-Error "Falha ao iniciar Docker Compose"
        exit 1
    }
} else {
    Write-Info "Iniciando container standalone..."
    
    # Parar container existente se houver
    docker stop whatsapp-bot-container 2>$null
    docker rm whatsapp-bot-container 2>$null
    
    # Executar novo container
    $runResult = docker run -d `
        --name whatsapp-bot-container `
        -p 3000:3000 `
        --env-file .env.docker `
        -v whatsapp_auth:/app/.wwebjs_auth `
        -v whatsapp_qr:/app/qr-codes `
        whatsapp-bot:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Container iniciado com sucesso!"
        Write-Info "API disponível em: http://localhost:3000"
        Write-Host ""
        Write-Info "Para ver logs: docker logs -f whatsapp-bot-container"
        Write-Info "Para parar: docker stop whatsapp-bot-container"
    } else {
        Write-Error "Falha ao iniciar container"
        exit 1
    }
}

Write-Host ""
Write-Success "🎉 Processo concluído!" -ForegroundColor Green
