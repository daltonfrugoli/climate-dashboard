import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  // Criar usuário padrão
  const usersService = app.get(UsersService);
  await usersService.createDefaultUser();

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend rodando em http://localhost:${port}`);
  console.log(`📚 API disponível em http://localhost:${port}/api`);
}
bootstrap();