export type DeviceStatus = 'online' | 'offline' | 'warning';

export interface ComponentHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  temperature: number;
  voltage: number;
}

export interface SensorData {
  sensorId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface PCBMetrics {
  temperature: number;
  voltage: number;
  current: number;
  signalIntegrity: number;
  componentHealth: ComponentHealth[];
  timestamp: Date;
}

export interface IoTEdgeMetrics {
  deviceId: string;
  deviceName: string;
  status: DeviceStatus;
  dataThroughput: number;
  networkLatency: number;
  batteryLevel: number;
  powerConsumption: number;
  sensorReadings: SensorData[];
  timestamp: Date;
}

export interface MetricHistory {
  timestamp: Date;
  value: number;
}

export interface DashboardSummary {
  totalPCBs: number;
  totalIoTDevices: number;
  onlineDevices: number;
  averageTemperature: number;
  averageThroughput: number;
  criticalAlerts: number;
}
