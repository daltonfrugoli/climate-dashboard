# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copiar código fonte
COPY . .

# Build do aplicativo
RUN CGO_ENABLED=0 GOOS=linux go build -o worker .

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copiar binário
COPY --from=builder /app/worker .

# Executar
CMD ["./worker"]