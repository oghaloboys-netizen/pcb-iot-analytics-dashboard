import { MetricsContext } from './openai';

// Simple AI assistant that analyzes metrics without requiring API keys
export const getAIResponse = async (
  userMessage: string,
  metricsContext?: MetricsContext
): Promise<string> => {
  const message = userMessage.toLowerCase().trim();
  
  // Analyze metrics and provide contextual responses
  if (message.includes('temperature') || message.includes('temp')) {
    const temp = metricsContext?.pcbMetrics?.temperature || metricsContext?.summary?.averageTemperature;
    if (temp) {
      if (temp > 75) {
        return `The current PCB temperature is ${temp.toFixed(1)}°C, which is quite high. This could indicate:\n\n• High CPU/component load\n• Insufficient cooling\n• Potential thermal throttling\n\nRecommendation: Check cooling systems and consider reducing workload if temperatures continue to rise above 80°C.`;
      } else if (temp > 60) {
        return `The PCB temperature is ${temp.toFixed(1)}°C, which is within normal operating range but on the warmer side. This is typically acceptable, but monitor for any upward trends.`;
      } else {
        return `The PCB temperature is ${temp.toFixed(1)}°C, which is in the optimal range. Your system appears to be running cool and efficiently.`;
      }
    }
    return 'Temperature data is currently not available. Please check your PCB metrics.';
  }

  if (message.includes('voltage') || message.includes('volt')) {
    const voltage = metricsContext?.pcbMetrics?.voltage;
    if (voltage) {
      if (voltage < 3.0 || voltage > 5.5) {
        return `⚠️ Warning: Voltage is ${voltage.toFixed(2)}V, which is outside the typical 3.0V-5.0V range. This could indicate:\n\n• Power supply issues\n• Voltage regulator problems\n• Potential component damage risk\n\nRecommendation: Investigate power supply and regulator immediately.`;
      } else {
        return `The voltage is ${voltage.toFixed(2)}V, which is within the normal operating range. This indicates stable power delivery.`;
      }
    }
    return 'Voltage data is currently not available.';
  }

  if (message.includes('current') || message.includes('amperage')) {
    const current = metricsContext?.pcbMetrics?.current;
    if (current) {
      return `The current draw is ${current.toFixed(2)}A. ${current > 2.0 ? 'This is relatively high and may indicate high component activity.' : 'This is within normal range.'} Current consumption varies based on workload and component activity.`;
    }
    return 'Current data is currently not available.';
  }

  if (message.includes('signal integrity') || message.includes('signal')) {
    const integrity = metricsContext?.pcbMetrics?.signalIntegrity;
    if (integrity) {
      if (integrity < 90) {
        return `Signal integrity is ${integrity.toFixed(1)}%, which is below optimal. This could indicate:\n\n• Signal degradation\n• Interference issues\n• Connection problems\n\nRecommendation: Check connections and EMI sources.`;
      } else {
        return `Signal integrity is ${integrity.toFixed(1)}%, which is excellent. Your signals are clean and transmission quality is high.`;
      }
    }
    return 'Signal integrity data is currently not available.';
  }

  if (message.includes('iot') || message.includes('device')) {
    const total = metricsContext?.iotDevices?.total || metricsContext?.summary?.totalIoTDevices;
    const online = metricsContext?.iotDevices?.online || metricsContext?.summary?.onlineDevices;
    if (total && online !== undefined) {
      const offline = total - online;
      return `You have ${total} IoT devices total, with ${online} online and ${offline} offline/warning.\n\n${online === total ? '✅ All devices are online - excellent connectivity!' : offline > 0 ? `⚠️ ${offline} device(s) need attention. Check network connectivity and device status.` : ''}`;
    }
    return 'IoT device data is currently not available.';
  }

  if (message.includes('throughput') || message.includes('bandwidth')) {
    const throughput = metricsContext?.iotDevices?.avgThroughput || metricsContext?.summary?.averageThroughput;
    if (throughput) {
      return `Average data throughput is ${throughput.toFixed(2)} Mbps. ${throughput > 500 ? 'This indicates high data transfer activity - your network is handling significant traffic well.' : throughput > 100 ? 'This is moderate throughput - typical for IoT deployments.' : 'Throughput is on the lower side, which is normal for sensor networks with periodic updates.'}`;
    }
    return 'Throughput data is currently not available.';
  }

  if (message.includes('latency') || message.includes('delay')) {
    const latency = metricsContext?.iotDevices?.avgLatency;
    if (latency) {
      if (latency > 100) {
        return `⚠️ Average latency is ${latency.toFixed(0)}ms, which is high. This could indicate:\n\n• Network congestion\n• Distance to gateway\n• Poor signal quality\n\nRecommendation: Check network conditions and device placement.`;
      } else {
        return `Average latency is ${latency.toFixed(0)}ms, which is good. Your network is responding quickly.`;
      }
    }
    return 'Latency data is currently not available.';
  }

  if (message.includes('alert') || message.includes('critical') || message.includes('warning')) {
    const alerts = metricsContext?.summary?.criticalAlerts;
    if (alerts !== undefined) {
      if (alerts > 0) {
        return `⚠️ You have ${alerts} critical alert(s) that require attention. Check the dashboard for details on:\n\n• Component health status\n• Device connectivity issues\n• Out-of-range metrics\n\nRecommendation: Review each alert and take appropriate action.`;
      } else {
        return '✅ No critical alerts! All systems are operating normally.';
      }
    }
    return 'Alert data is currently not available.';
  }

  if (message.includes('status') || message.includes('overview') || message.includes('summary')) {
    const summary = metricsContext?.summary;
    if (summary) {
      return `**System Overview:**\n\n• Total PCBs: ${summary.totalPCBs}\n• Total IoT Devices: ${summary.totalIoTDevices}\n• Online Devices: ${summary.onlineDevices}/${summary.totalIoTDevices}\n• Avg Temperature: ${summary.averageTemperature.toFixed(1)}°C\n• Avg Throughput: ${summary.averageThroughput.toFixed(2)} Mbps\n• Critical Alerts: ${summary.criticalAlerts}\n\n${summary.criticalAlerts === 0 ? 'All systems operational!' : '⚠️ Some issues require attention.'}`;
    }
    return 'Summary data is currently not available.';
  }

  if (message.includes('help') || message.includes('what can you')) {
    return `I can help you understand your PCB and IoT Edge metrics! Ask me about:\n\n• Temperature readings\n• Voltage and current\n• Signal integrity\n• IoT device status\n• Network throughput and latency\n• Critical alerts\n• System overview\n\nTry asking: "What does the temperature reading mean?" or "How is my IoT device status?"`;
  }

  // Default response
  return `I understand you're asking about: "${userMessage}". Could you be more specific? I can help explain:\n\n• Temperature, voltage, current readings\n• IoT device status and network metrics\n• Signal integrity\n• Alerts and warnings\n\nTry asking specific questions like "What does the temperature mean?" or "How many devices are online?"`;
};
