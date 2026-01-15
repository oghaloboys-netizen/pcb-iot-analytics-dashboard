import { useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { MetricCard } from '@/components/charts/MetricCard';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Zap, Activity, Network, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMetricsContext } from '@/contexts/MetricsContext';

export default function Dashboard() {
  const { summary, history, refresh, isLoading } = useRealTimeData();
  const { setMetrics } = useMetricsContext();

  useEffect(() => {
    setMetrics({
      summary,
    });
  }, [summary, setMetrics]);

  const getVariant = (value: number, threshold: number) => {
    if (value > threshold * 0.9) return 'danger';
    if (value > threshold * 0.7) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard (Fake)</h2>
            <p className="text-muted-foreground">
              Overview of PCB and IoT Edge device analytics
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Mock Data
          </Badge>
        </div>
        <Button onClick={refresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total PCBs"
          value={summary.totalPCBs}
          description="Active PCB systems"
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          title="IoT Devices"
          value={summary.totalIoTDevices}
          description={`${summary.onlineDevices} online`}
          icon={<Network className="h-4 w-4" />}
          variant={summary.onlineDevices === summary.totalIoTDevices ? 'success' : 'warning'}
        />
        <MetricCard
          title="Avg Temperature"
          value={`${summary.averageTemperature.toFixed(1)}°C`}
          description="PCB temperature"
          icon={<Thermometer className="h-4 w-4" />}
          variant={getVariant(summary.averageTemperature, 80)}
        />
        <MetricCard
          title="Critical Alerts"
          value={summary.criticalAlerts}
          description="Requires attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={summary.criticalAlerts > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <TimeSeriesChart
          title="Temperature Trend"
          description="PCB temperature over time"
          data={history.temperature}
          color="#ef4444"
          unit="°C"
        />
        <TimeSeriesChart
          title="Throughput Trend"
          description="Average IoT device throughput"
          data={history.throughput}
          color="#3b82f6"
          unit=" Mbps"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
            <CardDescription>Current device connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Online</span>
                </div>
                <Badge variant="outline">{summary.onlineDevices}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Warning/Offline</span>
                </div>
                <Badge variant="outline">
                  {summary.totalIoTDevices - summary.onlineDevices}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Throughput</CardTitle>
            <CardDescription>Data transfer rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.averageThroughput.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground"> Mbps</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to detailed views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/pcb">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  PCB Analytics (Fake)
                </Button>
              </Link>
              <Link to="/iot-edge">
                <Button variant="outline" className="w-full justify-start">
                  <Network className="mr-2 h-4 w-4" />
                  IoT Edge (Fake)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
