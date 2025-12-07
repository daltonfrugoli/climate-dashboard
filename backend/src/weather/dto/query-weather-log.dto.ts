import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryWeatherLogDto {
  @ApiPropertyOptional({
    description: 'Filtrar por localização (busca parcial, case-insensitive)',
    example: 'Pindamonhangaba',
    type: String,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Data inicial do período de busca (formato ISO 8601)',
    example: '2024-12-01T00:00:00.000Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final do período de busca (formato ISO 8601)',
    example: '2024-12-06T23:59:59.999Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Quantidade máxima de resultados a retornar',
    example: 100,
    default: 100,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Quantidade de resultados a pular (para paginação)',
    example: 0,
    default: 0,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;
}