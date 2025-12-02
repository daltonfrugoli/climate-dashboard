FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 5173

# Executar em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]