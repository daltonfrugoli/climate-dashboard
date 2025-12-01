import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { QueryWeatherLogDto } from './dto/query-weather-log.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAll(query: QueryWeatherLogDto): Promise<WeatherLog[]> {
    const filter: any = {};

    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) {
        filter.timestamp.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.timestamp.$lte = new Date(query.endDate);
      }
    }

    return this.weatherLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(query.limit || 100)
      .skip(query.skip || 0)
      .exec();
  }

  async findOne(id: string): Promise<WeatherLog> {
    const log = await this.weatherLogModel.findById(id).exec();
    
    if (!log) {
      throw new NotFoundException('Weather log not found');
    }
    
    return log;
  }

  async getLatest(): Promise<WeatherLog | null> {
    return this.weatherLogModel
      .findOne()
      .sort({ timestamp: -1 })
      .exec();
  }

  async getStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.weatherLogModel
      .find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: -1 })
      .exec();

    if (logs.length === 0) {
      return {
        count: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        avgWindSpeed: 0,
        maxTemperature: 0,
        minTemperature: 0,
      };
    }

    const temperatures = logs.map(log => log.temperature);
    const humidities = logs.map(log => log.humidity);
    const windSpeeds = logs.map(log => log.windSpeed);

    return {
      count: logs.length,
      avgTemperature: this.average(temperatures),
      avgHumidity: this.average(humidities),
      avgWindSpeed: this.average(windSpeeds),
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      period: {
        start: startDate,
        end: new Date(),
      },
    };
  }

  async generateInsights(): Promise<any> {
    const stats = await this.getStats(7);
    const latest = await this.getLatest();

    if (!latest) {
      return {
        message: 'No weather data available yet',
        insights: [],
      };
    }

    interface Insight {
        type: string; 
        category: string; 
        message: string;
        value: string;
        recommendation: string;
    }

    const insights: Insight[] = [];

    // Temperatura
    if (stats.avgTemperature > 30) {
      insights.push({
        type: 'warning',
        category: 'temperature',
        message: 'High average temperature detected in the last 7 days',
        value: `${stats.avgTemperature.toFixed(1)}°C`,
        recommendation: 'Stay hydrated and avoid prolonged sun exposure',
      });
    } else if (stats.avgTemperature < 15) {
      insights.push({
        type: 'info',
        category: 'temperature',
        message: 'Cool weather in the last 7 days',
        value: `${stats.avgTemperature.toFixed(1)}°C`,
        recommendation: 'Wear warm clothing',
      });
    } else {
      insights.push({
        type: 'success',
        category: 'temperature',
        message: 'Pleasant temperature range',
        value: `${stats.avgTemperature.toFixed(1)}°C`,
        recommendation: 'Ideal conditions for outdoor activities',
      });
    }

    // Umidade
    if (stats.avgHumidity > 80) {
      insights.push({
        type: 'warning',
        category: 'humidity',
        message: 'High humidity levels',
        value: `${stats.avgHumidity.toFixed(1)}%`,
        recommendation: 'May feel uncomfortable, use dehumidifier if indoors',
      });
    } else if (stats.avgHumidity < 30) {
      insights.push({
        type: 'warning',
        category: 'humidity',
        message: 'Low humidity levels',
        value: `${stats.avgHumidity.toFixed(1)}%`,
        recommendation: 'Stay hydrated and use moisturizer',
      });
    }

    // Vento
    if (stats.avgWindSpeed > 30) {
      insights.push({
        type: 'warning',
        category: 'wind',
        message: 'Strong winds detected',
        value: `${stats.avgWindSpeed.toFixed(1)} km/h`,
        recommendation: 'Be cautious with outdoor activities',
      });
    }

    // Tendência de temperatura
    const temperatureTrend = this.calculateTrend(
      await this.weatherLogModel
        .find({ timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        .sort({ timestamp: 1 })
        .select('temperature timestamp')
        .exec()
    );

    insights.push({
      type: 'info',
      category: 'trend',
      message: `Temperature trend: ${temperatureTrend}`,
      value: '',
      recommendation: temperatureTrend === 'rising' 
        ? 'Temperatures are increasing' 
        : temperatureTrend === 'falling'
        ? 'Temperatures are decreasing'
        : 'Stable temperature pattern',
    });

    // Índice de conforto
    const comfortIndex = this.calculateComfortIndex(
      stats.avgTemperature,
      stats.avgHumidity
    );

    insights.push({
      type: comfortIndex.type,
      category: 'comfort',
      message: comfortIndex.message,
      value: `${comfortIndex.score}/100`,
      recommendation: comfortIndex.recommendation,
    });

    return {
      summary: {
        period: '7 days',
        dataPoints: stats.count,
        avgTemperature: `${stats.avgTemperature.toFixed(1)}°C`,
        avgHumidity: `${stats.avgHumidity.toFixed(1)}%`,
        temperatureRange: `${stats.minTemperature.toFixed(1)}°C - ${stats.maxTemperature.toFixed(1)}°C`,
      },
      insights,
      generatedAt: new Date(),
    };
  }

  async exportCSV(): Promise<string> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(1000)
      .exec();

    const header = 'Timestamp,Location,Temperature,Humidity,Wind Speed,Condition,Rain Probability,Pressure,Feels Like,UV Index\n';
    
    const rows = logs.map(log => 
      `${log.timestamp.toISOString()},${log.location},${log.temperature},${log.humidity},${log.windSpeed},${log.condition},${log.rainProbability || ''},${log.pressure || ''},${log.feelsLike || ''},${log.uvIndex || ''}`
    ).join('\n');

    return header + rows;
  }

  async exportXLSX(): Promise<ExcelJS.Buffer> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(1000)
      .exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Temperature (°C)', key: 'temperature', width: 15 },
      { header: 'Humidity (%)', key: 'humidity', width: 15 },
      { header: 'Wind Speed (km/h)', key: 'windSpeed', width: 18 },
      { header: 'Condition', key: 'condition', width: 20 },
      { header: 'Rain Probability (%)', key: 'rainProbability', width: 20 },
      { header: 'Pressure (hPa)', key: 'pressure', width: 15 },
      { header: 'Feels Like (°C)', key: 'feelsLike', width: 15 },
      { header: 'UV Index', key: 'uvIndex', width: 12 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Adicionar dados
    logs.forEach(log => {
      worksheet.addRow({
        timestamp: log.timestamp,
        location: log.location,
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
        condition: log.condition,
        rainProbability: log.rainProbability,
        pressure: log.pressure,
        feelsLike: log.feelsLike,
        uvIndex: log.uvIndex,
      });
    });

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  // Métodos auxiliares
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateTrend(logs: any[]): string {
    if (logs.length < 2) return 'stable';

    const firstHalf = logs.slice(0, Math.floor(logs.length / 2));
    const secondHalf = logs.slice(Math.floor(logs.length / 2));

    const avgFirst = this.average(firstHalf.map(l => l.temperature));
    const avgSecond = this.average(secondHalf.map(l => l.temperature));

    const diff = avgSecond - avgFirst;

    if (diff > 2) return 'rising';
    if (diff < -2) return 'falling';
    return 'stable';
  }

  private calculateComfortIndex(temp: number, humidity: number): any {
    // Algoritmo simples de índice de conforto
    let score = 100;
    let message = '';
    let recommendation = '';
    let type = 'success';

    // Temperatura ideal: 18-24°C
    if (temp < 18) {
      score -= (18 - temp) * 3;
      message = 'Cold weather conditions';
      recommendation = 'Wear warm clothing';
      type = 'warning';
    } else if (temp > 24) {
      score -= (temp - 24) * 3;
      message = 'Warm weather conditions';
      recommendation = 'Stay cool and hydrated';
      type = 'warning';
    } else {
      message = 'Comfortable temperature';
      recommendation = 'Ideal weather conditions';
    }

    // Umidade ideal: 40-60%
    if (humidity < 40) {
      score -= (40 - humidity) * 0.5;
    } else if (humidity > 60) {
      score -= (humidity - 60) * 0.5;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      message,
      recommendation,
      type: score > 70 ? 'success' : score > 50 ? 'info' : 'warning',
    };
  }
}