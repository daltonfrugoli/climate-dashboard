import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva Updated',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Email único do usuário',
    example: 'joao.updated@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nova senha do usuário (mínimo 6 caracteres)',
    example: 'novasenha123',
    type: String,
    minLength: 6,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Status de ativação do usuário',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Papel do usuário no sistema',
    example: 'admin',
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  role?: string;
}