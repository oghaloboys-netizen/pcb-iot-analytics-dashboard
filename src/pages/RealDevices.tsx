import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wifi,
  Usb,
  Radio,
  Activity,
  CheckCircle,
  XCircle,
  Square,
  Trash2,
  Cpu,
  Zap,
  Gauge,
  Network,
  Thermometer,
  Radio as RelayIcon,
  Waves as VibrationIcon,
} from 'lucide-react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { MetricCard } from '@/components/charts/MetricCard';

type DeviceType = 'iot' | 'pcb' | 'relay' | 'vibration';
type ConnectionType = 'serial' | 'mqtt' | 'http' | 'websocket';

interface RealDevice {
  id: string;
  name: string;
  deviceType: DeviceType;
  connectionType: ConnectionType;
  status: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: Date | null;
  readings: DeviceReading[];
  config?: any;
}

interface DeviceReading {
  timestamp: Date;
  [key: string]: any;
}

export default function RealDevices() {
  const [devices, setDevices] = useState<RealDevice[]>([]);
  const [activeTab, setActiveTab] = useState<DeviceType>('iot');
  const [connectionType, setConnectionType] = useState<ConnectionType>('serial');
  const [deviceName, setDeviceName] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<any>({});

  const portsRef = useRef<Map<string, SerialPort>>(new Map());
  const readersRef = useRef<Map<string, ReadableStreamDefaultReader>>(new Map());
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const isWebSerialAvailable = 'serial' in navigator;

  // Connect device based on type and connection method
  const connectDevice = async () => {
    const deviceId = `${activeTab}-${Date.now()}`;
    
    try {
      let device: RealDevice = {
        id: deviceId,
        name: deviceName || `${getDeviceTypeLabel(activeTab)} Device ${devices.filter(d => d.deviceType === activeTab).length + 1}`,
        deviceType: activeTab,
        connectionType,
        status: 'connecting',
        lastUpdate: null,
        readings: [],
        config: connectionConfig,
      };

      if (connectionType === 'serial') {
        device = await connectSerial(deviceId, device);
      } else if (connectionType === 'mqtt') {
        device = await connectMQTT(deviceId, device);
      } else if (connectionType === 'http') {
        device = await connectHTTP(deviceId, device);
      } else if (connectionType === 'websocket') {
        device = await connectWebSocket(deviceId, device);
      }

      setDevices((prev) => [...prev, device]);
      setDeviceName('');
      setConnectionConfig({});
    } catch (error: any) {
      alert(`Failed to connect: ${error.message}`);
    }
  };

  // Serial connection
  const connectSerial = async (deviceId: string, device: RealDevice): Promise<RealDevice> => {
    if (!isWebSerialAvailable) {
      throw new Error('Web Serial API requires Chrome, Edge, or Opera');
    }

    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: connectionConfig.baudRate || 115200 });

    portsRef.current.set(deviceId, port);
    const reader = port.readable?.getReader();
    if (reader) {
      readersRef.current.set(deviceId, reader);
    }

    device.status = 'connected';
    device.lastUpdate = new Date();

    readSerialData(deviceId, port, reader);
    return device;
  };

  // Read serial data
  const readSerialData = async (deviceId: string, port: SerialPort, reader: ReadableStreamDefaultReader) => {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              updateDeviceReading(deviceId, data);
            } catch (e) {
              const parsed = parseDeviceData(line, devices.find(d => d.id === deviceId)?.deviceType);
              if (parsed) {
                updateDeviceReading(deviceId, parsed);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Serial read error:', error);
      disconnectDevice(deviceId);
    }
  };

  // MQTT connection
  const connectMQTT = async (deviceId: string, device: RealDevice): Promise<RealDevice> => {
    if (!connectionConfig.broker || !connectionConfig.topic) {
      throw new Error('MQTT broker and topic required');
    }

    device.status = 'connected';
    device.lastUpdate = new Date();

    // Simulate MQTT connection (in production, use MQTT.js)
    simulateMQTTData(deviceId, connectionConfig.topic, device.deviceType);
    return device;
  };

  // HTTP connection
  const connectHTTP = async (deviceId: string, device: RealDevice): Promise<RealDevice> => {
    if (!connectionConfig.url) {
      throw new Error('HTTP URL required');
    }

    try {
      const response = await fetch(connectionConfig.url);
      const data = await response.json();
      
      device.status = 'connected';
      device.lastUpdate = new Date();
      updateDeviceReading(deviceId, data);

      // Start polling
      const interval = setInterval(async () => {
        try {
          const res = await fetch(connectionConfig.url);
          const data = await res.json();
          updateDeviceReading(deviceId, data);
        } catch (error) {
          console.error('HTTP polling error:', error);
        }
      }, connectionConfig.pollInterval || 2000);

      pollingIntervalsRef.current.set(deviceId, interval);
      return device;
    } catch (error) {
      throw new Error('Failed to connect to HTTP endpoint');
    }
  };

  // WebSocket connection
  const connectWebSocket = async (deviceId: string, device: RealDevice): Promise<RealDevice> => {
    if (!connectionConfig.url) {
      throw new Error('WebSocket URL required');
    }

    try {
      const ws = new WebSocket(connectionConfig.url);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          updateDeviceReading(deviceId, data);
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onopen = () => {
        device.status = 'connected';
        device.lastUpdate = new Date();
        setDevices((prev) => prev.map(d => d.id === deviceId ? device : d));
      };

      ws.onerror = () => {
        throw new Error('WebSocket connection failed');
      };

      return device;
    } catch (error) {
      throw new Error('Failed to connect to WebSocket');
    }
  };

  // Simulate MQTT data (replace with real MQTT client)
  const simulateMQTTData = (deviceId: string, topic: string, deviceType: DeviceType) => {
    const interval = setInterval(() => {
      setDevices((prev) => {
        const device = prev.find(d => d.id === deviceId);
        if (!device || device.status !== 'connected') {
          clearInterval(interval);
          return prev;
        }
        const mockData = generateMockDataForDeviceType(deviceType);
        // Update reading directly
        const reading: DeviceReading = {
          timestamp: new Date(),
          ...mockData,
        };
        return prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                lastUpdate: new Date(),
                readings: [...d.readings.slice(-49), reading],
              }
            : d
        );
      });
    }, 2000);

    pollingIntervalsRef.current.set(deviceId, interval);
  };

  // Generate mock data based on device type
  const generateMockDataForDeviceType = (deviceType: DeviceType): any => {
    switch (deviceType) {
      case 'iot':
        return {
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 30,
          signalStrength: -50 - Math.random() * 30,
        };
      case 'pcb':
        return {
          temperature: 30 + Math.random() * 40,
          voltage: 3.3 + Math.random() * 1.7,
          current: 0.1 + Math.random() * 2.0,
          signalIntegrity: 85 + Math.random() * 15,
        };
      case 'relay':
        return {
          state: Math.random() > 0.5 ? 'on' : 'off',
          voltage: 5.0 + Math.random() * 5.0,
          current: 0.01 + Math.random() * 0.5,
        };
      case 'vibration':
        return {
          amplitude: Math.random() * 10,
          frequency: 50 + Math.random() * 50,
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        };
      default:
        return {};
    }
  };

  // Parse device data based on device type
  const parseDeviceData = (line: string, deviceType?: DeviceType): any => {
    const data: any = {};
    
    // Common patterns
    const tempMatch = line.match(/temp[erature]*[:=]\s*([\d.]+)/i);
    const humMatch = line.match(/hum[idity]*[:=]\s*([\d.]+)/i);
    const voltMatch = line.match(/volt[age]*[:=]\s*([\d.]+)/i);
    const currMatch = line.match(/current[:=]\s*([\d.]+)/i);
    const stateMatch = line.match(/state[:=]\s*(on|off|true|false|\d+)/i);
    const vibMatch = line.match(/vibr[ation]*[:=]\s*([\d.]+)/i);
    
    if (tempMatch) data.temperature = parseFloat(tempMatch[1]);
    if (humMatch) data.humidity = parseFloat(humMatch[1]);
    if (voltMatch) data.voltage = parseFloat(voltMatch[1]);
    if (currMatch) data.current = parseFloat(currMatch[1]);
    if (stateMatch) data.state = stateMatch[1];
    if (vibMatch) data.vibration = parseFloat(vibMatch[1]);
    
    return Object.keys(data).length > 0 ? data : null;
  };

  // Update device reading
  const updateDeviceReading = (deviceId: string, data: any) => {
    const reading: DeviceReading = {
      timestamp: new Date(),
      ...data,
    };

    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              lastUpdate: new Date(),
              readings: [...device.readings.slice(-49), reading],
            }
          : device
      )
    );
  };

  // Disconnect device
  const disconnectDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    
    if (device?.connectionType === 'serial') {
      const port = portsRef.current.get(deviceId);
      const reader = readersRef.current.get(deviceId);
      try {
        await reader?.cancel();
        await port?.close();
        portsRef.current.delete(deviceId);
        readersRef.current.delete(deviceId);
      } catch (error) {
        console.error('Serial disconnect error:', error);
      }
    }

    const interval = pollingIntervalsRef.current.get(deviceId);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(deviceId);
    }

    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, status: 'disconnected' } : d
      )
    );
  };

  // Remove device
  const removeDevice = async (deviceId: string) => {
    await disconnectDevice(deviceId);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  // Get device type label
  const getDeviceTypeLabel = (type: DeviceType): string => {
    switch (type) {
      case 'iot':
        return 'IoT';
      case 'pcb':
        return 'PCB';
      case 'relay':
        return 'Relay Board';
      case 'vibration':
        return 'Vibration Sensor';
      default:
        return 'Device';
    }
  };

  // Get device type icon
  const getDeviceTypeIcon = (type: DeviceType) => {
    switch (type) {
      case 'iot':
        return Network;
      case 'pcb':
        return Cpu;
      case 'relay':
        return RelayIcon;
      case 'vibration':
        return VibrationIcon;
      default:
        return Activity;
    }
  };

  // Get filtered devices by type
  const getDevicesByType = (type: DeviceType) => devices.filter(d => d.deviceType === type);

  // Render connection config based on connection type
  const renderConnectionConfig = () => {
    switch (connectionType) {
      case 'serial':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Baud Rate (default: 115200)"
              type="number"
              value={connectionConfig.baudRate || ''}
              onChange={(e) => setConnectionConfig({ ...connectionConfig, baudRate: parseInt(e.target.value) || 115200 })}
            />
          </div>
        );
      case 'mqtt':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="MQTT Broker (e.g., mqtt://broker.hivemq.com:1883)"
              value={connectionConfig.broker || ''}
              onChange={(e) => setConnectionConfig({ ...connectionConfig, broker: e.target.value })}
            />
            <Input
              placeholder="Topic (e.g., devices/sensor/data)"
              value={connectionConfig.topic || ''}
              onChange={(e) => setConnectionConfig({ ...connectionConfig, topic: e.target.value })}
            />
          </div>
        );
      case 'http':
        return (
          <div className="space-y-4">
            <Input
              placeholder="HTTP Endpoint URL"
              value={connectionConfig.url || ''}
              onChange={(e) => setConnectionConfig({ ...connectionConfig, url: e.target.value })}
            />
            <Input
              placeholder="Poll Interval (ms, default: 2000)"
              type="number"
              value={connectionConfig.pollInterval || ''}
              onChange={(e) => setConnectionConfig({ ...connectionConfig, pollInterval: parseInt(e.target.value) || 2000 })}
            />
          </div>
        );
      case 'websocket':
        return (
          <Input
            placeholder="WebSocket URL (e.g., ws://192.168.1.100:8080)"
            value={connectionConfig.url || ''}
            onChange={(e) => setConnectionConfig({ ...connectionConfig, url: e.target.value })}
          />
        );
      default:
        return null;
    }
  };

  // Render device reading cards
  const renderDeviceReadings = (device: RealDevice) => {
    const latestReading = device.readings.length > 0 ? device.readings[device.readings.length - 1] : null;
    if (!latestReading) return <p className="text-muted-foreground">Waiting for data...</p>;

    const cards: JSX.Element[] = [];
    
    // Render based on device type
    if (device.deviceType === 'iot') {
      if (latestReading.temperature !== undefined) {
        cards.push(
          <MetricCard
            key="temp"
            title="Temperature"
            value={`${latestReading.temperature.toFixed(1)}°C`}
            icon={<Thermometer className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.humidity !== undefined) {
        cards.push(
          <MetricCard
            key="hum"
            title="Humidity"
            value={`${latestReading.humidity.toFixed(1)}%`}
            icon={<Activity className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.signalStrength !== undefined) {
        cards.push(
          <MetricCard
            key="signal"
            title="Signal Strength"
            value={`${latestReading.signalStrength.toFixed(0)} dBm`}
            icon={<Network className="h-4 w-4" />}
          />
        );
      }
    } else if (device.deviceType === 'pcb') {
      if (latestReading.temperature !== undefined) {
        cards.push(
          <MetricCard
            key="temp"
            title="Temperature"
            value={`${latestReading.temperature.toFixed(1)}°C`}
            icon={<Thermometer className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.voltage !== undefined) {
        cards.push(
          <MetricCard
            key="volt"
            title="Voltage"
            value={`${latestReading.voltage.toFixed(2)}V`}
            icon={<Zap className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.current !== undefined) {
        cards.push(
          <MetricCard
            key="curr"
            title="Current"
            value={`${latestReading.current.toFixed(2)}A`}
            icon={<Gauge className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.signalIntegrity !== undefined) {
        cards.push(
          <MetricCard
            key="signal"
            title="Signal Integrity"
            value={`${latestReading.signalIntegrity.toFixed(1)}%`}
            icon={<Activity className="h-4 w-4" />}
          />
        );
      }
    } else if (device.deviceType === 'relay') {
      if (latestReading.state !== undefined) {
        cards.push(
          <MetricCard
            key="state"
            title="Relay State"
            value={latestReading.state === 'on' || latestReading.state === 'true' || latestReading.state === 1 ? 'ON' : 'OFF'}
            icon={<RelayIcon className="h-4 w-4" />}
            variant={latestReading.state === 'on' || latestReading.state === 'true' || latestReading.state === 1 ? 'success' : 'default'}
          />
        );
      }
      if (latestReading.voltage !== undefined) {
        cards.push(
          <MetricCard
            key="volt"
            title="Voltage"
            value={`${latestReading.voltage.toFixed(2)}V`}
            icon={<Zap className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.current !== undefined) {
        cards.push(
          <MetricCard
            key="curr"
            title="Current"
            value={`${latestReading.current.toFixed(3)}A`}
            icon={<Gauge className="h-4 w-4" />}
          />
        );
      }
    } else if (device.deviceType === 'vibration') {
      if (latestReading.amplitude !== undefined) {
        cards.push(
          <MetricCard
            key="amp"
            title="Amplitude"
            value={`${latestReading.amplitude.toFixed(2)} mm/s`}
            icon={<VibrationIcon className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.frequency !== undefined) {
        cards.push(
          <MetricCard
            key="freq"
            title="Frequency"
            value={`${latestReading.frequency.toFixed(1)} Hz`}
            icon={<Activity className="h-4 w-4" />}
          />
        );
      }
      if (latestReading.x !== undefined || latestReading.y !== undefined || latestReading.z !== undefined) {
        cards.push(
          <div key="axes" className="space-y-2">
            <p className="text-sm font-medium">Acceleration Axes</p>
            {latestReading.x !== undefined && (
              <p className="text-sm">X: {latestReading.x.toFixed(2)} g</p>
            )}
            {latestReading.y !== undefined && (
              <p className="text-sm">Y: {latestReading.y.toFixed(2)} g</p>
            )}
            {latestReading.z !== undefined && (
              <p className="text-sm">Z: {latestReading.z.toFixed(2)} g</p>
            )}
          </div>
        );
      }
    }

    return cards.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards}
      </div>
    ) : (
      <div className="space-y-2">
        {Object.entries(latestReading)
          .filter(([key]) => key !== 'timestamp')
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm font-medium capitalize">{key}:</span>
              <span className="text-sm">{String(value)}</span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Real Devices</h2>
        <p className="text-muted-foreground">
          Connect to real IoT devices, PCB devices, relay boards, and vibration sensors
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DeviceType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="iot">
            <Network className="mr-2 h-4 w-4" />
            IoT Devices
          </TabsTrigger>
          <TabsTrigger value="pcb">
            <Cpu className="mr-2 h-4 w-4" />
            PCB Devices
          </TabsTrigger>
          <TabsTrigger value="relay">
            <RelayIcon className="mr-2 h-4 w-4" />
            Relay Boards
          </TabsTrigger>
          <TabsTrigger value="vibration">
            <VibrationIcon className="mr-2 h-4 w-4" />
            Vibration Sensors
          </TabsTrigger>
        </TabsList>

        {/* Connection Panel */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Connect {getDeviceTypeLabel(activeTab)}</CardTitle>
            <CardDescription>Choose connection method and configure your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={connectionType} onValueChange={(v: any) => setConnectionType(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serial">
                    <div className="flex items-center gap-2">
                      <Usb className="h-4 w-4" />
                      Serial (USB)
                    </div>
                  </SelectItem>
                  <SelectItem value="mqtt">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      MQTT
                    </div>
                  </SelectItem>
                  <SelectItem value="http">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      HTTP/REST
                    </div>
                  </SelectItem>
                  <SelectItem value="websocket">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      WebSocket
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Device Name (optional)"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="flex-1"
              />
            </div>

            {renderConnectionConfig()}

            <Button onClick={connectDevice} className="w-full">
              <Activity className="mr-2 h-4 w-4" />
              Connect Device
            </Button>

            {connectionType === 'serial' && !isWebSerialAvailable && (
              <p className="text-sm text-muted-foreground">
                Web Serial API requires Chrome, Edge, or Opera browser
              </p>
            )}
          </CardContent>
        </Card>

        {/* Device List for each tab */}
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {getDevicesByType(activeTab).length > 0 ? (
            getDevicesByType(activeTab).map((device) => {
              const Icon = getDeviceTypeIcon(device.deviceType);
              const readingHistory = device.readings.map((r) => ({
                timestamp: r.timestamp,
                value: r.temperature || r.humidity || r.voltage || r.amplitude || 0,
              }));

              return (
                <Card key={device.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <CardTitle>{device.name}</CardTitle>
                        <Badge variant={device.status === 'connected' ? 'default' : 'secondary'}>
                          {device.status === 'connected' ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {device.status}
                        </Badge>
                        <Badge variant="outline">{device.connectionType.toUpperCase()}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => disconnectDevice(device.id)}
                          disabled={device.status === 'disconnected'}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeDevice(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {device.lastUpdate && (
                      <CardDescription>
                        Last update: {device.lastUpdate.toLocaleTimeString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderDeviceReadings(device)}
                    {readingHistory.length > 1 && (
                      <div className="mt-4">
                        <TimeSeriesChart
                          title="Reading History"
                          data={readingHistory}
                          color="#3b82f6"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {(() => {
                  const EmptyIcon = getDeviceTypeIcon(activeTab);
                  return <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />;
                })()}
                <p className="text-muted-foreground">No {getDeviceTypeLabel(activeTab).toLowerCase()} connected</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect a device to start receiving real-time readings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
