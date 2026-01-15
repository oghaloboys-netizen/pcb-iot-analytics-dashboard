import { createContext, useContext, ReactNode, useState } from 'react';
import { MetricsContext as MetricsContextType } from '@/lib/openai';

interface MetricsContextValue {
  metrics: MetricsContextType | undefined;
  setMetrics: (metrics: MetricsContextType | undefined) => void;
}

const MetricsContext = createContext<MetricsContextValue | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<MetricsContextType | undefined>(undefined);

  return (
    <MetricsContext.Provider value={{ metrics, setMetrics }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetricsContext() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetricsContext must be used within MetricsProvider');
  }
  return context;
}
