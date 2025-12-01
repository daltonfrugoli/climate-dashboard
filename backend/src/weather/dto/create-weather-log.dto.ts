import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';

export class CreateWeatherLogDto {
  @IsNotEmpty({ message: 'Location is required' })
  @IsString({ message: 'Location must be a string' })
  location: string;

  @IsNotEmpty({ message: 'Temperature is required' })
  @IsNumber({}, { message: 'Temperature must be a number' })
  temperature: number;

  @IsNotEmpty({ message: 'Humidity is required' })
  @IsNumber({}, { message: 'Humidity must be a number' })
  @Min(0, { message: 'Humidity cannot be negative' })
  @Max(100, { message: 'Humidity cannot exceed 100%' })
  humidity: number;

  @IsNotEmpty({ message: 'Wind speed is required' })
  @IsNumber({}, { message: 'Wind speed must be a number' })
  @Min(0, { message: 'Wind speed cannot be negative' })
  windSpeed: number;

  @IsNotEmpty({ message: 'Condition is required' })
  @IsString({ message: 'Condition must be a string' })
  condition: string;

  @IsOptional()
  @IsNumber({}, { message: 'Rain probability must be a number' })
  @Min(0)
  @Max(100)
  rainProbability?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Pressure must be a number' })
  pressure?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Feels like must be a number' })
  feelsLike?: number;

  @IsOptional()
  @IsNumber({}, { message: 'UV index must be a number' })
  @Min(0)
  uvIndex?: number;

  @IsOptional()
  @IsObject({ message: 'Raw data must be an object' })
  rawData?: Record<string, any>;

  @IsOptional()
  timestamp?: Date;
}