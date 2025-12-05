export interface User {
  _id: string; // MongoDB usa _id
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface WeatherLog {
  _id: string;
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainProbability?: number;
  pressure?: number;
  feelsLike?: number;
  uvIndex?: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherStats {
  count: number;
  avgTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  maxTemperature: number;
  minTemperature: number;
  period: {
    start: string;
    end: string;
  };
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  category: string;
  message: string;
  value: string;
  recommendation: string;
}

export interface WeatherInsights {
  summary: {
    period: string;
    dataPoints: number;
    avgTemperature: string;
    avgHumidity: string;
    temperatureRange: string;
    source?: string; // "AI (LLaMA 3 via Groq)" ou "Rule-based system"
  };
  insights: Insight[];
  generatedAt: string;
}