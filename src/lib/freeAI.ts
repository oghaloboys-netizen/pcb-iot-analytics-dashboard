// Free AI assistant using Hugging Face Inference API
// This uses free models - no payment required, just optional API token for better rate limits

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

// Build context from metrics
function buildMetricsContext(metricsContext?: any): string {
  if (!metricsContext) return '';
  
  let context = '\n\nCurrent System Metrics:\n';
  
  if (metricsContext.summary) {
    context += `- Total PCBs: ${metricsContext.summary.totalPCBs}\n`;
    context += `- Total IoT Devices: ${metricsContext.summary.totalIoTDevices}\n`;
    context += `- Online Devices: ${metricsContext.summary.onlineDevices}\n`;
    context += `- Average Temperature: ${metricsContext.summary.averageTemperature?.toFixed(1)}°C\n`;
    context += `- Average Throughput: ${metricsContext.summary.averageThroughput?.toFixed(2)} Mbps\n`;
    context += `- Critical Alerts: ${metricsContext.summary.criticalAlerts}\n`;
  }
  
  if (metricsContext.pcbMetrics) {
    context += `\nPCB Metrics:\n`;
    context += `- Temperature: ${metricsContext.pcbMetrics.temperature?.toFixed(1)}°C\n`;
    context += `- Voltage: ${metricsContext.pcbMetrics.voltage?.toFixed(2)}V\n`;
    context += `- Current: ${metricsContext.pcbMetrics.current?.toFixed(2)}A\n`;
    context += `- Signal Integrity: ${metricsContext.pcbMetrics.signalIntegrity?.toFixed(1)}%\n`;
  }
  
  if (metricsContext.iotDevices) {
    context += `\nIoT Devices:\n`;
    context += `- Total: ${metricsContext.iotDevices.total}\n`;
    context += `- Online: ${metricsContext.iotDevices.online}\n`;
    context += `- Avg Throughput: ${metricsContext.iotDevices.avgThroughput?.toFixed(2)} Mbps\n`;
    context += `- Avg Latency: ${metricsContext.iotDevices.avgLatency?.toFixed(0)} ms\n`;
  }
  
  return context;
}

// Get AI response using free Hugging Face Inference API
export async function getFreeAIResponse(
  userMessage: string,
  conversationHistory: ChatHistory[],
  metricsContext?: any
): Promise<string> {
  try {
    // Try using Hugging Face Inference API (free, no API key needed for basic usage)
    // Using a free conversational model
    const systemPrompt = `You are a helpful AI assistant specialized in analyzing PCB (Printed Circuit Board) and IoT Edge device metrics and analytics. You help users understand their system data, provide insights, and answer questions about their hardware and network metrics.${buildMetricsContext(metricsContext)}\n\nBe conversational, friendly, and knowledgeable. Remember previous parts of the conversation.`;
    
    // Build conversation context
    const conversationText = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nUser: ${userMessage}\nAssistant:`;
    
    // Use Hugging Face Inference API - completely free, no API key required for basic usage
    // Using microsoft/DialoGPT-medium or similar free model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 150,
            return_full_text: false,
          },
        }),
      }
    );
    
    if (!response.ok) {
      // If API fails (rate limit, etc.), fall back to intelligent rule-based responses
      throw new Error('API unavailable');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Extract response text
    let responseText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      responseText = data[0].generated_text.trim();
    } else if (typeof data === 'string') {
      responseText = data.trim();
    } else if (data[0]?.summary_text) {
      responseText = data[0].summary_text.trim();
    }
    
    // Clean up the response
    responseText = responseText
      .replace(/Assistant:/g, '')
      .replace(/User:/g, '')
      .trim();
    
    if (!responseText) {
      throw new Error('No response generated');
    }
    
    return responseText;
  } catch (error) {
    // Fallback to intelligent rule-based system that learns from conversation
    return getIntelligentResponse(userMessage, conversationHistory, metricsContext);
  }
}

// Intelligent fallback that maintains conversation context
function getIntelligentResponse(
  userMessage: string,
  conversationHistory: ChatHistory[],
  metricsContext?: any
): string {
  const message = userMessage.toLowerCase().trim();
  const lastFewMessages = conversationHistory.slice(-3).map(m => m.content.toLowerCase()).join(' ');
  
  // Analyze conversation context
  const hasDiscussedTemperature = lastFewMessages.includes('temp') || lastFewMessages.includes('temperature');
  
  // Context-aware responses
  if (message.includes('temperature') || message.includes('temp')) {
    const temp = metricsContext?.pcbMetrics?.temperature || metricsContext?.summary?.averageTemperature;
    if (temp) {
      if (hasDiscussedTemperature) {
        return `The temperature is still at ${temp.toFixed(1)}°C. ${temp > 75 ? 'It remains high - consider checking your cooling systems.' : temp > 60 ? 'It\'s within normal range but keep monitoring.' : 'Still in the optimal range - great!'}`;
      }
      return `The current PCB temperature is ${temp.toFixed(1)}°C. ${temp > 75 ? 'This is quite high - you might want to check your cooling systems.' : temp > 60 ? 'This is within normal operating range.' : 'This is in the optimal range - excellent!'}`;
    }
  }
  
  if (message.includes('voltage')) {
    const voltage = metricsContext?.pcbMetrics?.voltage;
    if (voltage) {
      return `The voltage is ${voltage.toFixed(2)}V. ${voltage < 3.0 || voltage > 5.5 ? '⚠️ This is outside the typical range - investigate power supply issues.' : 'This is within the normal operating range.'}`;
    }
  }
  
  if (message.includes('device') || message.includes('iot')) {
    const total = metricsContext?.iotDevices?.total || metricsContext?.summary?.totalIoTDevices;
    const online = metricsContext?.iotDevices?.online || metricsContext?.summary?.onlineDevices;
    if (total && online !== undefined) {
      return `You have ${total} IoT devices total, with ${online} online. ${online === total ? 'All devices are connected! ✅' : `${total - online} device(s) need attention.`}`;
    }
  }
  
  // Personal responses that reference conversation
  if (message.includes('you') && message.includes('know')) {
    if (conversationHistory.length > 2) {
      return 'Yes, I\'m learning about your system! I can see your metrics and remember our conversation. What would you like to know?';
    }
    return 'I\'m getting to know your system through our conversation and the metrics I can see. Feel free to ask me anything about your PCB and IoT devices!';
  }
  
  if (message.includes('remember') || message.includes('recall')) {
    return `I remember our conversation! We've discussed ${conversationHistory.filter(m => m.role === 'user').length} topics so far. I can help you understand your metrics and system status.`;
  }
  
  // Friendly conversational responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return conversationHistory.length > 2 
      ? 'Hello again! What would you like to know about your system today?'
      : 'Hello! I\'m here to help you understand your PCB and IoT Edge metrics. Ask me anything!';
  }
  
  if (message.includes('how are you')) {
    return 'I\'m doing well, thank you! I\'m here to help analyze your system metrics. How can I assist you today?';
  }
  
  if (message.includes('thanks') || message.includes('thank you')) {
    return 'You\'re welcome! Feel free to ask if you need help understanding any of your metrics.';
  }
  
  // Default intelligent response
  return `I understand you're asking about "${userMessage}". ${conversationHistory.length > 2 ? 'Based on our conversation, ' : ''}I can help you understand your PCB and IoT metrics. Could you be more specific? For example, you could ask about temperature, voltage, device status, or throughput.`;
}
