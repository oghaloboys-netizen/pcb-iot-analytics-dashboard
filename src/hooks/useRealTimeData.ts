import { useState, useEffect, useCallback } from 'react';
import { PCBMetrics, IoTEdgeMetrics, MetricHistory, DashboardSummary } from '@/types/analytics';
import { generatePCBMetrics, generateIoTDevices, generateDashboardSummary } from '@/lib/mockData';

interface UseRealTimeDataOptions {
  updateInterval?: number;
  maxHistoryLength?: number;
}

interface UseRealTimeDataReturn {
  pcbMetrics: PCBMetrics;
  iotDevices: IoTEdgeMetrics[];
  summary: DashboardSummary;
  history: {
    temperature: MetricHistory[];
    voltage: MetricHistory[];
    current: MetricHistory[];
    throughput: MetricHistory[];
  };
  isLoading: boolean;
  refresh: () => void;
}

export const useRealTimeData = (
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn => {
  const { updateInterval = 3000, maxHistoryLength = 50 } = options;

  const [pcbMetrics, setPcbMetrics] = useState<PCBMetrics>(generatePCBMetrics());
  const [iotDevices, setIotDevices] = useState<IoTEdgeMetrics[]>(generateIoTDevices(10));
  const [summary, setSummary] = useState<DashboardSummary>(() =>
    generateDashboardSummary([generatePCBMetrics()], generateIoTDevices(10))
  );
  const [history, setHistory] = useState<{
    temperature: MetricHistory[];
    voltage: MetricHistory[];
    current: MetricHistory[];
    throughput: MetricHistory[];
  }>({
    temperature: [],
    voltage: [],
    current: [],
    throughput: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateData = useCallback(() => {
    setIsLoading(true);
    
    // Simulate slight delay for realism
    setTimeout(() => {
      const newPcbMetrics = generatePCBMetrics();
      const newIotDevices = generateIoTDevices(10);
      const newSummary = generateDashboardSummary([newPcbMetrics], newIotDevices);

      setPcbMetrics(newPcbMetrics);
      setIotDevices(newIotDevices);
      setSummary(newSummary);

      // Update history
      setHistory((prev) => {
        const now = new Date();
        const newHistory = {
          temperature: [
            ...prev.temperature,
            { timestamp: now, value: newPcbMetrics.temperature },
          ].slice(-maxHistoryLength),
          voltage: [
            ...prev.voltage,
            { timestamp: now, value: newPcbMetrics.voltage },
          ].slice(-maxHistoryLength),
          current: [
            ...prev.current,
            { timestamp: now, value: newPcbMetrics.current },
          ].slice(-maxHistoryLength),
          throughput: [
            ...prev.throughput,
            {
              timestamp: now,
              value: newIotDevices.reduce((sum, d) => sum + d.dataThroughput, 0) / newIotDevices.length,
            },
          ].slice(-maxHistoryLength),
        };
        return newHistory;
      });

      setIsLoading(false);
    }, 100);
  }, [maxHistoryLength]);

  const refresh = useCallback(() => {
    updateData();
  }, [updateData]);

  useEffect(() => {
    // Initial data load
    updateData();

    // Set up interval for real-time updates
    const interval = setInterval(updateData, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, updateData]);

  return {
    pcbMetrics,
    iotDevices,
    summary,
    history,
    isLoading,
    refresh,
  };
};
