FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json* ./

# Instalar dependências (se existir)
RUN if [ -f package.json ]; then npm install; fi

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 5173

# Se não houver projeto Vite ainda, aguardar
CMD if [ -f package.json ]; then npm run dev -- --host; else echo "Frontend aguardando implementação..." && sleep 3600; fi