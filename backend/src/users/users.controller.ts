import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema. Apenas administradores podem criar usuários.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'user',
        createdAt: '2024-12-06T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou email já cadastrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - apenas administradores' 
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista completa de todos os usuários cadastrados. Apenas administradores.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2024-12-01T10:00:00.000Z'
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'user',
          createdAt: '2024-12-06T10:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - apenas administradores' 
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico pelo seu ID. Apenas administradores.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do usuário (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário encontrado',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'user',
        createdAt: '2024-12-06T10:00:00.000Z',
        updatedAt: '2024-12-06T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - apenas administradores' 
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente. Apenas administradores podem atualizar usuários.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do usuário a ser atualizado (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário atualizado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'João Silva Updated',
        email: 'joao.updated@example.com',
        role: 'user',
        updatedAt: '2024-12-06T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - apenas administradores' 
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema permanentemente. Apenas administradores podem deletar usuários.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do usuário a ser deletado (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário deletado com sucesso',
    schema: {
      example: {
        message: 'Usuário deletado com sucesso',
        id: '507f1f77bcf86cd799439011'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token JWT inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - apenas administradores' 
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}