import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { QueryWeatherLogDto } from './dto/query-weather-log.dto';
import { NotFoundException } from '@nestjs/common';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    location: 'Pindamonhangaba, SP',
    temperature: 25,
    humidity: 65,
    windSpeed: 12,
    condition: 'Sunny',
    rainProbability: 30,
    pressure: 1013,
    feelsLike: 26,
    uvIndex: 5,
    timestamp: new Date('2024-12-06T10:00:00Z'),
  };

  const mockWeatherService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getLatest: jest.fn(),
    getStats: jest.fn(),
    generateInsights: jest.fn(),
    exportCSV: jest.fn(),
    exportXLSX: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new weather log', async () => {
      const createDto: CreateWeatherLogDto = {
        location: 'Pindamonhangaba, SP',
        temperature: 25,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
      };

      mockWeatherService.create.mockResolvedValue(mockWeatherLog);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWeatherLog);
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        location: 'Pindamonhangaba, SP',
        temperature: 25,
        // humidity is missing
        windSpeed: 12,
        condition: 'Sunny',
      } as CreateWeatherLogDto;

      mockWeatherService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of weather logs', async () => {
      const query: QueryWeatherLogDto = { limit: 50 };
      const expectedResult = [mockWeatherLog];

      mockWeatherService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should return weather logs with default query parameters', async () => {
      const query: QueryWeatherLogDto = {};
      const expectedResult = [mockWeatherLog];

      mockWeatherService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should filter weather logs by location', async () => {
      const query: QueryWeatherLogDto = { location: 'Pindamonhangaba' };
      const expectedResult = [mockWeatherLog];

      mockWeatherService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getLatest', () => {
    it('should return the most recent weather log', async () => {
      mockWeatherService.getLatest.mockResolvedValue(mockWeatherLog);

      const result = await controller.getLatest();

      expect(service.getLatest).toHaveBeenCalled();
      expect(result).toEqual(mockWeatherLog);
    });

    it('should return null when no logs exist', async () => {
      mockWeatherService.getLatest.mockResolvedValue(null);

      const result = await controller.getLatest();

      expect(service.getLatest).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single weather log by id', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockWeatherService.findOne.mockResolvedValue(mockWeatherLog);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockWeatherLog);
    });

    it('should throw NotFoundException when log is not found', async () => {
      const id = 'nonexistent-id';

      mockWeatherService.findOne.mockRejectedValue(
        new NotFoundException('Weather log not found'),
      );

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(id)).rejects.toThrow('Weather log not found');
    });
  });

  describe('getStats', () => {
    it('should return weather statistics for default 7 days', async () => {
      const expectedStats = {
        count: 10,
        avgTemperature: 25,
        avgHumidity: 65,
        avgWindSpeed: 12,
        maxTemperature: 30,
        minTemperature: 20,
        period: {
          start: new Date('2024-11-29T10:00:00Z'),
          end: new Date('2024-12-06T10:00:00Z'),
        },
      };

      mockWeatherService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalledWith(7);
      expect(result).toEqual(expectedStats);
    });

    it('should return weather statistics for custom number of days', async () => {
      const expectedStats = {
        count: 30,
        avgTemperature: 24,
        avgHumidity: 70,
        avgWindSpeed: 15,
        maxTemperature: 32,
        minTemperature: 18,
      };

      mockWeatherService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats('30');

      expect(service.getStats).toHaveBeenCalledWith(30);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getInsights', () => {
    it('should return weather insights', async () => {
      const expectedInsights = {
        summary: {
          period: '7 days',
          dataPoints: 10,
          avgTemperature: '25.0°C',
          avgHumidity: '65.0%',
          temperatureRange: '20.0°C - 30.0°C',
          source: 'Rule-based system',
        },
        insights: [
          {
            type: 'success',
            category: 'temperatura',
            message: 'Faixa de temperatura agradável',
            value: '25.0°C',
            recommendation: 'Condições ideais para atividades ao ar livre',
          },
        ],
        generatedAt: new Date(),
      };

      mockWeatherService.generateInsights.mockResolvedValue(expectedInsights);

      const result = await controller.getInsights();

      expect(service.generateInsights).toHaveBeenCalled();
      expect(result).toEqual(expectedInsights);
      expect(result.insights).toHaveLength(1);
    });

    it('should handle errors when generating insights', async () => {
      mockWeatherService.generateInsights.mockRejectedValue(
        new Error('Failed to generate insights'),
      );

      await expect(controller.getInsights()).rejects.toThrow('Failed to generate insights');
    });
  });

  describe('exportCSV', () => {
    it('should export weather logs as CSV', async () => {
      const csvData = 'Timestamp,Location,Temperature\n2024-12-06,Pindamonhangaba,25';
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      mockWeatherService.exportCSV.mockResolvedValue(csvData);

      await controller.exportCSV(mockResponse as any);

      expect(service.exportCSV).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=weather-logs-'),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });
  });

  describe('exportXLSX', () => {
    it('should export weather logs as XLSX', async () => {
      const xlsxBuffer = Buffer.from('fake xlsx data');
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      mockWeatherService.exportXLSX.mockResolvedValue(xlsxBuffer);

      await controller.exportXLSX(mockResponse as any);

      expect(service.exportXLSX).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=weather-logs-'),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(xlsxBuffer);
    });
  });
});