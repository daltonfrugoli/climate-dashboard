import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  category: string;
  message: string;
  value: string;
  recommendation: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private groq: Groq;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey && apiKey !== 'your_key_here') {
      this.groq = new Groq({ apiKey });
      this.isConfigured = true;
      this.logger.log('✅ Groq AI configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('⚠️  Groq API key not configured - AI insights disabled');
    }
  }

  async generateInsights(weatherData: {
    avgTemperature: number;
    avgHumidity: number;
    avgWindSpeed: number;
    maxTemperature: number;
    minTemperature: number;
    latestCondition: string;
    dataPoints: number;
  }): Promise<AIInsight[]> {
    if (!this.isConfigured) {
      this.logger.warn('AI insights requested but Groq is not configured');
      return [];
    }

    try {
      const prompt = this.buildPrompt(weatherData);
      
      this.logger.log('🤖 Generating AI insights with LLaMA 3...');
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a weather analysis assistant. Analyze weather data and provide insights in JSON format. Be concise and helpful. Always respond in valid JSON. **All text must be written in Brazilian Portuguese (pt-BR).**',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.1-8b-instant', // Rápido e gratuito
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const response = chatCompletion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(response);

      this.logger.log('✅ AI insights generated successfully');

      return parsed.insights || [];
    } catch (error) {
      this.logger.error('❌ Error generating AI insights:', error.message);
      return [];
    }
  }

  private buildPrompt(data: any): string {
    return `
      Analyze this weather data from the last 7 days and generate 4-6 insights:

      **Statistics:**
      - Average Temperature: ${data.avgTemperature.toFixed(1)}°C
      - Temperature Range: ${data.minTemperature.toFixed(1)}°C to ${data.maxTemperature.toFixed(1)}°C
      - Average Humidity: ${data.avgHumidity.toFixed(1)}%
      - Average Wind Speed: ${data.avgWindSpeed.toFixed(1)} km/h
      - Latest Condition: ${data.latestCondition}
      - Data Points: ${data.dataPoints}

      **Generate insights in this EXACT JSON format:**
      {
        "insights": [
          {
            "type": "warning|success|info",
            "category": "temperatura|umidade|vento|geral",
            "message": "Short insight message (max 80 chars)",
            "value": "Relevant numeric value with unit",
            "recommendation": "Actionable recommendation (max 100 chars)"
          }
        ]
      }

      **Guidelines:**
      1. Be concise and practical
      2. Focus on health and comfort
      3. Provide actionable recommendations
      4. Use appropriate types: "warning" for alerts, "success" for good conditions, "info" for neutral
      5. Consider Brazilian climate context
      6. Generate 4-6 insights covering different aspects

      Return ONLY valid JSON, no markdown, no explanations.
    `.trim();
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}