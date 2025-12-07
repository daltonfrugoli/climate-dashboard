import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Fazer login',
    description: 'Autentica um usuário com email e senha, retornando um token JWT válido por 7 dias'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas - Email ou senha incorretos' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados de entrada inválidos' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obter perfil do usuário autenticado',
    description: 'Retorna os dados completos do usuário atualmente autenticado. Requer token JWT válido.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil retornado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: '2024-12-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido, expirado ou não fornecido' 
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Validar token JWT',
    description: 'Verifica se o token JWT fornecido é válido e retorna os dados do usuário'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou expirado' 
  })
  validateToken(@Request() req) {
    return { 
      valid: true, 
      user: req.user 
    };
  }
}