# 🔧 Configuração com Arquivo .env

## 📋 Visão Geral

O projeto agora está completamente configurado para usar variáveis de ambiente através do arquivo `.env`, proporcionando maior segurança e flexibilidade na configuração da aplicação.

## ⚙️ Configuração

### 1. **Copiar arquivo de exemplo**

```bash
cp .env.example .env
```

### 2. **Editar o arquivo `.env`**

```properties
# ===================================
# CONFIGURAÇÕES DO SERVIDOR
# ===================================
PORT=3000
NODE_ENV=development

# ===================================
# CONFIGURAÇÕES DO MONGODB
# ===================================
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database
SESSIONS_COLLECTION_NAME=whatsappSessions

# ===================================
# CONFIGURAÇÕES DO WHATSAPP
# ===================================
BACKUP_SYNC_INTERVAL=300000

# ===================================
# CONFIGURAÇÕES DE SEGURANÇA
# ===================================
# CORS_ORIGIN=http://localhost:3001
# API_KEY=your_api_key_here

# ===================================
# CONFIGURAÇÕES DE LOGS
# ===================================
LOG_LEVEL=info
SAVE_QR_FILES=true
```

## 📚 Variáveis de Ambiente

### **🚀 Servidor**

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `PORT` | number | `3000` | Porta do servidor |
| `NODE_ENV` | string | `development` | Ambiente da aplicação |

### **🗄️ MongoDB**

| Variável | Tipo | Obrigatória | Descrição |
|----------|------|-------------|-----------|
| `MONGODB_URI` | string | ✅ Sim | String de conexão MongoDB |
| `SESSIONS_COLLECTION_NAME` | string | ❌ Não | Nome da collection (`whatsappSessions`) |

### **📱 WhatsApp**

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `BACKUP_SYNC_INTERVAL` | number | `300000` | Intervalo de backup em ms |

### **🔒 Segurança (Opcional)**

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `CORS_ORIGIN` | string | Origem permitida para CORS |
| `API_KEY` | string | Chave de API (futuro) |

### **📋 Logs e Funcionalidades**

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `LOG_LEVEL` | string | `info` | Nível de log |
| `SAVE_QR_FILES` | boolean | `true` | Salvar QR codes em arquivos |

## 🏗️ Arquitetura de Configuração

### **AppConfig (Singleton)**
- Centraliza todas as configurações
- Valida variáveis obrigatórias
- Fornece interface tipada
- Exibe configurações no startup

### **DatabaseConfig**
- Usa configurações centralizadas
- Configura nome da collection dinamicamente
- Tratamento de erros melhorado

### **WhatsAppService**
- Usa configurações para backup interval
- Controla salvamento de QR files
- Configurações dinâmicas

## 🔍 Validações Automáticas

O sistema valida automaticamente:

✅ **Variáveis obrigatórias** (MONGODB_URI)  
✅ **Porta válida** (1-65535)  
✅ **Backup interval mínimo** (60 segundos)  
✅ **Tipos corretos** para cada variável  

## 🚀 Execução

### **Desenvolvimento**
```bash
npm run dev
```

### **Produção**
```bash
# Compilar
npx tsc

# Executar
npm start
# ou
node dist/index.js
```

## 📊 Exibição de Configurações

No startup, o sistema exibe todas as configurações:

```
🔧 Configurações da Aplicação:
================================
🚀 Porta: 3000
🌍 Ambiente: development
📦 Collection: whatsappSessions
⏱️  Sync Interval: 300000ms
💾 Salvar QR Files: Sim
📋 Log Level: info
================================
```

## 🔒 Segurança

### **Arquivo .env**
- ❌ **NUNCA** commitar o arquivo `.env`
- ✅ Usar `.env.example` como modelo
- ✅ Adicionar `.env` no `.gitignore`

### **Variáveis Sensíveis**
- MongoDB URI com credenciais
- API Keys
- Tokens de acesso

## 🌍 Ambientes

### **Development**
```properties
NODE_ENV=development
SAVE_QR_FILES=true
LOG_LEVEL=debug
```

### **Production**
```properties
NODE_ENV=production
SAVE_QR_FILES=false
LOG_LEVEL=error
CORS_ORIGIN=https://meudominio.com
```

## ⚠️ Troubleshooting

### **Erro: MONGODB_URI não definida**
```
❌ Variáveis de ambiente obrigatórias não definidas: mongodbUri
```
**Solução:** Verificar se `MONGODB_URI` está no arquivo `.env`

### **Erro: Porta inválida**
```
❌ PORT deve estar entre 1 e 65535
```
**Solução:** Corrigir valor da variável `PORT`

### **Erro: Backup interval muito baixo**
```
❌ BACKUP_SYNC_INTERVAL deve ser pelo menos 60000ms
```
**Solução:** Aumentar valor para no mínimo 60000 (1 minuto)

## 📝 Exemplo Completo

**.env para desenvolvimento:**
```properties
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp_dev
SESSIONS_COLLECTION_NAME=sessions_dev
BACKUP_SYNC_INTERVAL=300000
LOG_LEVEL=debug
SAVE_QR_FILES=true
```

**.env para produção:**
```properties
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whatsapp_prod
SESSIONS_COLLECTION_NAME=sessions_prod
BACKUP_SYNC_INTERVAL=600000
LOG_LEVEL=error
SAVE_QR_FILES=false
CORS_ORIGIN=https://meuapp.com
API_KEY=super_secret_key_123
```

---

**🎉 Configuração com .env implementada com sucesso!**  
O projeto agora é mais seguro, flexível e fácil de configurar para diferentes ambientes.
