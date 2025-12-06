import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Insight } from '@/types';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface InsightsCardProps {
  insights: Insight[];
  insightsSummary?: string;
}

export default function InsightsCard({ insights, insightsSummary }: InsightsCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = (
    type: string
  ): 'default' | 'destructive' | undefined => {
    if (type === 'warning' || type === 'error') return 'destructive';
    return 'default';
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights de IA
          </CardTitle>
          {/* Badge indicando fonte dos insights */}
          {insights && (
            <div className="flex justify-end">
              <Badge variant={insightsSummary?.includes('AI') ? 'default' : 'secondary'}>
                {insightsSummary || 'Insights'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum insight disponível no momento.
          </p>
        ) : (
          insights.map((insight, index) => (
            <Alert key={index} variant={getVariant(insight.type)}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <AlertDescription className="font-semibold">
                      {insight.message}
                    </AlertDescription>
                    <Badge variant={getBadgeVariant(insight.type)}>
                      {insight.category}
                    </Badge>
                  </div>
                  {insight.value && (
                    <p className="text-sm font-mono text-muted-foreground">
                      {insight.value}
                    </p>
                  )}
                  {insight.recommendation && (
                    <p className="text-sm text-muted-foreground">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}