# 🔥 Integração Firebase Authentication - Frontend

## 📋 Visão Geral

O frontend foi completamente adaptado para usar **Firebase Authentication**, proporcionando autenticação segura e sincronizada com o backend.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação Firebase
- **Login** com email e senha
- **Registro** de novos usuários
- **Logout** seguro
- **Persistência de sessão** automática
- **Gerenciamento de tokens** ID para API

### ✅ Interface Moderna
- **Tela de loading** durante inicialização
- **Toggle login/registro** na mesma tela
- **Tratamento de erros** Firebase específicos
- **Informações do usuário** logado

### ✅ Integração com API
- **Interceptor automático** para adicionar tokens
- **Sincronização** entre Firebase e backend
- **Headers Authorization** automáticos

## 🏗️ Arquitetura

### Context API
```
AuthContext
├── Firebase Auth State
├── Login/Register methods
├── Token management
└── Loading states
```

### Fluxo de Autenticação
```mermaid
graph TD
    A[App Start] --> B[AuthProvider]
    B --> C{Firebase Loading?}
    C -->|Yes| D[LoadingScreen]
    C -->|No| E{User Authenticated?}
    E -->|No| F[Landing/Login]
    E -->|Yes| G[Dashboard]
    F --> H[Firebase Login]
    H --> I[Get ID Token]
    I --> J[Configure API]
    J --> G
```

## 🔧 Componentes Atualizados

### 1. AuthContext (`/src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
}
```

**Funcionalidades:**
- Gerenciamento de estado do usuário Firebase
- Métodos de autenticação encapsulados
- Loading state durante inicialização
- Geração de tokens ID para API

### 2. Login Component (`/src/components/login.tsx`)
```typescript
// Antes (localStorage)
localStorage.setItem('isAuthenticated', 'true');

// Agora (Firebase)
await login(formData.email, formData.password);
const token = await getIdToken();
whatsappAPI.setAuthToken(token);
```

**Novidades:**
- **Toggle Login/Registro** na mesma tela
- **Tratamento de erros** Firebase específicos
- **Validação de email** automática
- **Interface melhorada** com informações do Firebase

### 3. API Service (`/src/services/api.ts`)
```typescript
// Interceptor automático
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Novo método
setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('firebaseToken', token);
  } else {
    localStorage.removeItem('firebaseToken');
  }
}
```

### 4. Protected Routes (`/src/components/ProtectedRoute.tsx`)
```typescript
// Antes
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

// Agora
const { user } = useAuth();
if (!user) return <Navigate to="/login" replace />;
```

### 5. Dashboard Component (`/src/components/Dashboard.tsx`)
```typescript
// Configuração automática de token
useEffect(() => {
  const setupAuthToken = async () => {
    if (user) {
      const token = await getIdToken();
      whatsappAPI.setAuthToken(token);
    }
  };
  setupAuthToken();
}, [user, getIdToken]);
```

## 🎨 Novas Interfaces

### Loading Screen
```typescript
// Exibido durante inicialização do Firebase
<LoadingScreen />
```

### User Info Component
```typescript
// Mostra informações detalhadas do usuário
<UserInfo />
```

### Login/Register Toggle
```typescript
{isRegisterMode 
  ? 'Já tem uma conta? Fazer login' 
  : 'Não tem conta? Criar uma agora'
}
```

## 🔒 Tratamento de Erros Firebase

### Códigos de Erro Mapeados
```typescript
switch (error.code) {
  case 'auth/user-not-found':
    setError('Usuário não encontrado');
    break;
  case 'auth/wrong-password':
    setError('Senha incorreta');
    break;
  case 'auth/email-already-in-use':
    setError('Este email já está em uso');
    break;
  case 'auth/weak-password':
    setError('A senha deve ter pelo menos 6 caracteres');
    break;
  case 'auth/invalid-email':
    setError('Email inválido');
    break;
  default:
    setError('Erro de autenticação');
}
```

## ⚙️ Configuração

### Variáveis de Ambiente
```env
# .env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=AIzaSyBFredZwbgA0NefOoOfgkrWKRz0AxY4cG8
VITE_FIREBASE_AUTH_DOMAIN=clientlogin-33401.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=clientlogin-33401
VITE_FIREBASE_STORAGE_BUCKET=clientlogin-33401.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=691644671893
VITE_FIREBASE_APP_ID=1:691644671893:web:34b40ab7b9bda7a96bb6bb
```

### Firebase Config
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

## 🚀 Como Usar

### 1. Primeira Execução
```bash
# Instalar dependências (já feito)
npm install

# Configurar .env com credenciais Firebase
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar desenvolvimento
npm run dev
```

### 2. Criar Nova Conta
1. Acesse `http://localhost:5173`
2. Clique em "Fazer Login"
3. Clique em "Não tem conta? Criar uma agora"
4. Digite email e senha (mín. 6 caracteres)
5. Clique em "Criar Conta"

### 3. Fazer Login
1. Digite email e senha de conta existente
2. Clique em "Fazer Login"
3. Sistema redirecionará para dashboard

### 4. Logout
1. No dashboard, clique em "Sair"
2. Confirme a ação
3. Sistema fará logout do Firebase e limpará tokens

## 🔄 Sincronização Frontend-Backend

### Fluxo Completo
```mermaid
sequenceDiagram
    participant F as Frontend
    participant FB as Firebase Auth
    participant API as Backend API
    
    F->>FB: Login com email/senha
    FB->>F: Retorna User + ID Token
    F->>F: Salva token no localStorage
    F->>API: Request com Authorization: Bearer {token}
    API->>FB: Valida token com Firebase Admin
    FB->>API: Confirma usuário válido
    API->>F: Resposta com dados do usuário
```

### Headers Automáticos
```typescript
// Toda requisição para API inclui automaticamente:
Authorization: Bearer {firebase_id_token}
```

### Renovação de Token
```typescript
// Token é renovado automaticamente pelo Firebase
const token = await user.getIdToken(true); // força renovação
```

## 🛡️ Segurança

### Tokens ID
- **Gerados pelo Firebase** para cada usuário
- **Validados no backend** com Firebase Admin SDK
- **Renovados automaticamente** quando necessário
- **Removidos no logout** para segurança

### Dados do Usuário
```typescript
interface User {
  uid: string;           // ID único Firebase
  email: string;         // Email do usuário
  emailVerified: boolean;// Status de verificação
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}
```

## 🎯 Benefícios da Migração

### ✅ Antes (localStorage)
- Autenticação mock
- Sem validação real
- Dados não persistentes
- Sem sincronização

### 🚀 Agora (Firebase)
- **Autenticação real** e segura
- **Validação robusta** de credenciais
- **Persistência automática** entre sessões
- **Sincronização total** frontend-backend
- **Gerenciamento de usuários** profissional
- **Recuperação de senha** (pode ser implementada)
- **Verificação de email** disponível

## 📱 Interface Atualizada

### Landing Page
- Mantida igual, mas agora redireciona para Firebase login

### Login/Register
- **Interface unificada** com toggle
- **Validação em tempo real**
- **Feedback específico** para cada erro
- **Loading states** durante autenticação

### Dashboard
- **Nome/email do usuário** logado
- **Token sincronizado** automaticamente
- **Logout seguro** com limpeza completa

### Headers
- **Status Firebase** integrado
- **Navegação preservada**

## 🔧 Manutenção

### Logs de Debug
O sistema gera logs úteis para debug:
```javascript
console.log('Usuário logado:', user);
console.log('Token gerado:', token);
console.error('Erro Firebase:', error.code);
```

### Monitoramento
- Estado de loading global
- Erros de autenticação tratados
- Reconexão automática
- Persistência de sessão

---

## 🎉 **Sistema Firebase Implementado!**

O frontend agora está **completamente integrado** com Firebase Authentication, oferecendo:

- ✅ **Autenticação segura** e profissional
- ✅ **Interface moderna** e responsiva  
- ✅ **Sincronização perfeita** com backend
- ✅ **Gerenciamento de tokens** automático
- ✅ **Experiência de usuário** aprimorada
- ✅ **Segurança de nível empresarial**

A aplicação está pronta para uso em produção com autenticação Firebase!
