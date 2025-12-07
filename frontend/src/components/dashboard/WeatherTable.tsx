import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLog } from '@/types';
import { formatDateTime } from '@/lib/date-utils';

interface WeatherTableProps {
  data: WeatherLog[];
}

export default function WeatherTable({ data }: WeatherTableProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Registros Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Umidade</TableHead>
                <TableHead>Vento</TableHead>
                <TableHead>Condição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.temperature.toFixed(1)}°C</TableCell>
                    <TableCell>{log.humidity.toFixed(0)}%</TableCell>
                    <TableCell>{log.windSpeed.toFixed(1)} km/h</TableCell>
                    <TableCell>{log.condition}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}