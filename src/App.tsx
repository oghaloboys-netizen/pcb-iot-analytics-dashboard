import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricsProvider } from '@/contexts/MetricsContext';
import Dashboard from '@/pages/Dashboard';
import PCBView from '@/pages/PCBView';
import IoTEdgeView from '@/pages/IoTEdgeView';
import ESP32Devices from '@/pages/ESP32Devices';
import RealDevices from '@/pages/RealDevices';

function App() {
  return (
    <BrowserRouter>
      <MetricsProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pcb" element={<PCBView />} />
            <Route path="/iot-edge" element={<IoTEdgeView />} />
            <Route path="/esp32-devices" element={<ESP32Devices />} />
            <Route path="/real-devices" element={<RealDevices />} />
          </Routes>
        </MainLayout>
      </MetricsProvider>
    </BrowserRouter>
  );
}

export default App;
