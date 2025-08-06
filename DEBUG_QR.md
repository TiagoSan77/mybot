# 🔧 Debug do Sistema QR Code

## Passos para Resolver o Problema

### 1. ✅ **Verificar se o Backend está Rodando**
```bash
curl http://localhost:3000
```

### 2. ✅ **Verificar se o Frontend está Conectado**
```bash
curl http://localhost:5173
```

### 3. 🔍 **Verificar Logs do Backend**
- Procure por mensagens como:
  - `🔍 QR Base64 solicitado`
  - `❌ QR Base64: Usuário não autenticado`
  - `❌ QR Base64: Sessão não encontrada`

### 4. 🔧 **Possíveis Problemas e Soluções**

#### **Problema 1: Token não enviado**
- **Sintoma**: `❌ QR Base64: Usuário não autenticado`
- **Solução**: Verificar se o usuário está logado no Firebase

#### **Problema 2: Sessão não encontrada**
- **Sintoma**: `❌ QR Base64: Sessão não encontrada`
- **Solução**: Criar uma sessão primeiro

#### **Problema 3: Sessão não pertence ao usuário**
- **Sintoma**: `❌ QR Base64: Acesso negado`
- **Solução**: Verificar se a sessão foi criada pelo usuário logado

#### **Problema 4: QR Code não gerado**
- **Sintoma**: `❌ QR Base64: QR Code não disponível`
- **Solução**: Aguardar a inicialização da sessão WhatsApp

### 5. 🧪 **Teste Passo a Passo**

1. **Faça Login no Frontend**
2. **Crie uma Nova Sessão**
3. **Aguarde alguns segundos**
4. **Tente visualizar o QR Code**
5. **Verifique os logs do backend**

### 6. 📊 **Comandos de Debug**

```bash
# Ver processos na porta 3000
netstat -ano | findstr :3000

# Ver processos na porta 5173  
netstat -ano | findstr :5173

# Testar API diretamente
curl http://localhost:3000/sessions
```

### 7. 🔗 **URLs para Testar**

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- API Sessions: http://localhost:3000/sessions
- API Auth: http://localhost:3000/auth/status

---

## 📝 **Logs Esperados (Backend)**

```
✅ Sessão 'teste-123' criada pelo usuário: usuario@email.com
🔍 QR Base64 solicitado - SessionID: teste-123, User: usuario@email.com
✅ QR Base64: Enviando QR para sessão 'teste-123' do usuário usuario@email.com
```

## 🚨 **Se Ainda Não Funcionar**

1. Reinicie o backend
2. Reinicie o frontend
3. Limpe o cache do navegador
4. Verifique se o Firebase está configurado corretamente
5. Teste com um usuário diferente
