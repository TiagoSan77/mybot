# 🐳 Docker - WhatsApp Bot Multi-Sessões

## 📋 Visão Geral

Este projeto está totalmente containerizado com Docker, proporcionando fácil deploy e execução em qualquer ambiente.

## 🏗️ Arquitetura Docker

### **Dockerfile Multi-Stage**
- **Stage 1 (Builder)**: Compila TypeScript
- **Stage 2 (Production)**: Imagem otimizada final

### **Componentes**
- ✅ **Node.js 18 Alpine** - Base leve
- ✅ **Chromium** - Para WhatsApp Web
- ✅ **Usuário não-root** - Segurança
- ✅ **Multi-stage build** - Otimização

## 🚀 Execução Rápida

### **Opção 1: Docker Compose (Recomendado)**
```bash
# Construir e executar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### **Opção 2: Container Standalone**
```bash
# Build da imagem
docker build -t whatsapp-bot:latest .

# Executar container
docker run -d \
  --name whatsapp-bot-container \
  -p 3000:3000 \
  --env-file .env.docker \
  whatsapp-bot:latest
```

### **Opção 3: Scripts Automatizados**

**Windows (PowerShell):**
```powershell
# Container standalone
.\docker-build.ps1

# Com Docker Compose
.\docker-build.ps1 -Mode compose
```

**Linux/Mac (Bash):**
```bash
# Container standalone
./docker-build.sh

# Com Docker Compose
./docker-build.sh compose
```

## ⚙️ Configuração

### **Arquivo .env.docker**
```properties
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=admin123
MONGODB_URI=mongodb://admin:admin123@mongo:27017/whatsapp_bot?authSource=admin

# Aplicação
PORT=3000
NODE_ENV=production
SESSIONS_COLLECTION_NAME=whatsappSessions
BACKUP_SYNC_INTERVAL=300000
LOG_LEVEL=info
SAVE_QR_FILES=true
```

### **Docker Compose Services**

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **whatsapp-bot** | 3000 | API Principal |
| **mongo** | 27017 | MongoDB |
| **mongo-express** | 8081 | Interface Web MongoDB |

## 📊 Volumes Persistentes

```yaml
volumes:
  whatsapp_auth:    # Dados de autenticação WhatsApp
  whatsapp_qr:      # QR codes gerados
  mongo_data:       # Dados do MongoDB
  mongo_config:     # Configurações MongoDB
```

## 🔧 Scripts NPM

```bash
# Desenvolvimento
npm run dev

# Build e start
npm run build
npm start

# Docker standalone
npm run docker:build
npm run docker:run
npm run docker:stop
npm run docker:logs

# Docker Compose
npm run compose:up
npm run compose:down
npm run compose:logs
```

## 🌐 Endpoints Disponíveis

Após inicializar, os seguintes serviços estarão disponíveis:

### **API WhatsApp Bot**
- 🚀 **URL**: http://localhost:3000
- 📋 **Documentação**: http://localhost:3000 (página inicial)
- 🔗 **Health Check**: Automático a cada 30s

### **MongoDB**
- 🗄️ **Conexão**: localhost:27017
- 👤 **Usuário**: admin
- 🔑 **Senha**: admin123

### **Mongo Express** (Interface Web)
- 🌐 **URL**: http://localhost:8081
- 👤 **Usuário**: admin
- 🔑 **Senha**: admin123

## 📋 Comandos Úteis

### **Logs e Monitoramento**
```bash
# Logs da aplicação
docker logs -f whatsapp-bot-container

# Logs Docker Compose
docker-compose logs -f

# Logs específicos
docker-compose logs -f whatsapp-bot
docker-compose logs -f mongo
```

### **Gerenciamento de Containers**
```bash
# Listar containers
docker ps

# Entrar no container
docker exec -it whatsapp-bot-container sh

# Reiniciar serviços
docker-compose restart

# Rebuild sem cache
docker-compose build --no-cache
```

### **Volumes e Dados**
```bash
# Listar volumes
docker volume ls

# Inspecionar volume
docker volume inspect whatsapp_auth

# Backup do MongoDB
docker exec whatsapp-mongo mongodump --authenticationDatabase admin -u admin -p admin123 --db whatsapp_bot --out /backup
```

## 🔒 Segurança

### **Práticas Implementadas**
- ✅ **Usuário não-root** (uid: 1001)
- ✅ **Alpine Linux** (menor superfície de ataque)
- ✅ **Secrets em .env** (não no código)
- ✅ **Health checks** automáticos
- ✅ **Network isolada** para containers

### **Configurações de Segurança**
```yaml
# docker-compose.yml
networks:
  whatsapp-network:
    driver: bridge
    
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🚨 Troubleshooting

### **Container não inicia**
```bash
# Verificar logs
docker logs whatsapp-bot-container

# Verificar configurações
docker inspect whatsapp-bot-container
```

### **MongoDB não conecta**
```bash
# Verificar se MongoDB está rodando
docker ps | grep mongo

# Testar conexão
docker exec -it whatsapp-mongo mongo -u admin -p admin123 --authenticationDatabase admin
```

### **Ports em uso**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Matar processo
taskkill /PID <PID> /F    # Windows
kill -9 <PID>             # Linux/Mac
```

### **Rebuild completo**
```bash
# Parar tudo
docker-compose down -v

# Remover imagens
docker rmi whatsapp-bot:latest

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 🌍 Deploy em Produção

### **Variáveis de Ambiente Produção**
```properties
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod_db
CORS_ORIGIN=https://meudominio.com
API_KEY=super_secret_production_key
LOG_LEVEL=error
SAVE_QR_FILES=false
```

### **Docker Swarm (Cluster)**
```bash
# Inicializar swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml whatsapp-stack
```

### **Kubernetes (K8s)**
```bash
# Criar namespace
kubectl create namespace whatsapp-bot

# Deploy
kubectl apply -f k8s/
```

## 📊 Monitoramento

### **Health Checks**
- ✅ **HTTP**: GET / (30s interval)
- ✅ **MongoDB**: Connection test
- ✅ **Auto restart**: On failure

### **Logs Estruturados**
```bash
# JSON logs para produção
docker-compose logs --json whatsapp-bot

# Filtrar por level
docker-compose logs whatsapp-bot | grep ERROR
```

## 🎯 Otimizações

### **Imagem Otimizada**
- 🔸 **Base**: Alpine Linux (~5MB)
- 🔸 **Multi-stage**: Reduz tamanho final
- 🔸 **Cache layers**: Build mais rápido
- 🔸 **Dependências**: Apenas produção

### **Performance**
- 🔸 **Resource limits**: Configuráveis
- 🔸 **Restart policy**: unless-stopped
- 🔸 **Network**: Bridge otimizada

---

## 🎉 Resumo

**Comandos essenciais:**
```bash
# Iniciar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Acesso rápido
# API: http://localhost:3000
# MongoDB UI: http://localhost:8081
```

**🐳 Projeto containerizado com sucesso!**
