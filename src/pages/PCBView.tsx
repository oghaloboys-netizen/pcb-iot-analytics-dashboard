import { useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { MetricCard } from '@/components/charts/MetricCard';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { BarChart } from '@/components/charts/BarChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Zap, Gauge, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMetricsContext } from '@/contexts/MetricsContext';

export default function PCBView() {
  const { pcbMetrics, history } = useRealTimeData();
  const { setMetrics } = useMetricsContext();

  useEffect(() => {
    setMetrics({
      pcbMetrics: {
        temperature: pcbMetrics.temperature,
        voltage: pcbMetrics.voltage,
        current: pcbMetrics.current,
        signalIntegrity: pcbMetrics.signalIntegrity,
        componentHealthCount: pcbMetrics.componentHealth.length,
      },
    });
  }, [pcbMetrics, setMetrics]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const componentData = pcbMetrics.componentHealth.map((comp) => ({
    name: comp.name,
    status: comp.status,
    temperature: comp.temperature.toFixed(1),
    voltage: comp.voltage.toFixed(2),
  }));

  const getVariant = (value: number, max: number) => {
    if (value > max * 0.9) return 'danger';
    if (value > max * 0.7) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">PCB Analytics (Fake)</h2>
            <p className="text-muted-foreground">
              Detailed analysis of PCB metrics and component health
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Mock Data
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Temperature"
          value={`${pcbMetrics.temperature.toFixed(1)}°C`}
          description="Current PCB temperature"
          icon={<Thermometer className="h-4 w-4" />}
          variant={getVariant(pcbMetrics.temperature, 80)}
        />
        <MetricCard
          title="Voltage"
          value={`${pcbMetrics.voltage.toFixed(2)}V`}
          description="Supply voltage"
          icon={<Zap className="h-4 w-4" />}
          variant={getVariant(pcbMetrics.voltage, 5.5)}
        />
        <MetricCard
          title="Current"
          value={`${pcbMetrics.current.toFixed(2)}A`}
          description="Current draw"
          icon={<Gauge className="h-4 w-4" />}
          variant={getVariant(pcbMetrics.current, 3.0)}
        />
        <MetricCard
          title="Signal Integrity"
          value={`${pcbMetrics.signalIntegrity.toFixed(1)}%`}
          description="Signal quality"
          icon={<Activity className="h-4 w-4" />}
          variant={pcbMetrics.signalIntegrity > 90 ? 'success' : 'warning'}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <TimeSeriesChart
          title="Temperature Over Time"
          description="PCB temperature history"
          data={history.temperature}
          color="#ef4444"
          unit="°C"
        />
        <TimeSeriesChart
          title="Voltage Over Time"
          description="Voltage levels over time"
          data={history.voltage}
          color="#3b82f6"
          unit="V"
        />
        <TimeSeriesChart
          title="Current Over Time"
          description="Current consumption history"
          data={history.current}
          color="#10b981"
          unit="A"
        />
        <BarChart
          title="Component Voltage Distribution"
          description="Voltage levels by component"
          data={componentData}
          dataKey="name"
          bars={[
            { dataKey: 'voltage', name: 'Voltage', color: '#8b5cf6' },
          ]}
        />
      </div>

      {/* Component Health Table */}
      <Card>
        <CardHeader>
          <CardTitle>Component Health</CardTitle>
          <CardDescription>Status of individual PCB components</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Voltage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pcbMetrics.componentHealth.map((component) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(component.status)}>
                      {component.status === 'healthy' && (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {component.status === 'warning' && (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {component.status === 'critical' && (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {component.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{component.temperature.toFixed(1)}°C</TableCell>
                  <TableCell>{component.voltage.toFixed(2)}V</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
