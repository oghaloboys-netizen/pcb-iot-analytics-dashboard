import { PCBMetrics, IoTEdgeMetrics, ComponentHealth, SensorData, DashboardSummary } from '@/types/analytics';

const componentNames = [
  'CPU', 'GPU', 'Memory Controller', 'Power IC', 'RF Module',
  'Bluetooth Module', 'WiFi Module', 'ADC', 'DAC', 'Regulator'
];

const sensorTypes = ['Temperature', 'Humidity', 'Pressure', 'Accelerometer', 'Gyroscope', 'Magnetometer'];

// Generate random value within range
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate random integer
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate component health data
const generateComponentHealth = (): ComponentHealth[] => {
  const count = randomInt(5, 10);
  return Array.from({ length: count }, (_, i) => ({
    id: `comp-${i}`,
    name: componentNames[i % componentNames.length],
    status: (['healthy', 'warning', 'critical'] as const)[randomInt(0, 2)],
    temperature: randomBetween(25, 85),
    voltage: randomBetween(1.8, 5.0),
  }));
};

// Generate sensor readings
const generateSensorReadings = (): SensorData[] => {
  return sensorTypes.map((type, i) => ({
    sensorId: `sensor-${i}`,
    type,
    value: randomBetween(0, 100),
    unit: type === 'Temperature' ? '°C' : type === 'Pressure' ? 'hPa' : 'units',
    timestamp: new Date(),
  }));
};

// Generate PCB metrics
export const generatePCBMetrics = (): PCBMetrics => {
  return {
    temperature: randomBetween(30, 75),
    voltage: randomBetween(3.0, 5.0),
    current: randomBetween(0.1, 2.5),
    signalIntegrity: randomBetween(85, 100),
    componentHealth: generateComponentHealth(),
    timestamp: new Date(),
  };
};

// Generate IoT Edge metrics
export const generateIoTEdgeMetrics = (deviceId: string, deviceName: string): IoTEdgeMetrics => {
  const statusRoll = Math.random();
  const status: 'online' | 'offline' | 'warning' = 
    statusRoll > 0.9 ? 'offline' : statusRoll > 0.75 ? 'warning' : 'online';

  return {
    deviceId,
    deviceName,
    status,
    dataThroughput: status === 'offline' ? 0 : randomBetween(10, 1000),
    networkLatency: status === 'offline' ? 999 : randomBetween(5, 150),
    batteryLevel: status === 'offline' ? 0 : randomBetween(20, 100),
    powerConsumption: status === 'offline' ? 0 : randomBetween(0.5, 5.0),
    sensorReadings: generateSensorReadings(),
    timestamp: new Date(),
  };
};

// Generate multiple IoT devices
export const generateIoTDevices = (count: number = 10): IoTEdgeMetrics[] => {
  const deviceNames = [
    'Edge Sensor 1', 'Edge Sensor 2', 'Gateway Node A', 'Gateway Node B',
    'Field Monitor X', 'Field Monitor Y', 'IoT Device Alpha', 'IoT Device Beta',
    'Smart Sensor 1', 'Smart Sensor 2', 'Hub Device A', 'Hub Device B'
  ];

  return Array.from({ length: count }, (_, i) =>
    generateIoTEdgeMetrics(`device-${i}`, deviceNames[i % deviceNames.length])
  );
};

// Generate dashboard summary
export const generateDashboardSummary = (
  pcbs: PCBMetrics[],
  iotDevices: IoTEdgeMetrics[]
): DashboardSummary => {
  const onlineDevices = iotDevices.filter(d => d.status === 'online').length;
  const avgTemperature = pcbs.length > 0
    ? pcbs.reduce((sum, pcb) => sum + pcb.temperature, 0) / pcbs.length
    : 0;
  const avgThroughput = iotDevices.length > 0
    ? iotDevices.reduce((sum, dev) => sum + dev.dataThroughput, 0) / iotDevices.length
    : 0;
  const criticalAlerts = pcbs.reduce((sum, pcb) => 
    sum + pcb.componentHealth.filter(c => c.status === 'critical').length, 0
  ) + iotDevices.filter(d => d.status === 'warning' || d.status === 'offline').length;

  return {
    totalPCBs: pcbs.length,
    totalIoTDevices: iotDevices.length,
    onlineDevices,
    averageTemperature: avgTemperature,
    averageThroughput: avgThroughput,
    criticalAlerts,
  };
};
