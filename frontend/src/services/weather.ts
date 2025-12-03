import api from './api';
import { WeatherLog, WeatherStats, WeatherInsights } from '@/types';

export const weatherService = {
  // Buscar logs de clima
  async getLogs(params?: {
    location?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<WeatherLog[]> {
    const response = await api.get('/weather/logs', { params });
    return response.data;
  },

  // Buscar último registro
  async getLatest(): Promise<WeatherLog | null> {
    const response = await api.get('/weather/logs/latest');
    return response.data;
  },

  // Buscar estatísticas
  async getStats(days: number = 7): Promise<WeatherStats> {
    const response = await api.get('/weather/stats', {
      params: { days },
    });
    return response.data;
  },

  // Gerar insights de IA
  async getInsights(): Promise<WeatherInsights> {
    const response = await api.get('/weather/insights');
    return response.data;
  },

  // Exportar CSV
  exportCSV(): void {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/weather/export/csv`;
    window.open(`${url}?token=${token}`, '_blank');
  },

  // Exportar XLSX
  exportXLSX(): void {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/weather/export/xlsx`;
    window.open(`${url}?token=${token}`, '_blank');
  },
};