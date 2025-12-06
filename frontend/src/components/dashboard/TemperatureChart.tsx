import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { WeatherLog } from '@/types';
import { formatChartTime, formatChartDate } from '@/lib/date-utils';

interface TemperatureChartProps {
  data: WeatherLog[];
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  // Preparar dados para o gráfico
  const chartData = data
    .slice()
    .reverse()
    .map((log) => ({
      time: formatChartTime(log.timestamp),
      date: formatChartDate(log.timestamp),
      temperature: log.temperature,
      feelsLike: log.feelsLike || log.temperature,
      humidity: log.humidity,
    }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              label={{
                value: 'Horário',
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: 'Temperatura (°C)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                      <p className="font-semibold">
                        {payload[0].payload.date} - {payload[0].payload.time}
                      </p>
                      <p className="text-sm text-blue-600">
                        Temperatura: {payload[0].value}°C
                      </p>
                      {payload[1] && (
                        <p className="text-sm text-orange-600">
                          Sensação: {payload[1].value}°C
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Temperatura"
            />
            <Line
              type="monotone"
              dataKey="feelsLike"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              strokeDasharray="5 5"
              name="Sensação Térmica"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}