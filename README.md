# 🌦️ Desafio GDASH 2025/02 - Sistema de Monitoramento Climático com IA

Sistema full-stack para coleta, processamento e análise de dados climáticos com insights gerados por IA.

## 📋 Sobre o Projeto

Este projeto integra múltiplas tecnologias para criar um pipeline completo de dados:

- **Python**: Coleta dados climáticos de APIs externas
- **RabbitMQ**: Gerenciamento de filas de mensagens
- **Go**: Worker para processar mensagens da fila
- **NestJS**: API REST com TypeScript
- **MongoDB**: Banco de dados NoSQL
- **React + Vite**: Frontend moderno com Tailwind e shadcn/ui
- **IA**: Geração de insights a partir dos dados climáticos

## 🏗️ Arquitetura

```
┌─────────────┐      ┌──────────┐      ┌─────────┐      ┌─────────┐      ┌──────────┐
│   Python    │─────▶│ RabbitMQ │─────▶│ Worker  │─────▶│ NestJS  │◀────▶│ MongoDB  │
│  Collector  │      │  Queue   │      │   Go    │      │   API   │      │          │
└─────────────┘      └──────────┘      └─────────┘      └─────────┘      └──────────┘
                                                               ▲
                                                               │
                                                               ▼
                                                         ┌──────────┐
                                                         │  React   │
                                                         │ Frontend │
                                                         └──────────┘
```

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/GDASH-io/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Suba todos os serviços com Docker Compose**
```bash
docker-compose up -d
```

4. **Aguarde os serviços iniciarem**
```bash
# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f
```

5. **Acesse as aplicações**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672
  - Usuário: `admin`
  - Senha: `admin123`

### Usuário Padrão

O sistema cria automaticamente um usuário administrador:

- **Email**: `admin@example.com`
- **Senha**: `123456`

## 📦 Estrutura do Projeto

```
desafio-gdash-2025-02/
├── backend/              # API NestJS
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── weather-collector/    # Script Python
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── worker-go/            # Worker em Go
│   ├── main.go
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml    # Orquestração dos serviços
├── .env.example          # Exemplo de variáveis de ambiente
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS**: Framework Node.js com TypeScript
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticação
- **ExcelJS**: Exportação de dados

### Frontend
- **React**: Biblioteca para UI
- **Vite**: Build tool
- **Tailwind CSS**: Framework CSS
- **shadcn/ui**: Componentes UI
- **Recharts**: Gráficos
- **React Router**: Navegação

### Processamento
- **Python**: Coleta de dados climáticos
- **Go**: Worker de processamento
- **RabbitMQ**: Sistema de filas

### APIs Externas
- **Open-Meteo** ou **OpenWeather**: Dados climáticos
- **PokéAPI** ou **SWAPI**: Integração opcional

## 🔧 Comandos Úteis

### Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpa o banco de dados)
docker-compose down -v

# Reconstruir um serviço
docker-compose up -d --build backend
```

### Desenvolvimento Local

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Python Collector
```bash
cd weather-collector
pip install -r requirements.txt
python main.py
```

#### Go Worker
```bash
cd worker-go
go mod download
go run main.go
```

## 📊 Funcionalidades

### Dashboard de Clima
- Visualização de dados climáticos em tempo real
- Gráficos de temperatura, umidade e vento
- Histórico de registros
- Insights gerados por IA
- Exportação de dados em CSV/XLSX

### Gerenciamento de Usuários
- CRUD completo
- Autenticação JWT
- Rotas protegidas

### Integração com API Externa (Opcional)
- Listagem paginada
- Visualização de detalhes

## 🤖 Insights de IA

O sistema gera insights inteligentes baseados nos dados climáticos:
- Análise de tendências de temperatura
- Alertas de condições extremas
- Previsões e recomendações
- Classificação de conforto climático

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📝 Variáveis de Ambiente

Consulte o arquivo `.env.example` para ver todas as variáveis necessárias e suas descrições.

## 🎥 Vídeo Demonstrativo

[Link para o vídeo no YouTube (não listado)]

## 👤 Autor

[Seu Nome Completo]

## 📄 Licença

Este projeto foi desenvolvido como parte do processo seletivo da GDASH 2025/02.