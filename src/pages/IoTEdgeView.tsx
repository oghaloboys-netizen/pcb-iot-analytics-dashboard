import { useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { MetricCard } from '@/components/charts/MetricCard';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { BarChart } from '@/components/charts/BarChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Network, Activity, Battery, Zap, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useMetricsContext } from '@/contexts/MetricsContext';

export default function IoTEdgeView() {
  const { iotDevices, history } = useRealTimeData();
  const { setMetrics } = useMetricsContext();

  const onlineDevices = iotDevices.filter((d) => d.status === 'online').length;
  const avgThroughput = iotDevices.reduce((sum, d) => sum + d.dataThroughput, 0) / iotDevices.length;
  const avgLatency = iotDevices.filter((d) => d.status !== 'offline')
    .reduce((sum, d) => sum + d.networkLatency, 0) / onlineDevices || 0;

  useEffect(() => {
    setMetrics({
      iotDevices: {
        total: iotDevices.length,
        online: onlineDevices,
        avgThroughput,
        avgLatency,
      },
    });
  }, [iotDevices, onlineDevices, avgThroughput, avgLatency, setMetrics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const avgBattery = iotDevices.filter((d) => d.status !== 'offline')
    .reduce((sum, d) => sum + d.batteryLevel, 0) / onlineDevices || 0;

  const throughputData = iotDevices.map((device) => ({
    name: device.deviceName,
    throughput: device.dataThroughput,
    latency: device.networkLatency,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">IoT Edge (Fake)</h2>
            <p className="text-muted-foreground">
              Monitor IoT edge devices, network performance, and sensor data
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
          title="Online Devices"
          value={`${onlineDevices}/${iotDevices.length}`}
          description="Active devices"
          icon={<Network className="h-4 w-4" />}
          variant={onlineDevices === iotDevices.length ? 'success' : 'warning'}
        />
        <MetricCard
          title="Avg Throughput"
          value={`${avgThroughput.toFixed(2)} Mbps`}
          description="Data transfer rate"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Latency"
          value={`${avgLatency.toFixed(0)} ms`}
          description="Network latency"
          icon={<Wifi className="h-4 w-4" />}
          variant={avgLatency > 100 ? 'warning' : 'success'}
        />
        <MetricCard
          title="Avg Battery"
          value={`${avgBattery.toFixed(0)}%`}
          description="Battery level"
          icon={<Battery className="h-4 w-4" />}
          variant={avgBattery < 30 ? 'warning' : 'success'}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <TimeSeriesChart
          title="Throughput Over Time"
          description="Average device throughput history"
          data={history.throughput}
          color="#3b82f6"
          unit=" Mbps"
        />
        <BarChart
          title="Device Throughput"
          description="Current throughput by device"
          data={throughputData}
          dataKey="name"
          bars={[
            { dataKey: 'throughput', name: 'Throughput (Mbps)', color: '#3b82f6' },
          ]}
        />
      </div>

      {/* Device Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
          <CardDescription>Current status and metrics for all IoT edge devices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Power</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iotDevices.map((device) => (
                <TableRow key={device.deviceId}>
                  <TableCell className="font-medium">{device.deviceName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(device.status)}>
                      {getStatusIcon(device.status)}
                      <span className="ml-1">{device.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `${device.dataThroughput.toFixed(2)} Mbps`
                    )}
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `${device.networkLatency.toFixed(0)} ms`
                    )}
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `${device.batteryLevel.toFixed(0)}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {device.status === 'offline' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `${device.powerConsumption.toFixed(2)}W`
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sensor Data */}
      {iotDevices.length > 0 && iotDevices[0].sensorReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sensor Readings</CardTitle>
            <CardDescription>Latest sensor data from edge devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {iotDevices[0].sensorReadings.map((sensor) => (
                <div key={sensor.sensorId} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sensor.type}</p>
                      <p className="text-2xl font-bold">
                        {sensor.value.toFixed(2)} {sensor.unit}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
