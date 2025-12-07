import { useEffect, useState } from 'react';
import { weatherService } from '@/services/weather';
import { WeatherLog, WeatherStats, WeatherInsights } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import TemperatureChart from '@/components/dashboard/TemperatureChart';
import InsightsCard from '@/components/dashboard/InsightsCard';
import WeatherTable from '@/components/dashboard/WeatherTable';
import { Button } from '@/components/ui/button';
//import { Badge } from '@/components/ui/badge';
import {
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from "sonner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestData, setLatestData] = useState<WeatherLog | null>(null);
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [insights, setInsights] = useState<WeatherInsights | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const [latestResponse, logsResponse, statsResponse, insightsResponse] =
        await Promise.all([
          weatherService.getLatest(),
          weatherService.getLogs({ limit: 20 }),
          weatherService.getStats(7),
          weatherService.getInsights(), // Fallback automático
        ]);

      setLatestData(latestResponse);
      setLogs(logsResponse);
      setStats(statsResponse);
      setInsights(insightsResponse);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Ocorreu um erro ao buscar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    weatherService.exportCSV();
    toast.info("O arquivo CSV está sendo baixado.");
  };

  const handleExportXLSX = () => {
    weatherService.exportXLSX();
    toast.info("O arquivo Excel está sendo baixado.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Clima</h1>
          <p className="text-muted-foreground">
            Monitoramento da cidade de São Paulo-SP em tempo real com insights de IA
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportXLSX}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>


      

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Temperatura Atual"
          value={`${latestData?.temperature.toFixed(1) || '--'}°C`}
          icon={Thermometer}
          description={`Sensação: ${latestData?.feelsLike?.toFixed(1) || '--'}°C`}
        />
        <StatCard
          title="Umidade"
          value={`${latestData?.humidity.toFixed(0) || '--'}%`}
          icon={Droplets}
          description="Umidade relativa do ar"
        />
        <StatCard
          title="Velocidade do Vento"
          value={`${latestData?.windSpeed.toFixed(1) || '--'} km/h`}
          icon={Wind}
          description="Velocidade atual"
        />
        <StatCard
          title="Condição"
          value={latestData?.condition || 'Carregando...'}
          icon={Cloud}
          description={`Pressão: ${latestData?.pressure?.toFixed(0) || '--'} hPa`}
        />
      </div>

      {/* Estatísticas do período */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Temperatura Média (7 dias)"
            value={`${stats.avgTemperature.toFixed(1)}°C`}
            icon={Thermometer}
            description={`Min: ${stats.minTemperature.toFixed(1)}°C | Max: ${stats.maxTemperature.toFixed(1)}°C`}
          />
          <StatCard
            title="Umidade Média (7 dias)"
            value={`${stats.avgHumidity.toFixed(0)}%`}
            icon={Droplets}
            description={`Baseado em ${stats.count} registros`}
          />
          <StatCard
            title="Vento Médio (7 dias)"
            value={`${stats.avgWindSpeed.toFixed(1)} km/h`}
            icon={Wind}
            description={`Últimos ${stats.count} registros`}
          />
        </div>
      )}

      {/* Gráfico e Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <TemperatureChart data={logs} />
        {insights && <InsightsCard insights={insights.insights} insightsSummary={insights.summary.source}/>}
      </div>

      {/* Tabela de registros */}
      <WeatherTable data={logs.slice(0, 10)} />
    </div>
  );
}