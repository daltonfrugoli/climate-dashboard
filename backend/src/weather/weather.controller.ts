import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { QueryWeatherLogDto } from './dto/query-weather-log.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ 
    summary: 'Criar novo log climático',
    description: 'Registra novos dados climáticos no sistema. Normalmente usado pelo worker Go após processar dados da fila RabbitMQ.'
  })
  @ApiBody({ type: CreateWeatherLogDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Log climático criado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        location: 'Pindamonhangaba, SP',
        temperature: 25.5,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
        rainProbability: 30,
        pressure: 1013,
        feelsLike: 26.2,
        uvIndex: 5,
        timestamp: '2024-12-06T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos - Verifique os campos obrigatórios' 
  })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @ApiOperation({ 
    summary: 'Listar logs climáticos',
    description: 'Retorna uma lista de logs climáticos com suporte a filtros por localização, período e paginação'
  })
  @ApiQuery({ 
    name: 'location', 
    required: false, 
    description: 'Filtrar por localização (busca parcial, case-insensitive)',
    example: 'Pindamonhangaba'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Data inicial do período (formato ISO 8601)',
    example: '2024-12-01T00:00:00.000Z'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'Data final do período (formato ISO 8601)',
    example: '2024-12-06T23:59:59.999Z'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Quantidade máxima de resultados a retornar',
    example: 100,
    type: Number
  })
  @ApiQuery({ 
    name: 'skip', 
    required: false, 
    description: 'Quantidade de resultados a pular (para paginação)',
    example: 0,
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de logs retornada com sucesso',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          location: 'Pindamonhangaba, SP',
          temperature: 25.5,
          humidity: 65,
          windSpeed: 12,
          condition: 'Sunny',
          timestamp: '2024-12-06T10:00:00.000Z'
        }
      ]
    }
  })
  async findAll(@Query() query: QueryWeatherLogDto) {
    return this.weatherService.findAll(query);
  }

  @Get('logs/latest')
  @ApiOperation({ 
    summary: 'Obter último log climático',
    description: 'Retorna o registro climático mais recente do sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Último log retornado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        location: 'Pindamonhangaba, SP',
        temperature: 25.5,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
        rainProbability: 30,
        pressure: 1013,
        feelsLike: 26.2,
        uvIndex: 5,
        timestamp: '2024-12-06T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Nenhum log climático encontrado no sistema' 
  })
  async getLatest() {
    return this.weatherService.getLatest();
  }

  @Get('logs/:id')
  @ApiOperation({ 
    summary: 'Buscar log climático por ID',
    description: 'Retorna um log climático específico pelo seu ID único'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do log climático (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Log encontrado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        location: 'Pindamonhangaba, SP',
        temperature: 25.5,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
        rainProbability: 30,
        pressure: 1013,
        feelsLike: 26.2,
        uvIndex: 5,
        rawData: {},
        timestamp: '2024-12-06T10:00:00.000Z',
        createdAt: '2024-12-06T10:05:00.000Z',
        updatedAt: '2024-12-06T10:05:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Log climático não encontrado' 
  })
  async findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obter estatísticas climáticas',
    description: 'Retorna estatísticas agregadas (média, máximo, mínimo) dos dados climáticos para um período específico'
  })
  @ApiQuery({ 
    name: 'days', 
    required: false, 
    description: 'Número de dias para calcular estatísticas (padrão: 7)',
    example: 7,
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas calculadas com sucesso',
    schema: {
      example: {
        count: 168,
        avgTemperature: 25.3,
        avgHumidity: 65.2,
        avgWindSpeed: 12.5,
        maxTemperature: 31.5,
        minTemperature: 20.1,
        period: {
          start: '2024-11-29T10:00:00.000Z',
          end: '2024-12-06T10:00:00.000Z'
        }
      }
    }
  })
  async getStats(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.weatherService.getStats(daysNumber);
  }

  @Get('insights')
  @ApiOperation({ 
    summary: 'Gerar insights climáticos inteligentes',
    description: 'Gera insights e recomendações baseados nos dados climáticos históricos. ' +
                 'Utiliza IA (LLaMA 3 via Groq API) quando disponível, ou algoritmo baseado em regras como fallback automático. ' +
                 'Os insights incluem análise de temperatura, umidade, vento, tendências e índice de conforto.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Insights gerados com sucesso',
    schema: {
      example: {
        summary: {
          period: '7 days',
          dataPoints: 168,
          avgTemperature: '25.3°C',
          avgHumidity: '65.2%',
          temperatureRange: '20.1°C - 31.5°C',
          source: 'AI (LLaMA 3 via Groq)'
        },
        insights: [
          {
            type: 'info',
            category: 'temperatura',
            message: 'A temperatura média está agradável para a região',
            value: '25.3°C',
            recommendation: 'Período ideal para atividades ao ar livre'
          },
          {
            type: 'warning',
            category: 'umidade',
            message: 'Níveis elevados de umidade detectados',
            value: '65.2%',
            recommendation: 'Mantenha ambientes ventilados'
          },
          {
            type: 'success',
            category: 'conforto',
            message: 'Índice de conforto climático excelente',
            value: '85/100',
            recommendation: 'Condições ideais para todas as atividades'
          }
        ],
        generatedAt: '2024-12-06T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro ao gerar insights' 
  })
  async getInsights() {
    return this.weatherService.generateInsights();
  }

  @Get('export/csv')
  @ApiOperation({ 
    summary: 'Exportar dados climáticos em CSV',
    description: 'Exporta os últimos 1000 registros climáticos em formato CSV para análise em planilhas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Arquivo CSV gerado e enviado com sucesso',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example: 'Timestamp,Location,Temperature,Humidity,Wind Speed,Condition\n2024-12-06T10:00:00Z,Pindamonhangaba SP,25.5,65,12,Sunny'
        }
      }
    },
    headers: {
      'Content-Type': {
        description: 'text/csv',
      },
      'Content-Disposition': {
        description: 'attachment; filename=weather-logs-{timestamp}.csv',
      },
    },
  })
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=weather-logs-${Date.now()}.csv`,
    );
    
    return res.status(HttpStatus.OK).send(csv);
  }

  @Get('export/xlsx')
  @ApiOperation({ 
    summary: 'Exportar dados climáticos em XLSX',
    description: 'Exporta os últimos 1000 registros climáticos em formato Excel (XLSX) com formatação profissional'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Arquivo XLSX gerado e enviado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    headers: {
      'Content-Type': {
        description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename=weather-logs-{timestamp}.xlsx',
      },
    },
  })
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportXLSX();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=weather-logs-${Date.now()}.xlsx`,
    );
    
    return res.status(HttpStatus.OK).send(buffer);
  }
}