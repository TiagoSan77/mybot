# 📁 Estrutura Organizacional do Projeto

## 🏗️ Nova Arquitetura

```
src/
├── app.ts                 # Configuração principal da aplicação
├── index.ts               # Ponto de entrada da aplicação
├── config/
│   └── database.ts        # Configuração do MongoDB
├── controllers/
│   ├── sessionController.ts   # Controlador de sessões
│   └── qrController.ts        # Controlador de QR codes
├── routes/
│   ├── index.ts              # Roteador principal
│   ├── sessionRoutes.ts      # Rotas de sessões
│   └── qrRoutes.ts           # Rotas de QR codes
├── services/
│   └── whatsappService.ts    # Lógica de negócio do WhatsApp
├── types/
│   └── session.ts            # Definições de tipos TypeScript
└── cliente.ts.backup         # Arquivo antigo (backup)
```

## 📋 Responsabilidades

### **🎯 Controllers**
- **SessionController**: Gerencia requisições HTTP relacionadas às sessões
- **QRController**: Gerencia requisições HTTP relacionadas aos QR codes

### **🛠️ Services**
- **WhatsAppService**: Contém toda a lógica de negócio do WhatsApp (Singleton)
  - Gerenciamento de sessões
  - Eventos do WhatsApp
  - QR codes

### **🔧 Config**
- **DatabaseConfig**: Configuração e conexão com MongoDB (Singleton)

### **🚏 Routes**
- **index.ts**: Router principal que agrupa todas as rotas
- **sessionRoutes.ts**: Rotas específicas para sessões
- **qrRoutes.ts**: Rotas específicas para QR codes

### **📝 Types**
- **session.ts**: Interfaces e tipos TypeScript

### **🚀 App & Index**
- **app.ts**: Classe principal da aplicação
- **index.ts**: Ponto de entrada que inicializa a aplicação

## 🔄 Padrões Utilizados

### **Singleton Pattern**
- `WhatsAppService`: Garante uma única instância
- `DatabaseConfig`: Garante uma única conexão com o banco

### **MVC Architecture**
- **Models**: Tipos TypeScript e MongoDB
- **Views**: Respostas JSON da API
- **Controllers**: Controladores que processam requisições

### **Dependency Injection**
- Services são injetados nos controllers
- Configurações são centralizadas

## 🎯 Vantagens da Nova Estrutura

### ✅ **Organização**
- Código separado por responsabilidade
- Fácil manutenção e localização

### ✅ **Escalabilidade**
- Fácil adição de novos recursos
- Estrutura preparada para crescimento

### ✅ **Testabilidade**
- Services isolados podem ser testados unitariamente
- Controllers podem ser testados independentemente

### ✅ **Reutilização**
- Services podem ser reutilizados em diferentes contextos
- Configurações centralizadas

### ✅ **Tipagem**
- TypeScript com tipos bem definidos
- IntelliSense melhorado

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npx tsc

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 🔧 Configuração

1. **Copie o arquivo de exemplo:**
```bash
cp .env.example .env
```

2. **Configure as variáveis de ambiente no `.env`:**
```env
PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb
BACKUP_SYNC_INTERVAL=300000
```

## 📊 Benefícios Técnicos

### **Separação de Responsabilidades**
- Cada arquivo tem uma responsabilidade específica
- Código mais limpo e organizad

### **Facilidade de Manutenção**
- Alterações em uma funcionalidade não afetam outras
- Debug mais fácil

### **Preparado para Testes**
- Estrutura facilita criação de testes unitários
- Services podem ser mockados facilmente

### **Escalabilidade**
- Fácil adição de novos controllers
- Novos services podem ser criados facilmente

Esta estrutura segue as melhores práticas de desenvolvimento Node.js/TypeScript e está preparada para crescer conforme o projeto evolui! 🚀
