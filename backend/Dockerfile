FROM node:20-alpine

# Instalar dependencias do sistema necessarias para o Prisma no Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar definicoes de pacotes e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias e gerar o cliente do Prisma
RUN npm install
RUN npx prisma generate

# Copiar codigo-fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta da API REST + WebSockets
EXPOSE 3000

# Executar a API em modo desenvolvimento garantindo o prisma generate
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
