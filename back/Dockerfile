# ===================================
# STAGE 1: Build
# ===================================
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npx tsc

# ===================================
# STAGE 2: Production
# ===================================
FROM node:18-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whatsapp -u 1001

# Instalar dependências necessárias para WhatsApp Web
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado do stage builder
COPY --from=builder /app/dist ./dist

# Copiar arquivos necessários
COPY .env.example ./

# Criar diretórios necessários
RUN mkdir -p /app/.wwebjs_auth /app/qr-codes && \
    chown -R whatsapp:nodejs /app

# Configurar Chromium para WhatsApp Web
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configurar variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Expor porta
EXPOSE 3000

# Trocar para usuário não-root
USER whatsapp

# Comando de inicialização
CMD ["node", "dist/index.js"] 