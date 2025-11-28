FROM python:3.11-slim

WORKDIR /app

# Copiar requirements (vamos criar depois)
COPY requirements.txt* ./

# Instalar dependências (se existir o arquivo)
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Copiar código fonte
COPY . .

# Comando padrão (será criado depois)
CMD ["python", "-c", "print('Weather collector aguardando implementação...'); import time; time.sleep(3600)"]