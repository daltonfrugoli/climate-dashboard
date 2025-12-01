import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  condition: string;

  @Prop()
  rainProbability?: number;

  @Prop()
  pressure?: number;

  @Prop()
  feelsLike?: number;

  @Prop()
  uvIndex?: number;

  @Prop({ type: Object })
  rawData?: Record<string, any>;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índices para melhor performance
WeatherLogSchema.index({ location: 1, timestamp: -1 });
WeatherLogSchema.index({ timestamp: -1 });