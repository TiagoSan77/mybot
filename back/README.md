# 📱 Bot WhatsApp Multi-Sessões

Uma API REST para gerenciar múltiplas sessões do WhatsApp Web simultaneamente, com suporte a QR codes em base64 e armazenamento MongoDB.

## 🚀 Funcionalidades

- ✅ Múltiplas sessões WhatsApp simultâneas
- ✅ QR codes em formato base64
- ✅ Armazenamento persistente no MongoDB
- ✅ API REST completa
- ✅ Gerenciamento de sessões via HTTP
- ✅ Status em tempo real das sessões

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **whatsapp-web.js** - Integração WhatsApp Web
- **MongoDB** + **Mongoose** - Banco de dados
- **wwebjs-mongo** - Store para sessões
- **qrcode** - Geração de QR codes

## 📦 Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd back

# Instalar dependências
npm install

# Compilar TypeScript
npx tsc

# Iniciar em desenvolvimento
npm run dev

# Ou iniciar em produção
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` com:

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

### MongoDB
- O sistema cria automaticamente a collection `whatsappSessions`
- Cada sessão é identificada por um `clientId` único

## 📚 API Endpoints

### 🏠 Status da API

#### `GET /`
Verifica se a API está funcionando.

**Resposta:**
```
Bot WhatsApp Multi-Sessões - API funcionando!
```

---

### 👥 Gerenciamento de Sessões

#### `POST /sessions`
Cria uma nova sessão WhatsApp.

**Body:**
```json
{
  "id": "sessao-cliente-1",
  "name": "Cliente João"
}
```

**Resposta (201):**
```json
{
  "message": "Sessão criada com sucesso",
  "session": {
    "id": "sessao-cliente-1",
    "name": "Cliente João"
  },
  "status": "initializing"
}
```

**Erros:**
- `400` - ID ou nome faltando
- `409` - Sessão já existe
- `500` - Erro interno

---

#### `GET /sessions`
Lista todas as sessões criadas.

**Resposta:**
```json
{
  "total": 2,
  "sessions": [
    {
      "id": "sessao-cliente-1",
      "name": "Cliente João",
      "isActive": true,
      "hasQRCode": false
    },
    {
      "id": "sessao-cliente-2", 
      "name": "Cliente Maria",
      "isActive": false,
      "hasQRCode": true
    }
  ]
}
```

---

#### `GET /sessions/:id/status`
Verifica o status de uma sessão específica.

**Resposta:**
```json
{
  "session": {
    "id": "sessao-cliente-1",
    "name": "Cliente João"
  },
  "status": "connected",
  "isActive": true,
  "hasQRCode": false
}
```

**Status possíveis:**
- `waiting_qr` - Aguardando escaneamento
- `connected` - Conectado e autenticado
- `disconnected` - Desconectado

---

#### `DELETE /sessions/:id`
Remove uma sessão e desconecta o cliente.

**Resposta:**
```json
{
  "message": "Sessão 'sessao-cliente-1' removida com sucesso"
}
```

---

### 📱 QR Code

#### `GET /sessions/:id/qr`
Obtém o QR code com metadados completos.

**Resposta:**
```json
{
  "sessionId": "sessao-cliente-1",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "Escaneie este QR Code com seu WhatsApp"
}
```

---

#### `GET /sessions/:id/qr/base64` ⭐
Retorna apenas o código base64 (sem prefixo data:image).

**Resposta:**
```
iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAADqcMl5AAAAAk...
```

**Content-Type:** `text/plain`

**Uso em HTML:**
```html
<img src="data:image/png;base64,CODIGO_BASE64_AQUI" alt="QR Code" />
```

---

#### `GET /sessions/:id/qr/image`
Retorna a imagem PNG diretamente.

**Content-Type:** `image/png`

**Uso em HTML:**
```html
<img src="/sessions/sessao-cliente-1/qr/image" alt="QR Code" />
```

---

## 🔄 Fluxo de Uso

### 1. Criar Sessão
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"id":"cliente1","name":"João Silva"}'
```

### 2. Obter QR Code
```bash
# Opção 1: Base64 puro
curl http://localhost:3000/sessions/cliente1/qr/base64

# Opção 2: JSON completo
curl http://localhost:3000/sessions/cliente1/qr

# Opção 3: Imagem PNG
curl http://localhost:3000/sessions/cliente1/qr/image -o qrcode.png
```

### 3. Verificar Status
```bash
curl http://localhost:3000/sessions/cliente1/status
```

### 4. Listar Todas
```bash
curl http://localhost:3000/sessions
```

### 5. Remover Sessão
```bash
curl -X DELETE http://localhost:3000/sessions/cliente1
```

---

## 🌐 Exemplos Frontend

### JavaScript/Fetch
```javascript
// Criar sessão
const response = await fetch('/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'cliente1', name: 'João' })
});

// Obter QR code base64
const qrBase64 = await fetch('/sessions/cliente1/qr/base64')
  .then(res => res.text());

// Exibir QR code
document.getElementById('qr').src = `data:image/png;base64,${qrBase64}`;
```

### React
```jsx
function WhatsAppSession({ sessionId }) {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    fetch(`/sessions/${sessionId}/qr/base64`)
      .then(res => res.text())
      .then(base64 => setQrCode(`data:image/png;base64,${base64}`));
  }, [sessionId]);

  return (
    <div>
      <h3>Sessão: {sessionId}</h3>
      {qrCode && <img src={qrCode} alt="QR Code WhatsApp" />}
    </div>
  );
}
```

---

## 📊 Monitoramento

### Logs do Servidor
```
🚀 Servidor rodando na porta 3000
📱 API de Sessões WhatsApp disponível em http://localhost:3000
MongoDB conectado com sucesso!
QR Code gerado para Cliente João (cliente1)
QR Code Base64 para Cliente João (cliente1) gerado
Cliente João (cliente1) está pronto!
Cliente João (cliente1) autenticado com sucesso!
```

### Arquivos Gerados
- `qr-{sessionId}.txt` - QR codes salvos localmente
- `.wwebjs_auth/` - Dados de autenticação (criado automaticamente)

---

## 🗄️ Estrutura do Banco

### Collection: `whatsappSessions`
```json
{
  "_id": "cliente1",
  "data": {
    "WABrowserId": "...",
    "WASecretBundle": "...",
    "WAToken1": "...",
    "WAToken2": "..."
  },
  "clientId": "cliente1",
  "createdAt": "2025-08-06T10:30:00.000Z",
  "updatedAt": "2025-08-06T10:35:00.000Z"
}
```

---

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Dados inválidos ou faltando |
| `404` | Sessão ou QR code não encontrado |
| `409` | Sessão já existe |
| `500` | Erro interno do servidor |

---

## 🔧 Scripts NPM

```json
{
  "dev": "ts-node-dev src/index.ts",
  "build": "npx tsc",
  "start": "node dist/index.js"
}
```

---

## 📝 Notas Importantes

1. **QR Codes expiram** - Gere novos se necessário
2. **Uma sessão por dispositivo** - Cada ID deve ser único
3. **Persistência** - Sessões são salvas no MongoDB
4. **Reconexão automática** - O sistema tenta reconectar automaticamente
5. **Arquivos locais** - QR codes são salvos como backup

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Confirme a conexão com MongoDB  
3. Valide os dados enviados para a API
4. Verifique se a porta 3000 está livre

**Desenvolvido com ❤️ para facilitar a integração com WhatsApp Web**
