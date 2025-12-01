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
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { QueryWeatherLogDto } from './dto/query-weather-log.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  async findAll(@Query() query: QueryWeatherLogDto) {
    return this.weatherService.findAll(query);
  }

  @Get('logs/latest')
  async getLatest() {
    return this.weatherService.getLatest();
  }

  @Get('logs/:id')
  async findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  @Get('stats')
  async getStats(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.weatherService.getStats(daysNumber);
  }

  @Get('insights')
  async getInsights() {
    return this.weatherService.generateInsights();
  }

  @Get('export/csv')
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