# 🌦️ Desafio GDASH 2025/02 - Sistema de Monitoramento Climático com IA

Sistema full-stack para coleta, processamento e análise de dados climáticos em tempo real com insights gerados por IA.

[![LinkedIn Button](https://img.shields.io/badge/LinkedIn-%230077B5.svg?&style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/gdash/)
[![GDASH Website Button](https://img.shields.io/badge/-Website-red)](https://gdash.io/)

---

## 📋 Sobre o Projeto

Este projeto integra múltiplas linguagens e tecnologias para criar um pipeline completo de dados climáticos, desenvolvido como parte do processo seletivo da GDASH 2025/02 para a vaga de Desenvolvedor Full Stack Junior.

### 🎯 Funcionalidades Implementadas

- ✅ **Coleta Automática**: Python coleta dados climáticos periodicamente (Open-Meteo API)
- ✅ **Processamento Assíncrono**: RabbitMQ + Worker Go processam dados em tempo real
- ✅ **API REST Completa**: NestJS com MongoDB, autenticação JWT e validações
- ✅ **Dashboard Interativo**: React + Vite + Tailwind + shadcn/ui com gráficos em tempo real
- ✅ **IA Integrada**: Geração de insights usando LLaMA 3 via Groq API
- ✅ **CRUD de Usuários**: Sistema completo de autenticação e gerenciamento
- ✅ **Exportação de Dados**: CSV e XLSX para análise externa
- ✅ **Integração Extra**: PokéAPI com listagem paginada
- ✅ **Testes Completos**: 33 testes unitários e de integração
- ✅ **Docker Compose**: Infraestrutura completa containerizada

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐
│  Python Script  │ → Coleta dados climáticos (Open-Meteo API)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RabbitMQ      │ → Fila de mensagens
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Go Worker     │ → Processa e valida dados
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NestJS API     │ → API REST + IA + MongoDB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Frontend  │ → Dashboard interativo
└─────────────────┘
```

### 🔄 Fluxo de Dados

1. **Python** coleta dados climáticos a cada 1 hora da API Open-Meteo
2. **RabbitMQ** armazena mensagens em fila para processamento assíncrono
3. **Go Worker** consome mensagens, valida e envia para a API NestJS
4. **NestJS API** armazena no MongoDB e processa com IA
5. **React Frontend** exibe dashboard com dados e insights em tempo real

---

## 🛠️ Stack Tecnológica

### Backend
- **NestJS** (v10.x) - Framework Node.js com TypeScript
- **MongoDB** (v7.x) - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Class Validator** - Validação de DTOs
- **ExcelJS** - Exportação de planilhas

### Frontend
- **React** (v18.x) - Biblioteca UI
- **Vite** (v5.x) - Build tool de alta performance
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI modernos
- **React Query** - Gerenciamento de estado servidor
- **React Router** - Roteamento SPA
- **Recharts** - Biblioteca de gráficos
- **Axios** - Cliente HTTP

### Processamento & Coleta
- **Go** (v1.21+) - Worker de processamento da fila
- **Python** (v3.11+) - Coleta de dados climáticos
- **RabbitMQ** (v3.12) - Message broker

### IA & APIs Externas
- **Groq API** - LLaMA 3 para geração de insights inteligentes
- **Open-Meteo** - Dados climáticos gratuitos e precisos
- **PokéAPI** - Integração opcional com API pública paginada

### DevOps
- **Docker** & **Docker Compose** - Containerização completa
- **Jest** - Framework de testes unitários e integração
- **ESLint** & **Prettier** - Qualidade e formatação de código

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** (v24.x ou superior)
- **Docker Compose** (v2.x ou superior)
- **Node.js** (v18.x ou superior) - apenas para desenvolvimento local
- **Python** (v3.11 ou superior) - apenas para desenvolvimento local
- **Go** (v1.21 ou superior) - apenas para desenvolvimento local

---

## 🚀 Como Executar

### Método 1: Docker Compose (Recomendado) ⭐

Este é o método mais simples e funciona em qualquer sistema operacional.

#### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
```

#### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (as principais variáveis já vêm pré-configuradas):

```env
# MongoDB
MONGODB_URI=mongodb://mongo:27017/weather-db

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE=weather_data

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# Default User
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=123456
DEFAULT_USER_NAME=Admin User

# Groq API (opcional - para IA)
GROQ_API_KEY=sua-chave-groq-aqui

# Weather API Configuration
WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
WEATHER_LOCATION_LAT=-22.9249
WEATHER_LOCATION_LON=-45.4619
WEATHER_LOCATION_NAME=Pindamonhangaba, SP
```

#### 3. Inicie todos os serviços

```bash
docker-compose up -d
```

Este comando irá:
- Baixar todas as imagens Docker necessárias
- Criar containers para MongoDB, RabbitMQ, API, Frontend, Worker Go e Script Python
- Configurar a rede entre os containers
- Inicializar o banco de dados com o usuário padrão

#### 4. Verifique os logs (opcional)

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f go-worker
docker-compose logs -f python-collector
```

#### 5. Acesse o sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

#### 6. Login no sistema

Use as credenciais padrão configuradas no `.env`:

```
Email: admin@example.com
Senha: 123456
```

#### 7. Parar os serviços

```bash
# Parar containers
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover containers e volumes (limpa o banco de dados)
docker-compose down -v
```

---

### Método 2: Execução Local (Desenvolvimento)

Para desenvolvimento local sem Docker:

#### 1. MongoDB

```bash
# Use Docker apenas para MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7

# OU use MongoDB Atlas (cloud gratuito)
# Configure MONGODB_URI no .env
```

#### 2. RabbitMQ

```bash
# Use Docker apenas para RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

#### 3. Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais locais
npm run start:dev
```

#### 4. Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_URL=http://localhost:3000
npm run dev
```

#### 5. Go Worker

```bash
cd go-worker
go mod download
go run main.go
```

#### 6. Python Collector

```bash
cd python-collector
pip install -r requirements.txt
python main.py
```

---

## 🧪 Executando os Testes

### Testes do Backend (NestJS)

```bash
cd backend

# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes em modo watch
npm run test:watch

# Testes E2E
npm run test:e2e
```

### 📊 Cobertura de Testes

Os testes implementados cobrem:

- ✅ **WeatherService** (16 testes unitários)
  - Criação de logs climáticos
  - Listagem com filtros (localização, data)
  - Busca por ID
  - Estatísticas e agregações (7 dias, média, min, max)
  - Geração de insights (IA e fallback para regras)
  - Exportação CSV/XLSX
  - Tratamento de erros (NotFoundException)

- ✅ **WeatherController** (16 testes de integração)
  - Endpoints HTTP
  - Validação de DTOs
  - Respostas e status codes
  - Manipulação de Response objects

- ✅ **Total**: 33 testes passando

**Resultado esperado:**
```
Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total
Time:        ~3s
```

---

## 📡 Endpoints da API

### 🔐 Autenticação

```http
POST   /auth/login              # Login de usuário
POST   /auth/register           # Registro de novo usuário
GET    /auth/profile            # Perfil do usuário autenticado
```

### 🌤️ Weather Logs

```http
POST   /weather/logs            # Criar novo log climático
GET    /weather/logs            # Listar logs (com filtros)
GET    /weather/logs/latest     # Obter o último log registrado
GET    /weather/logs/:id        # Buscar log por ID
GET    /weather/stats?days=7    # Estatísticas dos últimos N dias
GET    /weather/insights        # Insights gerados (IA ou regras)
GET    /weather/export/csv      # Exportar dados em CSV
GET    /weather/export/xlsx     # Exportar dados em XLSX
```

**Exemplo de query params para listagem:**
```
GET /weather/logs?location=Pindamonhangaba&startDate=2024-12-01&endDate=2024-12-06&limit=50&skip=0
```

### 👥 Usuários

```http
GET    /users                   # Listar usuários
GET    /users/:id               # Buscar usuário por ID
POST   /users                   # Criar novo usuário
PATCH  /users/:id               # Atualizar usuário
DELETE /users/:id               # Deletar usuário
```

### 🎮 Pokémon (Integração Opcional)

```http
GET    /pokemon?limit=20&offset=0    # Listar pokémons (paginado)
GET    /pokemon/:id                  # Detalhes de um pokémon
```

### 📚 Documentação Interativa

Acesse a documentação Swagger completa em:
```
http://localhost:3000/api
```

---

## 🧠 Sistema de Insights com IA

O sistema oferece dois modos de geração de insights climáticos:

### 1. Insights com IA (Groq API - LLaMA 3) 🤖

Quando a chave `GROQ_API_KEY` está configurada, o sistema usa IA para gerar insights contextualizados, naturais e personalizados baseados nos dados climáticos históricos.

**Exemplo de resposta:**

```json
{
  "summary": {
    "period": "7 days",
    "dataPoints": 168,
    "avgTemperature": "25.3°C",
    "avgHumidity": "65.2%",
    "temperatureRange": "20.1°C - 31.5°C",
    "source": "AI (LLaMA 3 via Groq)"
  },
  "insights": [
    {
      "type": "info",
      "message": "A temperatura média está agradável para a região",
      "recommendation": "Período ideal para atividades ao ar livre"
    },
    {
      "type": "warning",
      "message": "Umidade ligeiramente elevada detectada",
      "recommendation": "Mantenha ambientes ventilados"
    }
  ],
  "generatedAt": "2024-12-06T10:30:00.000Z"
}
```

### 2. Insights Baseados em Regras (Fallback) 📊

Se a IA não estiver disponível, o sistema automaticamente usa um algoritmo baseado em regras que analisa:

- **Temperatura**: Classificação (frio, agradável, quente)
- **Umidade**: Níveis (baixa, ideal, alta)
- **Velocidade do Vento**: Alertas de ventos fortes
- **Tendências Temporais**: Temperatura subindo/caindo/estável
- **Índice de Conforto Climático**: Pontuação 0-100

---

## 📊 Estrutura do Banco de Dados

### Collection: `weather_logs`

```javascript
{
  _id: ObjectId,
  location: String,           // "Pindamonhangaba, SP"
  temperature: Number,        // 25.5 (°C)
  humidity: Number,           // 65 (%)
  windSpeed: Number,          // 12 (km/h)
  condition: String,          // "Sunny", "Cloudy", "Rainy"
  rainProbability: Number,    // 30 (%)
  pressure: Number,           // 1013 (hPa)
  feelsLike: Number,          // 26.2 (°C)
  uvIndex: Number,            // 5
  rawData: Object,            // Dados brutos da API
  timestamp: Date,            // ISODate
  createdAt: Date,            // Auto-gerado
  updatedAt: Date             // Auto-gerado
}
```

**Índices para Performance:**
- `{ location: 1, timestamp: -1 }`
- `{ timestamp: -1 }`

### Collection: `users`

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,              // Único
  password: String,           // Hash bcrypt
  role: String,               // "admin" | "user"
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📁 Estrutura de Diretórios

```
desafio-gdash-2025-02/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── weather/        # Módulo principal (clima)
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── schemas/    # Schemas Mongoose
│   │   │   ├── weather.controller.ts
│   │   │   ├── weather.service.ts
│   │   │   ├── weather.service.spec.ts      # 16 testes
│   │   │   ├── weather.controller.spec.ts   # 16 testes
│   │   │   ├── ai.service.ts
│   │   │   └── weather.module.ts
│   │   ├── pokemon/        # Módulo Pokémon (opcional)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/               # Testes E2E
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── pages/         # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Users.tsx
│   │   │   └── Pokemon.tsx
│   │   ├── services/      # Chamadas API
│   │   ├── contexts/      # Context API (Auth)
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── go-worker/             # Worker Go
│   ├── main.go
│   ├── go.mod
│   └── Dockerfile
│
├── python-collector/      # Script Python
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml     # Orquestração completa
├── .env.example          # Template de variáveis
└── README.md             # Este arquivo
```

---

## 🎨 Frontend - Dashboard

Dashboard moderno construído com React, Vite, Tailwind CSS e shadcn/ui.

### Páginas Principais

#### 1. 🔐 Login (`/login`)
- Autenticação de usuários
- Validação de formulário com feedback visual
- Redirecionamento automático

#### 2. 📊 Dashboard (`/dashboard`)
- **Cards de Dados em Tempo Real**
  - Temperatura atual, umidade, velocidade do vento
  - Última atualização
  - Condição climática atual
  
- **Gráficos Interativos** (Recharts)
  - Temperatura ao longo do tempo (linha)
  - Umidade ao longo do tempo (área)
  - Comparação de múltiplas métricas
  
- **Insights de IA**
  - Cards coloridos por tipo (info, warning, success)
  - Recomendações práticas
  - Atualização sob demanda
  
- **Tabela de Registros**
  - Listagem com paginação
  - Filtros por data e localização
  - Botões de exportação CSV/XLSX

#### 3. 👥 Usuários (`/users`)
- CRUD completo com interface intuitiva
- Tabela com ações (editar/deletar)
- Modais para criar/editar
- Validação de formulários

#### 4. 🎮 Pokémon (`/pokemon`) - Opcional
- Listagem paginada
- Busca por nome
- Página de detalhes com informações completas

### Componentes shadcn/ui Utilizados

- `Button`, `Input`, `Card`, `Table`, `Dialog`
- `Toast`, `Badge`, `Select`, `Tabs`, `Alert`
- `Chart` (integrado com Recharts)

---

## 🔐 Autenticação e Segurança

### JWT Authentication

- Tokens com validade configurável (padrão: 7 dias)
- Refresh token automático no frontend
- Proteção de rotas via Guards (NestJS)
- Validação de sessão em todas as requisições

### Medidas de Segurança

- ✅ Senhas criptografadas com **bcrypt** (10 salt rounds)
- ✅ Validação de inputs com **class-validator**
- ✅ CORS configurado adequadamente
- ✅ Helmet para headers de segurança HTTP
- ✅ Rate limiting (opcional, configurável)

### Usuário Padrão

Criado automaticamente na primeira inicialização:

```
Email: admin@example.com
Senha: 123456
Role: admin
```

⚠️ **IMPORTANTE**: Altere essas credenciais em ambiente de produção!

---

## 🐛 Troubleshooting

### Containers não iniciam

```bash
# Verificar logs
docker-compose logs

# Recriar containers do zero
docker-compose down -v
docker-compose up --build
```

### MongoDB não conecta

```bash
# Verificar se o container está rodando
docker ps | grep mongo

# Ver logs do MongoDB
docker-compose logs mongo

# Verificar variável MONGODB_URI no .env
```

### RabbitMQ não processa mensagens

```bash
# Acessar interface web
http://localhost:15672 (guest/guest)

# Verificar fila "weather_data"
# Ver logs do Go worker
docker-compose logs go-worker

# Ver logs do Python collector
docker-compose logs python-collector
```

### Frontend não carrega dados

```bash
# Verificar se VITE_API_URL está correto no .env
# Verificar CORS na API (deve permitir localhost:5173)
# Abrir console do navegador (F12) e verificar erros
# Ver logs da API: docker-compose logs api
```

### IA não funciona

```bash
# Verificar se GROQ_API_KEY está configurada no .env
# Sistema funciona normalmente sem IA (fallback automático para regras)
# Ver logs da API para mensagens sobre IA: docker-compose logs api | grep AI
```

---

## 🚀 Melhorias Futuras

Possíveis evoluções do projeto:

- [ ] WebSockets para atualização em tempo real sem polling
- [ ] Aumentar cobertura de testes (>90%)
- [ ] CI/CD com GitHub Actions
- [ ] Deploy em produção (Railway, Render, Vercel)
- [ ] Mais tipos de gráficos e visualizações
- [ ] Notificações push para alertas climáticos
- [ ] Cache com Redis para melhor performance
- [ ] Comparação: previsão vs realidade
- [ ] Suporte para múltiplas localizações
- [ ] Dark mode completo no frontend
- [ ] PWA (Progressive Web App)

---

## 🎥 Vídeo Explicativo

📹 **[Clique aqui para assistir ao vídeo demonstrativo](seu-link-youtube-aqui)**

**Duração**: ~5 minutos

**Conteúdo do vídeo**:
1. Visão geral da arquitetura
2. Demonstração do sistema rodando
3. Pipeline de dados (Python → RabbitMQ → Go → NestJS → Frontend)
4. Sistema de insights com IA
5. Principais decisões técnicas

---

## 👤 Autor

**[Seu Nome Completo]**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Nome](https://linkedin.com/in/seu-perfil)
- Email: seu.email@example.com

---

## 🙏 Agradecimentos

- **GDASH** pela oportunidade de participar do processo seletivo
- **Open-Meteo** pelos dados climáticos gratuitos e de qualidade
- **Groq** pela API de IA com LLaMA 3
- Comunidade open source pelas excelentes ferramentas

---

## 📚 Referências e Documentação

- [Desafio Original GDASH](https://github.com/GDASH-io/desafio-gdash-2025-02)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Go Documentation](https://go.dev/doc/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 📄 Licença

Este projeto foi desenvolvido como parte do processo seletivo da GDASH 2025/02 e está disponível para fins educacionais e de avaliação.

---

<div align="center">

**⚡ Desenvolvido com dedicação para o Desafio GDASH 2025/02**

[![Made with NestJS](https://img.shields.io/badge/Made%20with-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Made with Go](https://img.shields.io/badge/Made%20with-Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Made with Python](https://img.shields.io/badge/Made%20with-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

</div>