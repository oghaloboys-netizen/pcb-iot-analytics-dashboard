import OpenAI from 'openai';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Please set VITE_OPENAI_API_KEY in your .env file');
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Only for development - in production use a backend
  });
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MetricsContext {
  pcbMetrics?: {
    temperature: number;
    voltage: number;
    current: number;
    signalIntegrity: number;
    componentHealthCount: number;
  };
  iotDevices?: {
    total: number;
    online: number;
    avgThroughput: number;
    avgLatency: number;
  };
  summary?: {
    totalPCBs: number;
    totalIoTDevices: number;
    onlineDevices: number;
    averageTemperature: number;
    averageThroughput: number;
    criticalAlerts: number;
  };
}

export const sendChatMessage = async (
  messages: ChatMessage[],
  metricsContext?: MetricsContext
): Promise<string> => {
  try {
    const client = getOpenAIClient();
    
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant helping analyze PCB (Printed Circuit Board) and IoT Edge device metrics and analytics data.

Current metrics context:
${metricsContext?.summary ? `
- Total PCBs: ${metricsContext.summary.totalPCBs}
- Total IoT Devices: ${metricsContext.summary.totalIoTDevices}
- Online Devices: ${metricsContext.summary.onlineDevices}
- Average Temperature: ${metricsContext.summary.averageTemperature.toFixed(1)}°C
- Average Throughput: ${metricsContext.summary.averageThroughput.toFixed(2)} Mbps
- Critical Alerts: ${metricsContext.summary.criticalAlerts}
` : ''}
${metricsContext?.pcbMetrics ? `
PCB Metrics:
- Temperature: ${metricsContext.pcbMetrics.temperature.toFixed(1)}°C
- Voltage: ${metricsContext.pcbMetrics.voltage.toFixed(2)}V
- Current: ${metricsContext.pcbMetrics.current.toFixed(2)}A
- Signal Integrity: ${metricsContext.pcbMetrics.signalIntegrity.toFixed(1)}%
` : ''}
${metricsContext?.iotDevices ? `
IoT Devices:
- Total: ${metricsContext.iotDevices.total}
- Online: ${metricsContext.iotDevices.online}
- Average Throughput: ${metricsContext.iotDevices.avgThroughput.toFixed(2)} Mbps
- Average Latency: ${metricsContext.iotDevices.avgLatency.toFixed(0)} ms
` : ''}

Provide helpful, technical explanations about what these readings mean, potential issues to watch for, and recommendations. Be concise and clear.`,
    };

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file');
      }
      throw error;
    }
    throw new Error('Failed to get response from AI');
  }
};
