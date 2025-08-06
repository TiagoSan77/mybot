# 🔐 Autenticação Firebase - Bot WhatsApp Multi-Sessões

Este documento explica como a autenticação Firebase foi implementada no projeto Bot WhatsApp Multi-Sessões.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Arquitetura](#arquitetura)
- [Como Usar](#como-usar)
- [Modo Desenvolvimento](#modo-desenvolvimento)
- [Rotas Protegidas](#rotas-protegidas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

## 🔍 Visão Geral

A autenticação foi implementada usando **Firebase Authentication** com as seguintes características:

- ✅ **Firebase Admin SDK** para verificação de tokens no servidor
- ✅ **Middleware personalizado** para autenticação de rotas
- ✅ **Modo desenvolvimento** para testes locais
- ✅ **Associação de sessões** a usuários autenticados
- ✅ **Filtragem de dados** por usuário

## ⚙️ Configuração

### Firebase Project

O projeto está configurado para usar o Firebase project:
```
Project ID: clientlogin-33401
Auth Domain: clientlogin-33401.firebaseapp.com
```

### Arquivos de Configuração

#### 1. `src/config/firebase.ts`
Configuração do Firebase Client SDK (para uso futuro em frontend):

```typescript
// Configuração do Firebase Cliente
const firebaseConfig = {
  apiKey: "AIzaSyBFredZwbgA0NefOoOfgkrWKRz0AxY4cG8",
  authDomain: "clientlogin-33401.firebaseapp.com",
  projectId: "clientlogin-33401",
  // ...
};
```

#### 2. `src/middleware/auth.ts`
Middleware de autenticação com Firebase Admin SDK:

```typescript
// Verificação de tokens ID do Firebase
export const authenticateToken = async (req, res, next) => {
  // Verifica token Bearer no header Authorization
  // Valida com Firebase Admin SDK
  // Adiciona informações do usuário ao req.user
}
```

## 🏗️ Arquitetura

### Fluxo de Autenticação

```mermaid
graph LR
    A[Cliente] --> B[API Request]
    B --> C[Middleware Auth]
    C --> D{Token Válido?}
    D -->|Sim| E[Adicionar req.user]
    D -->|Não + Dev Mode| F[Usuario Dev]
    D -->|Não + Prod Mode| G[Erro 401]
    E --> H[Controller]
    F --> H
    G --> I[Response Error]
    H --> J[Response Success]
```

### Estrutura de Arquivos

```
src/
├── config/
│   ├── firebase.ts          # Configuração Firebase Client
│   └── app.ts               # Configurações da aplicação
├── middleware/
│   └── auth.ts              # Middleware de autenticação
├── routes/
│   ├── auth.ts              # Rotas de autenticação
│   └── sessionRoutes.ts     # Rotas protegidas
└── controllers/
    └── sessionController.ts # Controllers com usuário
```

## 🚀 Como Usar

### 1. Obter Token de Autenticação

No frontend (usando Firebase Auth):

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();
```

### 2. Fazer Requisições Autenticadas

```javascript
const response = await fetch('http://localhost:3000/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 'minha-sessao-123',
    name: 'Minha Sessão WhatsApp'
  })
});
```

### 3. Usar com curl/PowerShell

```bash
# Com token válido
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","name":"Test Session"}'
```

```powershell
# PowerShell
$headers = @{ Authorization = "Bearer YOUR_FIREBASE_ID_TOKEN" }
$body = @{ id = "test123"; name = "Test Session" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

## 🛠️ Modo Desenvolvimento

Para facilitar o desenvolvimento local, o sistema possui um **modo de desenvolvimento** que:

### Características:
- ✅ **Ativa automaticamente** quando `NODE_ENV=development`
- ✅ **Aceita tokens inválidos** e cria usuário de desenvolvimento
- ✅ **Logs informativos** sobre modo ativo
- ✅ **Usuário padrão**: `dev@example.com` com UID `dev-user`

### Como Funciona:

```typescript
// Quando token é inválido em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('⚠️  Modo desenvolvimento: Pulando autenticação Firebase');
  req.user = {
    uid: 'dev-user',
    email: 'dev@example.com',
    name: 'Usuário de Desenvolvimento'
  };
  next();
  return;
}
```

### Teste de Desenvolvimento:

```bash
# Token falso será aceito em modo dev
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer fake-token-for-dev" \
  -H "Content-Type: application/json" \
  -d '{"id":"dev123","name":"Dev Session"}'
```

## 🔒 Rotas Protegidas

### Níveis de Proteção:

| Rota | Proteção | Descrição |
|------|----------|-----------|
| `POST /sessions` | **Obrigatória** | Criar sessão requer autenticação |
| `DELETE /sessions/:id` | **Obrigatória** | Deletar sessão requer autenticação |
| `GET /sessions` | **Opcional** | Lista suas sessões se autenticado |
| `GET /sessions/:id/status` | **Opcional** | Status público, detalhes se autenticado |
| `GET /auth/status` | **Opcional** | Mostra status de autenticação |
| `POST /auth/verify` | **Obrigatória** | Verificar se token é válido |

### Implementação:

```typescript
// Rota obrigatória
router.post('/', authenticateToken, sessionController.createSession);

// Rota opcional
router.get('/', optionalAuth, sessionController.listSessions);
```

## 📱 Integração com Sessões

### Associação Usuário-Sessão

Quando um usuário autenticado cria uma sessão:

```typescript
const newSession: Session = { 
  id: 'user-session-123',
  name: 'Minha Sessão',
  userId: user.uid,           // UID do Firebase
  userEmail: user.email,      // Email do usuário
  createdAt: new Date()
};
```

### Filtragem por Usuário

As sessões são filtradas automaticamente:

```typescript
// Usuário autenticado: vê apenas suas sessões + sessões sem dono
const filteredSessions = user 
  ? sessions.filter(session => 
      session.userId === user.uid || !session.userId
    )
  : sessions; // Modo dev: vê todas
```

## 🧪 Exemplos de Uso

### 1. Verificar Status de Autenticação

```bash
curl http://localhost:3000/auth/status
```

**Resposta:**
```json
{
  "success": true,
  "message": "API de autenticação funcionando",
  "authenticated": false,
  "user": null,
  "timestamp": "2025-08-06T21:59:03.889Z"
}
```

### 2. Criar Sessão (Modo Dev)

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer fake-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","name":"Test Session"}'
```

**Resposta:**
```json
{
  "message": "Sessão criada com sucesso",
  "session": {
    "id": "test123",
    "name": "Test Session",
    "userId": "dev-user"
  },
  "status": "initializing",
  "createdBy": "dev@example.com"
}
```

### 3. Listar Sessões

```bash
curl http://localhost:3000/sessions
```

**Resposta:**
```json
{
  "total": 1,
  "totalGlobal": 1,
  "sessions": [
    {
      "id": "test123",
      "name": "Test Session",
      "userId": "dev-user",
      "userEmail": "dev@example.com",
      "isActive": true,
      "hasQRCode": true
    }
  ],
  "user": null
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. "Token de acesso requerido"
**Problema:** Esqueceu de enviar o header Authorization
```bash
# ❌ Erro
curl -X POST http://localhost:3000/sessions

# ✅ Correto
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. "Token inválido ou expirado"
**Problema:** Token Firebase expirado ou malformado
- **Solução:** Gere novo token no cliente
- **Modo Dev:** Token falso será aceito

#### 3. Firebase Admin não inicializa
**Problema:** Credenciais não configuradas
```bash
# Configurar service account (produção)
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Ou usar credenciais default no Google Cloud
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### Logs de Debug

O sistema gera logs informativos:

```
🔐 Firebase Admin inicializado com sucesso!
🔓 Usuário autenticado: user@example.com (firebase-uid-123)
⚠️  Modo desenvolvimento: Pulando autenticação Firebase
❌ Erro na autenticação: FirebaseAuthError: Token invalid
👤 Sessão 'test123' criada pelo usuário: dev@example.com
```

### Verificar Configuração

```bash
# Verificar variáveis de ambiente
echo $NODE_ENV
echo $PORT
echo $FIREBASE_SERVICE_ACCOUNT_KEY

# Testar conectividade Firebase
curl -X POST http://localhost:3000/auth/verify \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

## 🔄 Configuração para Produção

### 1. Configurar Service Account

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em Project Settings > Service Accounts
3. Generate New Private Key
4. Configure a variável de ambiente:

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"clientlogin-33401",...}'
```

### 2. Configurar Ambiente

```bash
export NODE_ENV=production
export PORT=3000
```

### 3. Desabilitar Modo Dev

Em produção (`NODE_ENV=production`), tokens inválidos retornarão erro 401:

```json
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

## 📚 Referências

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [ID Token Verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)

---

**Desenvolvido com ❤️ para o Bot WhatsApp Multi-Sessões**

> 📧 Para dúvidas ou suporte, consulte os logs da aplicação ou abra uma issue no repositório.
