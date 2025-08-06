# 🚀 INSTRUÇÕES PARA EXECUTAR COM DOCKER

## ⚠️ Pré-requisitos

1. **Instalar Docker Desktop**
   - Windows: https://docs.docker.com/desktop/install/windows/
   - Instalar e iniciar o Docker Desktop

2. **Verificar instalação**
   ```bash
   docker --version
   docker-compose --version
   ```

## 🐳 Como Executar

### **Método 1: Docker Compose (Recomendado)**
```bash
# 1. Iniciar Docker Desktop

# 2. No terminal, navegar até a pasta do projeto
cd c:\Users\Usuario\Desktop\BOT-DOCKER\back

# 3. Executar Docker Compose
docker-compose up -d

# 4. Verificar se está rodando
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

### **Método 2: PowerShell Script**
```powershell
# 1. Abrir PowerShell como Administrador

# 2. Navegar até o projeto
cd c:\Users\Usuario\Desktop\BOT-DOCKER\back

# 3. Executar script
.\docker-build.ps1 -Mode compose
```

### **Método 3: NPM Scripts**
```bash
# Build da imagem
npm run docker:build

# Executar com compose
npm run compose:up

# Ver logs
npm run compose:logs

# Parar
npm run compose:down
```

## 📊 Serviços Disponíveis

Após executar com sucesso:

- **🚀 API WhatsApp**: http://localhost:3000
- **🗄️ MongoDB**: localhost:27017
- **🌐 Mongo Express**: http://localhost:8081 (admin/admin123)

## 🔧 Arquivos Criados

```
📁 Projeto/
├── 🐳 Dockerfile              # Configuração da imagem
├── 🐳 docker-compose.yml      # Orquestração dos serviços
├── 🐳 .dockerignore          # Arquivos ignorados no build
├── ⚙️ .env.docker            # Configurações para Docker
├── 📜 docker-build.sh        # Script para Linux/Mac
├── 📜 docker-build.ps1       # Script para Windows
└── 📚 DOCKER.md              # Documentação completa
```

## ✅ Verificações

1. **Docker Desktop está rodando?**
   ```bash
   docker info
   ```

2. **Portas disponíveis?**
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :27017
   netstat -ano | findstr :8081
   ```

3. **Build foi bem-sucedido?**
   ```bash
   docker images | findstr whatsapp-bot
   ```

## 🎯 Próximos Passos

1. Iniciar Docker Desktop
2. Executar: `docker-compose up -d`
3. Aguardar containers iniciarem
4. Acessar: http://localhost:3000
5. Criar sessão via API
6. Escanear QR code
7. Usar WhatsApp Bot!

---

**🎉 Projeto totalmente containerizado e pronto para uso!**
