# Guia de Deploy em Produção - Chat Multicanal IA

Este guia orienta o deploy do backend e frontend em um servidor Linux de produção (ex: Ubuntu Server), incluindo configurações seguras de banco de dados, Redis, gerenciamento de processos, controle de cache e configuração de SSL (HTTPS) com Nginx.

---

## 💻 1. Requisitos do Servidor e Firewall
* **Node.js** v20 ou superior
* **PostgreSQL** v15 ou superior
* **Redis** v7 ou superior
* **Nginx** (para proxy reverso e gerenciamento de SSL)
* **PM2** (`npm install -g pm2`)

### 🛡️ Configurando o Firewall no Linux (UFW)
Para garantir que as portas necessárias estejam abertas e protegidas, execute os seguintes comandos no terminal do servidor Linux:
```bash
# Permitir conexões SSH para você não perder o acesso ao servidor
sudo ufw allow ssh

# Permitir tráfego HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar o firewall
sudo ufw enable
```
*Nota: Caso o backend (porta 3001) ou o Redis (porta 6380) precisem ser acessados de fora diretamente (sem passar pelo Nginx), você deve liberá-los especificamente. Porém, o recomendado é mantê-los fechados e acessá-los apenas localmente via localhost (127.0.0.1).*

---

## 🗄️ 2. Banco de Dados, Redis e Pool de Conexões
Para evitar o erro de estouro de conexões simultâneas no PostgreSQL:

1. No arquivo `.env` de produção, limite a pool de conexões do Prisma adicionando o parâmetro `connection_limit` na URL:
   ```env
   DATABASE_URL="postgresql://postgres:senha@seu-banco:5432/chat_multicanal?schema=public&connection_limit=10"
   ```
   *Nota: Defina `connection_limit=10` para cada processo do backend iniciado.*

2. Execute o comando de migração segura de forma a atualizar a estrutura do banco sem perigo de apagar os dados do cliente:
   ```bash
   npm run prisma:migrate:deploy
   ```

---

## ⚙️ 3. Configurações de Variáveis de Ambiente (`.env`)

### 🟢 Backend (`backend/.env`)
Substitua os valores locais pelos dados reais do servidor:
```env
PORT=3001
HOST=0.0.0.0

# Conexão de Produção (limite de pool de 10 conexões ativas por processo)
DATABASE_URL="postgresql://usuario:senha@seubanco.com:5432/chat_multicanal?schema=public&connection_limit=10"
REDIS_URL="redis://seuredis.com:6379"

# Token de webhook configurado no portal do desenvolvedor da Meta
META_VERIFY_TOKEN="sua_chave_de_verificacao_segura"

# Token da OpenRouter (caso IA ativa)
OPENROUTER_API_KEY="seu_token_aqui"
OPENROUTER_MODEL="meta-llama/llama-3-8b-instruct:free"

# URL pública onde o backend estará rodando com HTTPS
# Importante: A Evolution API e o Webhook do WhatsApp usarão essa URL para notificar o backend
APP_URL="https://api.seudominio.com"
```

### 🔵 Frontend (`frontend/.env` ou no processo de build)
Antes de rodar o build do frontend, configure a variável de ambiente apontando para o seu backend:
```env
VITE_API_URL="https://api.seudominio.com"
```

---

## 🚀 4. Executando as Aplicações

### 🟢 Backend (com PM2)
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências e compile o TypeScript:
   ```bash
   npm install
   npx prisma generate
   npm run build
   ```
3. Inicie o servidor em background usando o PM2:
   ```bash
   pm2 start dist/server.js --name "chat-backend"
   ```
4. Salve a lista de processos para iniciar junto com o sistema:
   ```bash
   pm2 save
   pm2 startup
   ```

### 🔵 Frontend (Compilação Estática)
1. Navegue até a pasta do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências e gere o build de produção:
   ```bash
   npm install
   npm run build
   ```
3. O build gerará a pasta `dist`. Esses arquivos estáticos (HTML, JS, CSS) devem ser servidos pelo Nginx.

---

## 🛡️ 5. Configuração do Nginx (Proxy Reverso, SSL, Cache e WebSockets)

Crie um arquivo de configuração para o seu domínio no Nginx (ex: `/etc/nginx/sites-available/chat-app`):

```nginx
# =========================================================
# 1. Servir o Frontend Estático (chat.seudominio.com)
# =========================================================
server {
    listen 80;
    server_name chat.seudominio.com; # Seu domínio do Frontend

    # Redirecionar todo tráfego HTTP para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chat.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/chat.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.seudominio.com/privkey.pem;

    root /var/www/chat-multicanal/frontend/dist; # Caminho para a pasta dist do frontend
    index index.html;

    # PREVENÇÃO DE CONFLITO DE CACHE: Evita que o navegador do cliente use versões antigas
    # do index.html após atualizações do frontend no servidor.
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# =========================================================
# 2. Proxy Reverso para o Backend (api.seudominio.com)
# =========================================================
server {
    listen 80;
    server_name api.seudominio.com; # Seu domínio da API/Backend

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

    # PREVENÇÃO DE CONFLITO DE UPLOAD: Aumenta o limite padrão de 1MB para 50MB
    # permitindo uploads de áudios longos, mídias e PDFs enviados pelos chats.
    client_max_body_size 50M;

    # Endpoints HTTP da API
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets (Socket.io)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Ajustes de timeout para conexões persistentes do Socket.io
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### 🔒 Obtendo certificado SSL Grátis (Let's Encrypt / Certbot)
Para gerar e configurar os certificados automaticamente nos domínios configurados:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d chat.seudominio.com -d api.seudominio.com
```

Após rodar o certbot, ele ajustará o arquivo do Nginx incluindo os caminhos corretos do SSL de forma automática.
