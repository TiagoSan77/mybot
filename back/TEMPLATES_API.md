# API de Templates de Mensagem

Esta API permite criar, gerenciar e usar templates de mensagens pré-prontas para o sistema WhatsApp Bot.

## Endpoints Disponíveis

### Base URL
```
http://localhost:3000/templates
```

### Autenticação
Todas as rotas requerem autenticação via Firebase Auth Token no header:
```
Authorization: Bearer <firebase_token>
```

## 📝 Criar Template

**POST** `/templates`

```json
{
  "name": "Bom Dia",
  "content": "Bom dia! Como posso ajudá-lo hoje? 😊",
  "category": "Saudações",
  "tags": ["bom dia", "cumprimento", "atendimento"]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Template criado com sucesso",
  "data": {
    "templateId": "uuid-generated",
    "name": "Bom Dia",
    "content": "Bom dia! Como posso ajudá-lo hoje? 😊",
    "category": "Saudações",
    "tags": ["bom dia", "cumprimento", "atendimento"],
    "isActive": true,
    "usageCount": 0,
    "createdAt": "2025-08-08T10:00:00.000Z"
  }
}
```

## 📋 Listar Templates

**GET** `/templates`

**Parâmetros de Query (opcionais):**
- `category` - Filtrar por categoria
- `active` - Filtrar por status ativo (true/false)
- `search` - Buscar por nome, conteúdo ou tags

**Exemplos:**
```
GET /templates
GET /templates?category=Saudações
GET /templates?active=true
GET /templates?search=bom dia
```

**Resposta:**
```json
{
  "success": true,
  "message": "Templates recuperados com sucesso",
  "data": {
    "templates": [
      {
        "templateId": "uuid-1",
        "name": "Bom Dia",
        "content": "Bom dia! Como posso ajudá-lo hoje? 😊",
        "category": "Saudações",
        "tags": ["bom dia", "cumprimento"],
        "isActive": true,
        "usageCount": 5,
        "createdAt": "2025-08-08T10:00:00.000Z",
        "updatedAt": "2025-08-08T10:00:00.000Z"
      }
    ],
    "categorized": {
      "Saudações": [
        { /* template data */ }
      ],
      "Despedidas": [
        { /* template data */ }
      ]
    },
    "total": 1
  }
}
```

## 🔍 Obter Template Específico

**GET** `/templates/:templateId`

**Resposta:**
```json
{
  "success": true,
  "message": "Template encontrado",
  "data": {
    "templateId": "uuid-1",
    "name": "Bom Dia",
    "content": "Bom dia! Como posso ajudá-lo hoje? 😊",
    "category": "Saudações",
    "tags": ["bom dia", "cumprimento"],
    "isActive": true,
    "usageCount": 5,
    "createdAt": "2025-08-08T10:00:00.000Z",
    "updatedAt": "2025-08-08T10:00:00.000Z"
  }
}
```

## ✏️ Atualizar Template

**PUT** `/templates/:templateId`

```json
{
  "name": "Bom Dia Atualizado",
  "content": "Bom dia! Como está? Posso ajudá-lo? 😊",
  "category": "Saudações",
  "tags": ["bom dia", "cumprimento", "cordial"],
  "isActive": true
}
```

## 🗑️ Deletar Template

**DELETE** `/templates/:templateId`

**Resposta:**
```json
{
  "success": true,
  "message": "Template deletado com sucesso"
}
```

## 📊 Registrar Uso do Template

**POST** `/templates/:templateId/use`

Incrementa o contador de uso quando o template é utilizado.

**Resposta:**
```json
{
  "success": true,
  "message": "Uso do template registrado",
  "data": {
    "templateId": "uuid-1",
    "usageCount": 6
  }
}
```

## 📁 Obter Categorias

**GET** `/templates/categories`

**Resposta:**
```json
{
  "success": true,
  "message": "Categorias recuperadas com sucesso",
  "data": {
    "categories": ["Saudações", "Despedidas", "Informações", "Promoções"]
  }
}
```

## Exemplos de Uso

### 1. Fluxo Completo de Criação e Uso

```javascript
// 1. Criar template
const template = await whatsappAPI.createTemplate({
  name: "Agradecimento",
  content: "Obrigado pelo seu contato! Em breve retornaremos.",
  category: "Atendimento",
  tags: ["agradecimento", "contato"]
});

// 2. Listar templates
const templates = await whatsappAPI.getTemplates();

// 3. Usar template em uma mensagem
await whatsappAPI.sendMessage({
  sessionId: "session-1",
  phoneNumber: "5511999999999",
  message: template.data.content
});

// 4. Registrar uso
await whatsappAPI.incrementTemplateUsage(template.data.templateId);
```

### 2. Buscar Templates por Categoria

```javascript
const saudacoes = await whatsappAPI.getTemplates({
  category: "Saudações",
  active: true
});
```

### 3. Buscar Templates por Texto

```javascript
const templates = await whatsappAPI.getTemplates({
  search: "bom dia"
});
```

## Casos de Uso Recomendados

### Templates Básicos Sugeridos:

1. **Saudações**
   - "Bom dia! Como posso ajudá-lo?"
   - "Boa tarde! Em que posso ser útil?"
   - "Boa noite! Como vai?"

2. **Despedidas**
   - "Tenha um ótimo dia!"
   - "Até breve!"
   - "Obrigado pelo contato!"

3. **Informações**
   - "Nosso horário de funcionamento é..."
   - "Você pode encontrar mais informações em..."
   - "Para mais detalhes, acesse..."

4. **Atendimento**
   - "Aguarde um momento, por favor..."
   - "Vou verificar para você..."
   - "Obrigado pela sua paciência!"

5. **Promoções**
   - "Oferta especial só hoje!"
   - "Desconto exclusivo para você!"
   - "Não perca esta oportunidade!"

### Integração com Frontend

No frontend, você pode criar uma interface para:
- Gerenciar templates por categoria
- Buscar templates rapidamente
- Aplicar templates diretamente no envio de mensagens
- Ver estatísticas de uso dos templates
- Criar templates personalizados
