FROM node:20-alpine

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

# Executar a API em modo desenvolvimento com respawn
CMD ["npm", "run", "dev"]
