import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wifi, 
  Usb, 
  Radio, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Square,
  Trash2
} from 'lucide-react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { MetricCard } from '@/components/charts/MetricCard';

interface ESP32Device {
  id: string;
  name: string;
  connectionType: 'serial' | 'mqtt' | 'http';
  status: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: Date | null;
  readings: DeviceReading[];
}

interface DeviceReading {
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  voltage?: number;
  current?: number;
  signalStrength?: number;
  [key: string]: any;
}

export default function ESP32Devices() {
  const [devices, setDevices] = useState<ESP32Device[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<'serial' | 'mqtt' | 'http'>('serial');
  const [mqttBroker, setMqttBroker] = useState('');
  const [mqttTopic, setMqttTopic] = useState('');
  const [httpUrl, setHttpUrl] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Check if Web Serial API is available
  const isWebSerialAvailable = 'serial' in navigator;

  // Connect via Web Serial (USB)
  const connectSerial = async () => {
    if (!isWebSerialAvailable) {
      alert('Web Serial API is not available in your browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      portRef.current = port;
      const reader = port.readable?.getReader();
      if (reader) {
        readerRef.current = reader;
      }

      const deviceId = `esp32-${Date.now()}`;
      const newDevice: ESP32Device = {
        id: deviceId,
        name: deviceName || `ESP32 Device ${devices.length + 1}`,
        connectionType: 'serial',
        status: 'connected',
        lastUpdate: new Date(),
        readings: [],
      };

      setDevices((prev) => [...prev, newDevice]);
      setDeviceName('');

      // Start reading data
      readSerialData(deviceId, port, reader);
    } catch (error) {
      console.error('Serial connection error:', error);
      alert('Failed to connect to ESP32 device. Make sure it\'s connected via USB.');
    }
  };

  // Read data from serial port
  const readSerialData = async (deviceId: string, _port: SerialPort, reader: ReadableStreamDefaultReader) => {
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
              // Not JSON, try to parse as sensor data format
              const parsed = parseSensorData(line);
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

  // Parse sensor data from various formats
  const parseSensorData = (line: string): any => {
    // Try common formats like "Temp: 25.5, Hum: 60.2"
    const tempMatch = line.match(/temp[erature]*[:=]\s*([\d.]+)/i);
    const humMatch = line.match(/hum[idity]*[:=]\s*([\d.]+)/i);
    const pressMatch = line.match(/pres[sure]*[:=]\s*([\d.]+)/i);
    
    if (tempMatch || humMatch || pressMatch) {
      return {
        temperature: tempMatch ? parseFloat(tempMatch[1]) : undefined,
        humidity: humMatch ? parseFloat(humMatch[1]) : undefined,
        pressure: pressMatch ? parseFloat(pressMatch[1]) : undefined,
      };
    }
    return null;
  };

  // Connect via MQTT
  const connectMQTT = async () => {
    if (!mqttBroker || !mqttTopic) {
      alert('Please enter MQTT broker and topic');
      return;
    }

    const deviceId = `esp32-mqtt-${Date.now()}`;
    const newDevice: ESP32Device = {
      id: deviceId,
      name: deviceName || `ESP32 MQTT Device ${devices.length + 1}`,
      connectionType: 'mqtt',
      status: 'connecting',
      lastUpdate: null,
      readings: [],
    };

    setDevices((prev) => [...prev, newDevice]);
    setDeviceName('');
    setMqttBroker('');
    setMqttTopic('');

    // Simulate MQTT connection (in real implementation, use MQTT.js library)
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? { ...d, status: 'connected', lastUpdate: new Date() }
            : d
        )
      );
      
      // Simulate MQTT data (replace with real MQTT subscription)
      simulateMQTTData(deviceId);
    }, 1000);
  };

  // Connect via HTTP/REST API
  const connectHTTP = async () => {
    if (!httpUrl) {
      alert('Please enter HTTP endpoint URL');
      return;
    }

    const deviceId = `esp32-http-${Date.now()}`;
    const newDevice: ESP32Device = {
      id: deviceId,
      name: deviceName || `ESP32 HTTP Device ${devices.length + 1}`,
      connectionType: 'http',
      status: 'connecting',
      lastUpdate: null,
      readings: [],
    };

    setDevices((prev) => [...prev, newDevice]);
    setDeviceName('');

    // Test connection
    try {
      const response = await fetch(httpUrl);
      const data = await response.json();
      
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? { ...d, status: 'connected', lastUpdate: new Date() }
            : d
        )
      );
      
      updateDeviceReading(deviceId, data);
      startHTTPPolling(deviceId, httpUrl);
    } catch (error) {
      alert('Failed to connect to HTTP endpoint. Make sure the ESP32 web server is running.');
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    }
  };

  // Start polling HTTP endpoint
  const startHTTPPolling = (deviceId: string, url: string) => {
    const interval = setInterval(async () => {
      const device = devices.find((d) => d.id === deviceId);
      if (!device || device.status !== 'connected') {
        clearInterval(interval);
        return;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        updateDeviceReading(deviceId, data);
      } catch (error) {
        console.error('HTTP polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Simulate MQTT data (replace with real MQTT subscription)
  const simulateMQTTData = (deviceId: string) => {
    const interval = setInterval(() => {
      const device = devices.find((d) => d.id === deviceId);
      if (!device || device.status !== 'connected') {
        clearInterval(interval);
        return;
      }

      const mockData = {
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 30,
        pressure: 1000 + Math.random() * 50,
      };
      updateDeviceReading(deviceId, mockData);
    }, 2000);
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
              readings: [...device.readings.slice(-49), reading], // Keep last 50 readings
            }
          : device
      )
    );
  };

  // Disconnect device
  const disconnectDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    
    if (device?.connectionType === 'serial' && readerRef.current) {
      try {
        await readerRef.current.cancel();
        await portRef.current?.close();
        readerRef.current = null;
        portRef.current = null;
      } catch (error) {
        console.error('Serial disconnect error:', error);
      }
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

  // Handle connection
  const handleConnect = () => {
    if (selectedConnection === 'serial') {
      connectSerial();
    } else if (selectedConnection === 'mqtt') {
      connectMQTT();
    } else if (selectedConnection === 'http') {
      connectHTTP();
    }
  };

  // Get latest reading for a device
  const getLatestReading = (device: ESP32Device): DeviceReading | null => {
    return device.readings.length > 0 ? device.readings[device.readings.length - 1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ESP32 Devices</h2>
          <p className="text-muted-foreground">
            Connect to ESP32 devices and fetch real-time sensor readings
          </p>
        </div>
      </div>

      {/* Connection Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Connect ESP32 Device</CardTitle>
          <CardDescription>Choose connection method and configure your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedConnection} onValueChange={(v: any) => setSelectedConnection(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Connection Type" />
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
              </SelectContent>
            </Select>

            <Input
              placeholder="Device Name (optional)"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="flex-1"
            />
          </div>

          {selectedConnection === 'mqtt' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="MQTT Broker (e.g., mqtt://broker.hivemq.com:1883)"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
              />
              <Input
                placeholder="Topic (e.g., esp32/sensor/data)"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
              />
            </div>
          )}

          {selectedConnection === 'http' && (
            <Input
              placeholder="HTTP Endpoint (e.g., http://192.168.1.100/api/sensors)"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
            />
          )}

          <Button onClick={handleConnect} className="w-full">
            <Activity className="mr-2 h-4 w-4" />
            Connect Device
          </Button>

          {selectedConnection === 'serial' && !isWebSerialAvailable && (
            <p className="text-sm text-muted-foreground">
              Web Serial API requires Chrome, Edge, or Opera browser
            </p>
          )}
        </CardContent>
      </Card>

      {/* Connected Devices */}
      {devices.length > 0 && (
        <div className="grid gap-4">
          {devices.map((device) => {
            const latestReading = getLatestReading(device);
            const readingHistory = device.readings.map((r) => ({
              timestamp: r.timestamp,
              value: r.temperature || r.humidity || r.pressure || 0,
            }));

            return (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>{device.name}</CardTitle>
                      <Badge
                        variant={device.status === 'connected' ? 'default' : 'secondary'}
                      >
                        {device.status === 'connected' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {device.status}
                      </Badge>
                      <Badge variant="outline">
                        {device.connectionType.toUpperCase()}
                      </Badge>
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
                  {latestReading ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {latestReading.temperature !== undefined && (
                          <MetricCard
                            title="Temperature"
                            value={`${latestReading.temperature.toFixed(1)}°C`}
                            icon={<Activity className="h-4 w-4" />}
                          />
                        )}
                        {latestReading.humidity !== undefined && (
                          <MetricCard
                            title="Humidity"
                            value={`${latestReading.humidity.toFixed(1)}%`}
                            icon={<Activity className="h-4 w-4" />}
                          />
                        )}
                        {latestReading.pressure !== undefined && (
                          <MetricCard
                            title="Pressure"
                            value={`${latestReading.pressure.toFixed(1)} hPa`}
                            icon={<Activity className="h-4 w-4" />}
                          />
                        )}
                        {latestReading.voltage !== undefined && (
                          <MetricCard
                            title="Voltage"
                            value={`${latestReading.voltage.toFixed(2)}V`}
                            icon={<Activity className="h-4 w-4" />}
                          />
                        )}
                      </div>
                      {readingHistory.length > 1 && (
                        <TimeSeriesChart
                          title="Reading History"
                          data={readingHistory}
                          color="#3b82f6"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Waiting for data...</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {devices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No devices connected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Connect an ESP32 device to start receiving sensor readings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
