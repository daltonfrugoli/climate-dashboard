# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum (vamos criar depois)
COPY go.mod* go.sum* ./

# Download dependencies (se existir)
RUN if [ -f go.mod ]; then go mod download; fi

# Copiar código fonte
COPY . .

# Build do aplicativo (se existir main.go)
RUN if [ -f main.go ]; then CGO_ENABLED=0 GOOS=linux go build -o worker .; fi

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copiar binário (se foi buildado)
COPY --from=builder /app/worker* ./

# Se não houver worker, criar um script dummy
RUN if [ ! -f worker ]; then echo '#!/bin/sh' > worker && echo 'echo "Worker aguardando implementação..." && sleep 3600' >> worker && chmod +x worker; fi

CMD ["./worker"]