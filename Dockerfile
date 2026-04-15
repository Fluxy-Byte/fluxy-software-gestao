# Imagem base
FROM node:20-alpine

WORKDIR /usr/app

COPY package.json ./

# Instala dependências para build de addons nativos (como better-sqlite3)
RUN apk add --no-cache python3 py3-pip make g++

# Instala dependências do Node
RUN npm install --legacy-peer-deps

COPY . .

# Gera os arquivos Prisma (caso use)
RUN npx prisma generate

# Gera o build de produção do Next.js
RUN npm run build

# Expõe a porta da aplicação
EXPOSE 5305

# Comando de inicialização
CMD ["npm", "start"]
# CMD ["npm", "run", "dev"]