import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Weather Intelligence System API')
    .setDescription(
      'API completa para coleta, processamento e análise de dados climáticos com insights gerados por IA. ' +
      'Desenvolvido para o Desafio GDASH 2025/02.'
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação e gerenciamento de sessão')
    .addTag('users', 'Gerenciamento de usuários (CRUD)')
    .addTag('weather', 'Dados climáticos, estatísticas e insights')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Ambiente de Desenvolvimento')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Weather API - Documentação',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .topbar-wrapper img { content:url('https://nestjs.com/img/logo-small.svg'); width:120px; height:auto; }
      .swagger-ui .topbar { background-color: #1a202c; }
    `,
  });

  // Criar usuário padrão
  const usersService = app.get(UsersService);
  await usersService.createDefaultUser();

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend rodando em http://localhost:${port}`);
  console.log(`📚 API disponível em http://localhost:${port}/api`);
  console.log(`📖 Swagger Docs em http://localhost:${port}/api/docs`);
}
bootstrap();