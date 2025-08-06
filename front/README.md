# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 📱 Bot WhatsApp Frontend

Frontend React + TypeScript + Tailwind CSS para gerenciar múltiplas sessões do WhatsApp Web através da API REST.

## 🚀 Funcionalidades

- ✅ Dashboard moderno e responsivo
- ✅ Criação de novas sessões WhatsApp
- ✅ Visualização de QR codes em modal/página dedicada
- ✅ Lista de sessões com status em tempo real
- ✅ Monitoramento de conexão com a API
- ✅ Gerenciamento completo de sessões (criar, visualizar, remover)
- ✅ Interface intuitiva e acessível

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Styling
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **ESLint** - Linting

## 📦 Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure a URL da API:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# URL da API do WhatsApp Bot
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar em Desenvolvimento
```bash
npm run dev
```

### 4. Build para Produção
```bash
npm run build
```

### 5. Preview da Build
```bash
npm run preview
```

## 🎯 Componentes Principais

### 📋 Dashboard (Home)
- **Localização**: `src/components/home.tsx`
- **Função**: Página principal com lista de sessões e controles
- **Features**: 
  - Lista de sessões em cards
  - Botão para criar nova sessão
  - Atualização automática de status
  - Acesso rápido aos QR codes

### 🆔 Header
- **Localização**: `src/components/ui/Header.tsx`
- **Função**: Cabeçalho com navegação e status da API
- **Features**:
  - Indicador de conexão com API
  - Botão para criar sessão
  - Botão para atualizar dados

### 📱 Lista de Sessões
- **Localização**: `src/components/ui/SessionList.tsx`
- **Função**: Exibe todas as sessões criadas
- **Features**:
  - Cards responsivos para cada sessão
  - Status em tempo real (conectado, aguardando QR, desconectado)
  - Botões para ver QR code e remover sessão
  - Loading states e error handling

### 🔄 Modal de Criação
- **Localização**: `src/components/ui/CreateSessionModal.tsx`
- **Função**: Modal para criar novas sessões
- **Features**:
  - Formulário com validação
  - Input para ID e nome da sessão
  - Feedback visual de loading e erros

### 📷 Modal de QR Code
- **Localização**: `src/components/ui/QRCodeModal.tsx`
- **Função**: Modal para exibir QR codes
- **Features**:
  - QR code atualizado em tempo real
  - Botão para download da imagem
  - Instruções de uso
  - Atualização manual do código

### 📱 Página QR Code
- **Localização**: `src/components/ui/Qrcode.tsx`
- **Função**: Página dedicada para visualizar QR codes
- **Features**:
  - Seletor de sessões
  - QR code em tamanho grande
  - Instruções detalhadas de uso

## 🔌 Integração com API

### 🛠️ Service Layer
- **Localização**: `src/services/api.ts`
- **Função**: Centraliza todas as chamadas para a API
- **Endpoints suportados**:
  - `GET /` - Status da API
  - `POST /sessions` - Criar sessão
  - `GET /sessions` - Listar sessões
  - `GET /sessions/:id/status` - Status da sessão
  - `GET /sessions/:id/qr` - QR code com metadados
  - `GET /sessions/:id/qr/base64` - QR code em base64
  - `DELETE /sessions/:id` - Remover sessão

### 📝 Types
- **Localização**: `src/types/api.ts`
- **Função**: Definições TypeScript para todas as interfaces da API

## 🎨 Estrutura de Estilos

O projeto usa **Tailwind CSS** com as seguintes configurações principais:

### Cores
- **Verde primário**: `green-600` (#059669) - Cor principal do WhatsApp
- **Cinza**: Tons variados para texto e backgrounds
- **Status cores**:
  - Conectado: `green-500`
  - Aguardando: `yellow-500` 
  - Desconectado: `red-500`

### Layout Responsivo
- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2 colunas para cards
- **Desktop**: Grid 3 colunas para cards

## 📱 Funcionalidades Detalhadas

### 1. Criar Nova Sessão
```typescript
// Fluxo de criação
1. Usuário clica em "Nova Sessão"
2. Modal abre com formulário
3. Usuário preenche ID e nome
4. Sistema valida dados
5. Chama API POST /sessions
6. Sucesso: fecha modal e atualiza lista
7. Erro: exibe mensagem de erro
```

### 2. Visualizar QR Code
```typescript
// Fluxo de QR code
1. Usuário clica em "Ver QR Code" no card da sessão
2. Modal abre e carrega QR code da API
3. Exibe imagem base64 convertida
4. Usuário pode atualizar ou fazer download
5. QR code atualiza automaticamente se necessário
```

### 3. Gerenciar Status
```typescript
// Fluxo de status
1. Componente carrega status de cada sessão
2. Atualiza ícones e cores baseado no status
3. Permite atualização manual
4. Monitora mudanças em tempo real
```

## 🚨 Estados e Loading

### Loading States
- ✅ Loading inicial da lista de sessões
- ✅ Loading de criação de nova sessão
- ✅ Loading de QR codes
- ✅ Loading de status individual

### Error Handling
- ✅ Erros de conexão com API
- ✅ Erros de validação de formulário
- ✅ Erros de QR code não encontrado
- ✅ Feedback visual para todos os erros

### Success States
- ✅ Confirmação de sessão criada
- ✅ Indicador de status conectado
- ✅ QR code carregado com sucesso

## 🔧 Configuração Avançada

### Timeout de Requisições
```typescript
// Em src/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
});
```

### Intervalo de Verificação da API
```typescript
// Em src/components/ui/Header.tsx
useEffect(() => {
  checkAPIStatus();
  const interval = setInterval(checkAPIStatus, 30000); // 30 segundos
  return () => clearInterval(interval);
}, []);
```

## 📊 Estrutura de Arquivos

```
src/
├── components/
│   ├── home.tsx              # Página principal
│   └── ui/
│       ├── Header.tsx        # Cabeçalho
│       ├── SessionList.tsx   # Lista de sessões
│       ├── CreateSessionModal.tsx  # Modal criação
│       ├── QRCodeModal.tsx   # Modal QR code
│       └── Qrcode.tsx       # Página QR code
├── services/
│   └── api.ts               # Cliente API
├── types/
│   └── api.ts              # Interfaces TypeScript
├── App.tsx                 # Componente raiz
└── main.tsx               # Entry point
```

## 🌐 Uso em Produção

### 1. Build
```bash
npm run build
```

### 2. Configurar URL da API
Altere `VITE_API_URL` no arquivo `.env` para a URL de produção:
```env
VITE_API_URL=https://sua-api.com
```

### 3. Deploy
A pasta `dist/` contém todos os arquivos estáticos para deploy.

### 4. Servidor Web
Configure seu servidor web para:
- Servir arquivos estáticos da pasta `dist/`
- Redirecionar todas as rotas para `index.html` (SPA)

## 🔗 Exemplo de Integração

### Usar em Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Config
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de sessões WhatsApp Web**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
