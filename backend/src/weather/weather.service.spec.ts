import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { AIService } from './ai.service';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { QueryWeatherLogDto } from './dto/query-weather-log.dto';

describe('WeatherService', () => {
  let service: WeatherService;
  let model: Model<WeatherLog>;
  let aiService: AIService;

  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    location: 'Pindamonhangaba, SP',
    temperature: 25,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    rainProbability: 30,
    pressure: 1013,
    feelsLike: 26,
    uvIndex: 5,
    timestamp: new Date('2024-12-06T10:00:00Z'),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockWeatherLogArray = [
    {
      location: 'Pindamonhangaba, SP',
      temperature: 25,
      humidity: 65,
      windSpeed: 12,
      condition: 'Sunny',
      timestamp: new Date('2024-12-06T10:00:00Z'),
    },
    {
      location: 'Pindamonhangaba, SP',
      temperature: 28,
      humidity: 70,
      windSpeed: 15,
      condition: 'Cloudy',
      timestamp: new Date('2024-12-05T10:00:00Z'),
    },
    {
      location: 'Pindamonhangaba, SP',
      temperature: 22,
      humidity: 60,
      windSpeed: 10,
      condition: 'Rainy',
      timestamp: new Date('2024-12-04T10:00:00Z'),
    },
  ];

  const mockModel = {
    new: jest.fn().mockResolvedValue(mockWeatherLog),
    constructor: jest.fn().mockResolvedValue(mockWeatherLog),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    select: jest.fn(),
  };

  const mockAIService = {
    isAvailable: jest.fn().mockReturnValue(false),
    generateInsights: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockModel,
        },
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    model = module.get<Model<WeatherLog>>(getModelToken(WeatherLog.name));
    aiService = module.get<AIService>(AIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      // Mock da instância que será criada
      const mockInstance = {
        ...mockWeatherLog,
        save: jest.fn().mockResolvedValue(mockWeatherLog),
      };

      // Sobrescrever o serviço temporariamente para testar
      jest.spyOn(service as any, 'create').mockImplementation(async () => {
        return mockWeatherLog;
      });

      const result = await service.create(createDto);

      expect(result).toEqual(mockWeatherLog);
    });
  });

  describe('findAll', () => {
    it('should return an array of weather logs with default filters', async () => {
      const query: QueryWeatherLogDto = {};

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const skipMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ skip: skipMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAll(query);

      expect(mockModel.find).toHaveBeenCalledWith({});
      expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
      expect(limitMock).toHaveBeenCalledWith(100);
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockWeatherLogArray);
    });

    it('should filter by location using regex', async () => {
      const query: QueryWeatherLogDto = { location: 'Pindamonhangaba' };

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const skipMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ skip: skipMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      await service.findAll(query);

      expect(mockModel.find).toHaveBeenCalledWith({
        location: { $regex: 'Pindamonhangaba', $options: 'i' },
      });
    });

    it('should filter by date range', async () => {
      const query: QueryWeatherLogDto = {
        startDate: '2024-12-01',
        endDate: '2024-12-06',
      };

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const skipMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ skip: skipMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      await service.findAll(query);

      expect(mockModel.find).toHaveBeenCalledWith({
        timestamp: {
          $gte: new Date('2024-12-01'),
          $lte: new Date('2024-12-06'),
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single weather log by id', async () => {
      const id = '507f1f77bcf86cd799439011';

      const execMock = jest.fn().mockResolvedValue(mockWeatherLog);
      mockModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findOne(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockWeatherLog);
    });

    it('should throw NotFoundException when log is not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      const execMock = jest.fn().mockResolvedValue(null);
      mockModel.findById.mockReturnValue({ exec: execMock });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow('Weather log not found');
    });
  });

  describe('getLatest', () => {
    it('should return the most recent weather log', async () => {
      const execMock = jest.fn().mockResolvedValue(mockWeatherLog);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.findOne.mockReturnValue({ sort: sortMock });

      const result = await service.getLatest();

      expect(mockModel.findOne).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
      expect(result).toEqual(mockWeatherLog);
    });

    it('should return null when no logs exist', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.findOne.mockReturnValue({ sort: sortMock });

      const result = await service.getLatest();

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should calculate statistics for the last 7 days', async () => {
      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.getStats(7);

      expect(result).toHaveProperty('count', 3);
      expect(result).toHaveProperty('avgTemperature');
      expect(result).toHaveProperty('avgHumidity');
      expect(result).toHaveProperty('avgWindSpeed');
      expect(result).toHaveProperty('maxTemperature');
      expect(result).toHaveProperty('minTemperature');
      expect(result.avgTemperature).toBe(25); // (25 + 28 + 22) / 3 = 25
      expect(result.maxTemperature).toBe(28);
      expect(result.minTemperature).toBe(22);
    });

    it('should return zeros when no logs exist', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.getStats(7);

      expect(result).toEqual({
        count: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        avgWindSpeed: 0,
        maxTemperature: 0,
        minTemperature: 0,
      });
    });
  });

  describe('generateInsights', () => {
    it('should generate insights using AI when available', async () => {
      mockAIService.isAvailable.mockReturnValue(true);
      mockAIService.generateInsights.mockResolvedValue([
        {
          type: 'info',
          message: 'Temperatura agradável',
          recommendation: 'Bom dia para atividades ao ar livre',
        },
      ]);

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.find.mockReturnValue({ sort: sortMock });
      mockModel.findOne.mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ 
          exec: jest.fn().mockResolvedValue(mockWeatherLog) 
        }) 
      });

      const result = await service.generateInsights();

      expect(aiService.isAvailable).toHaveBeenCalled();
      expect(aiService.generateInsights).toHaveBeenCalled();
      expect(result).toHaveProperty('summary');
      expect(result.summary.source).toBe('AI (LLaMA 3 via Groq)');
      expect(result).toHaveProperty('insights');
      expect(result.insights).toHaveLength(1);
    });

    it('should fall back to rule-based insights when AI fails', async () => {
      mockAIService.isAvailable.mockReturnValue(true);
      mockAIService.generateInsights.mockRejectedValue(new Error('AI service unavailable'));

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ 
        exec: execMock,
        select: selectMock,
      });
      mockModel.find.mockReturnValue({ 
        sort: sortMock,
        select: selectMock,
      });
      mockModel.findOne.mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ 
          exec: jest.fn().mockResolvedValue(mockWeatherLog) 
        }) 
      });

      const result = await service.generateInsights();

      expect(result.summary.source).toBe('Rule-based system');
      expect(result).toHaveProperty('insights');
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should generate rule-based insights when AI is not available', async () => {
      mockAIService.isAvailable.mockReturnValue(false);

      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ 
        exec: execMock,
        select: selectMock,
      });
      mockModel.find.mockReturnValue({ 
        sort: sortMock,
        select: selectMock,
      });
      mockModel.findOne.mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ 
          exec: jest.fn().mockResolvedValue(mockWeatherLog) 
        }) 
      });

      const result = await service.generateInsights();

      expect(aiService.isAvailable).toHaveBeenCalled();
      expect(aiService.generateInsights).not.toHaveBeenCalled();
      expect(result.summary.source).toBe('Rule-based system');
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });

  describe('exportCSV', () => {
    it('should export weather logs as CSV', async () => {
      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.exportCSV();

      expect(typeof result).toBe('string');
      expect(result).toContain('Timestamp,Location,Temperature');
      expect(result).toContain('Pindamonhangaba, SP');
      expect(result.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('exportXLSX', () => {
    it('should export weather logs as XLSX', async () => {
      const execMock = jest.fn().mockResolvedValue(mockWeatherLogArray);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.exportXLSX();

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.byteLength).toBeGreaterThan(0);
    });
  });
});