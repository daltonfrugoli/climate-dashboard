import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeatherLogDto {
  @ApiProperty({
    description: 'Localização onde os dados climáticos foram coletados',
    example: 'Pindamonhangaba, SP',
    type: String,
  })
  @IsNotEmpty({ message: 'Location is required' })
  @IsString({ message: 'Location must be a string' })
  location: string;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 25.5,
    type: Number,
  })
  @IsNotEmpty({ message: 'Temperature is required' })
  @IsNumber({}, { message: 'Temperature must be a number' })
  temperature: number;

  @ApiProperty({
    description: 'Umidade relativa do ar em porcentagem (0-100)',
    example: 65,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty({ message: 'Humidity is required' })
  @IsNumber({}, { message: 'Humidity must be a number' })
  @Min(0, { message: 'Humidity cannot be negative' })
  @Max(100, { message: 'Humidity cannot exceed 100%' })
  humidity: number;

  @ApiProperty({
    description: 'Velocidade do vento em km/h',
    example: 12,
    type: Number,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Wind speed is required' })
  @IsNumber({}, { message: 'Wind speed must be a number' })
  @Min(0, { message: 'Wind speed cannot be negative' })
  windSpeed: number;

  @ApiProperty({
    description: 'Condição climática atual',
    example: 'Sunny',
    type: String,
    enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Partly Cloudy', 'Overcast', 'Foggy', 'Snowy'],
  })
  @IsNotEmpty({ message: 'Condition is required' })
  @IsString({ message: 'Condition must be a string' })
  condition: string;

  @ApiPropertyOptional({
    description: 'Probabilidade de chuva em porcentagem (0-100)',
    example: 30,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Rain probability must be a number' })
  @Min(0)
  @Max(100)
  rainProbability?: number;

  @ApiPropertyOptional({
    description: 'Pressão atmosférica em hPa (hectopascal)',
    example: 1013,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Pressure must be a number' })
  pressure?: number;

  @ApiPropertyOptional({
    description: 'Sensação térmica em graus Celsius',
    example: 26.2,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Feels like must be a number' })
  feelsLike?: number;

  @ApiPropertyOptional({
    description: 'Índice UV (0-11+)',
    example: 5,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'UV index must be a number' })
  @Min(0)
  uvIndex?: number;

  @ApiPropertyOptional({
    description: 'Dados brutos completos da API externa (Open-Meteo)',
    example: { 
      timezone: 'America/Sao_Paulo',
      elevation: 560
    },
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Raw data must be an object' })
  rawData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Data e hora do registro (ISO 8601)',
    example: '2024-12-06T10:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  timestamp?: Date;
}