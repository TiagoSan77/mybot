# 💳 Configuração do Mercado Pago

## 📋 Pré-requisitos

1. **Conta no Mercado Pago**: Criar uma conta no [Mercado Pago](https://www.mercadopago.com.br/)
2. **Aplicação no Painel de Desenvolvedores**: Acessar o [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers/panel)

## ⚙️ Configuração das Credenciais

### 1. Obter Access Token e Public Key

1. Acesse o [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers/panel/credentials)
2. Escolha sua aplicação ou crie uma nova
3. Copie o **Access Token** e **Public Key**
4. Configure no arquivo `.env`:

```properties
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. Configurar Webhook URL

O webhook é essencial para receber notificações automáticas do Mercado Pago quando o status de um pagamento muda.

#### Para Produção:
```properties
MERCADO_PAGO_WEBHOOK_URL=https://seudominio.com/payments/webhook/mercadopago
```

#### Para Desenvolvimento Local:

**Opção 1: Usar ngrok (Recomendado)**
1. Instalar ngrok: https://ngrok.com/
2. Executar: `ngrok http 3000`
3. Copiar a URL HTTPS fornecida
4. Configurar:
```properties
MERCADO_PAGO_WEBHOOK_URL=https://abc123.ngrok.io/payments/webhook/mercadopago
```

**Opção 2: Usar outro serviço de tunnel**
- Localtunnel: `npx localtunnel --port 3000`
- Serveo: `ssh -R 80:localhost:3000 serveo.net`

## 🔧 Configuração no Painel do Mercado Pago

### 1. Configurar Webhook na Aplicação

1. Acesse [Webhooks](https://www.mercadopago.com.br/developers/panel/webhooks)
2. Clique em "Criar webhook"
3. Configure:
   - **URL**: Sua URL de webhook (ex: `https://seudominio.com/payments/webhook/mercadopago`)
   - **Eventos**: Selecione "Pagamentos"
   - **Versão da API**: v1

### 2. Testar Webhook

Você pode testar se o webhook está funcionando:

1. **Via curl**:
```bash
curl -X POST https://sua-url/payments/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

2. **Via Postman**: Criar uma requisição POST para a URL do webhook

## 🛡️ Segurança

### 1. Validação de Webhook (Opcional)

Para maior segurança, você pode validar se o webhook realmente veio do Mercado Pago:

```typescript
// Adicionar no controller de webhook
const validateWebhook = (signature: string, dataId: string) => {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  // Implementar validação de assinatura
};
```

### 2. Variáveis de Ambiente Seguras

- **Nunca** commitar as credenciais no código
- Usar diferentes credenciais para desenvolvimento e produção
- Rotacionar credenciais periodicamente

## 🚨 Troubleshooting

### Webhook não está recebendo notificações:

1. **Verificar URL**: Certifique-se que a URL está acessível publicamente
2. **Verificar HTTPS**: O Mercado Pago só envia para URLs HTTPS
3. **Verificar logs**: Verificar logs do servidor para erros
4. **Testar manualmente**: Usar curl ou Postman para testar

### Pagamentos não são criados:

1. **Verificar credenciais**: Access Token correto e ativo
2. **Verificar ambiente**: Usar credenciais de produção em produção
3. **Verificar logs**: Verificar erros no console do backend

### Timeout em pagamentos:

1. **Verificar conectividade**: Internet estável
2. **Verificar rate limits**: Não exceder limites da API
3. **Implementar retry**: Para requisições que falharam

## 📚 Recursos Úteis

- [Documentação Oficial](https://www.mercadopago.com.br/developers/pt/docs)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Simulador de Pagamentos](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-integration)
- [Status de Pagamentos](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/response-handling)

## 🔄 Fluxo Completo de Pagamento

1. **Frontend**: Usuário seleciona plano e clica em "Pagar"
2. **Backend**: Cria pagamento PIX no Mercado Pago
3. **Frontend**: Exibe QR Code e código PIX
4. **Usuário**: Paga via PIX no banco
5. **Mercado Pago**: Processa pagamento
6. **Webhook**: Mercado Pago notifica nosso backend
7. **Backend**: Atualiza status e ativa assinatura
8. **Frontend**: Atualiza interface automaticamente
