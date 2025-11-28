import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // Aponta para o .env na raiz do projeto
    }),
    
    // Configuração do MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://mongo:27017/gdash-weather'),
    
    // Módulos da aplicação
    AuthModule,
    UsersModule,
    // WeatherModule,
    // ExternalApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}