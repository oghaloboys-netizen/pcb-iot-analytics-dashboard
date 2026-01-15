// ESP32 Expert AI Assistant - Comprehensive knowledge about ESP32 development and communication

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

// ESP32 Knowledge Base
const ESP32_KNOWLEDGE = {
  basics: {
    description: "ESP32 is a series of low-cost, low-power microcontrollers with integrated Wi-Fi and Bluetooth. It's based on the Tensilica Xtensa LX6 microprocessor.",
    specs: "Dual-core 32-bit processor, Wi-Fi 802.11 b/g/n, Bluetooth 4.2/5.0, multiple GPIO pins, ADC, DAC, SPI, I2C, I2S, UART, PWM, and more.",
    variants: "ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, each with different features and capabilities.",
  },
  communication: {
    wifi: "Wi-Fi connectivity for web servers, HTTP/HTTPS clients, WebSocket, OTA updates. Supports both station (STA) and access point (AP) modes.",
    bluetooth: "Bluetooth Classic and BLE support. Can function as central, peripheral, or both simultaneously.",
    serial: "Multiple UART interfaces for serial communication. Default Serial (UART0) for programming/debugging.",
    i2c: "I2C communication for sensors and devices. Uses SDA and SCL pins, supports multiple slaves on same bus.",
    spi: "SPI communication for high-speed data transfer. Supports multiple SPI devices with different CS pins.",
    mqtt: "MQTT protocol for IoT communication. Lightweight publish/subscribe messaging protocol ideal for IoT applications.",
    websocket: "WebSocket support for real-time bidirectional communication with web applications.",
    http: "HTTP/HTTPS client and server capabilities for REST APIs and web interfaces.",
  },
  programming: {
    languages: "Arduino IDE (C/C++), ESP-IDF (C/C++), MicroPython, Lua, JavaScript (ESPruino), CircuitPython.",
    arduino: "Most popular platform. Large library ecosystem, easy to use, great for beginners and prototyping.",
    esp_idf: "Official Espressif IoT Development Framework. More control, better performance, official APIs.",
    micropython: "Python implementation for microcontrollers. Interactive REPL, easier syntax, good for rapid development.",
  },
  pins: {
    gpio: "Up to 34 GPIO pins (varies by variant). Many are multifunctional (ADC, DAC, PWM, etc.). Some pins are input-only.",
    adc: "12-bit ADC with up to 18 channels. Can measure voltages from 0V to 3.3V (ESP32) or 0V to VDD (ESP32-S2/S3).",
    dac: "8-bit DAC on 2 channels (ESP32) or 1 channel (ESP32-S2). Can generate analog signals.",
    pwm: "16 PWM channels for LED control, motor control, etc. Can generate PWM signals on multiple pins.",
  },
  power: {
    voltage: "Operating voltage: 2.2V to 3.6V (3.3V typical). Must use 3.3V logic levels, not 5V tolerant.",
    consumption: "Active: ~80-240mA. Deep sleep: ~10-150µA depending on configuration. Very power efficient for battery applications.",
    management: "Multiple sleep modes: light sleep, deep sleep, hibernation. Can wake from timer, GPIO, or sensor interrupt.",
  },
  commonIssues: {
    reset: "Common resets: brownout detector, watchdog timer, stack overflow, power issues, code errors.",
    wifi: "Wi-Fi issues: weak signal, wrong credentials, interference, router compatibility, power supply noise.",
    memory: "Memory issues: stack overflow, heap fragmentation, insufficient RAM for large operations.",
    upload: "Upload issues: wrong COM port, driver issues, boot mode not entered, wrong board selected.",
  },
};

// Get AI response with ESP32 expertise
export async function getESP32AIResponse(
  userMessage: string,
  conversationHistory: ChatHistory[],
  metricsContext?: any
): Promise<string> {
  const message = userMessage.toLowerCase().trim();
  const conversationText = conversationHistory.slice(-5).map(m => m.content.toLowerCase()).join(' ');
  
  // ESP32-specific queries
  if (message.includes('esp32') || message.includes('esp 32')) {
    if (message.includes('what is') || message.includes('explain') || message.includes('tell me about')) {
      return `The ESP32 is a powerful, low-cost microcontroller with built-in Wi-Fi and Bluetooth capabilities. ${ESP32_KNOWLEDGE.basics.description}\n\nKey Features:\n• ${ESP32_KNOWLEDGE.basics.specs}\n• Multiple variants: ${ESP32_KNOWLEDGE.basics.variants}\n\nIt's perfect for IoT projects, sensor networks, home automation, and edge computing applications. What specific aspect of ESP32 would you like to know more about?`;
    }
    
    if (message.includes('communication') || message.includes('connect') || message.includes('protocol')) {
      return `ESP32 supports multiple communication methods:\n\n📡 **Wi-Fi**: ${ESP32_KNOWLEDGE.communication.wifi}\n\n📶 **Bluetooth**: ${ESP32_KNOWLEDGE.communication.bluetooth}\n\n📟 **Serial/UART**: ${ESP32_KNOWLEDGE.communication.serial}\n\n🔌 **I2C**: ${ESP32_KNOWLEDGE.communication.i2c}\n\n⚡ **SPI**: ${ESP32_KNOWLEDGE.communication.spi}\n\n📨 **MQTT**: ${ESP32_KNOWLEDGE.communication.mqtt}\n\n🌐 **WebSocket**: ${ESP32_KNOWLEDGE.communication.websocket}\n\n🌍 **HTTP/HTTPS**: ${ESP32_KNOWLEDGE.communication.http}\n\nWhich communication method are you interested in?`;
    }
    
    if (message.includes('program') || message.includes('code') || message.includes('develop') || message.includes('arduino') || message.includes('esp-idf')) {
      return `ESP32 can be programmed using several methods:\n\n📝 **Arduino IDE**: ${ESP32_KNOWLEDGE.programming.arduino}\n\n⚙️ **ESP-IDF**: ${ESP32_KNOWLEDGE.programming.esp_idf}\n\n🐍 **MicroPython**: ${ESP32_KNOWLEDGE.programming.micropython}\n\nOther options: Lua, JavaScript (ESPruino), CircuitPython\n\nArduino IDE is the most beginner-friendly, while ESP-IDF offers more control and better performance. Which platform are you using?`;
    }
    
    if (message.includes('pin') || message.includes('gpio') || message.includes('pinout')) {
      return `ESP32 Pin Configuration:\n\n📌 **GPIO**: ${ESP32_KNOWLEDGE.pins.gpio}\n\n📊 **ADC (Analog-to-Digital)**: ${ESP32_KNOWLEDGE.pins.adc}\n\n📈 **DAC (Digital-to-Analog)**: ${ESP32_KNOWLEDGE.pins.dac}\n\n⚡ **PWM**: ${ESP32_KNOWLEDGE.pins.pwm}\n\n⚠️ Important: ESP32 uses 3.3V logic levels (not 5V tolerant). Always check the pinout for your specific ESP32 board variant, as pin functions vary. What are you trying to connect?`;
    }
    
    if (message.includes('power') || message.includes('voltage') || message.includes('current') || message.includes('battery') || message.includes('sleep')) {
      return `ESP32 Power Management:\n\n⚡ **Operating Voltage**: ${ESP32_KNOWLEDGE.power.voltage}\n\n🔋 **Power Consumption**: ${ESP32_KNOWLEDGE.power.consumption}\n\n😴 **Sleep Modes**: ${ESP32_KNOWLEDGE.power.management}\n\nFor battery-powered projects, use deep sleep mode between readings to extend battery life significantly. What's your power requirement?`;
    }
    
    if (message.includes('wifi') || message.includes('wi-fi') || message.includes('wireless')) {
      return `ESP32 Wi-Fi Capabilities:\n\n${ESP32_KNOWLEDGE.communication.wifi}\n\n**Common Wi-Fi Tasks:**\n• Connect to existing network (STA mode)\n• Create access point (AP mode)\n• Web server hosting\n• HTTP/HTTPS client requests\n• WebSocket connections\n• OTA (Over-The-Air) updates\n\n**Common Issues:**\n${ESP32_KNOWLEDGE.commonIssues.wifi}\n\nWhat are you trying to do with Wi-Fi?`;
    }
    
    if (message.includes('bluetooth') || message.includes('ble')) {
      return `ESP32 Bluetooth Support:\n\n${ESP32_KNOWLEDGE.communication.bluetooth}\n\n**Bluetooth Features:**\n• Bluetooth Classic (SPP, A2DP)\n• Bluetooth Low Energy (BLE)\n• Can operate as central or peripheral\n• BLE advertising and scanning\n• GATT server/client\n\nPerfect for wireless sensor data, remote control, and IoT applications. What's your Bluetooth use case?`;
    }
    
    if (message.includes('mqtt') || message.includes('publish') || message.includes('subscribe')) {
      return `ESP32 MQTT Communication:\n\n${ESP32_KNOWLEDGE.communication.mqtt}\n\n**MQTT Setup Steps:**\n1. Install PubSubClient library (Arduino) or use ESP-IDF MQTT component\n2. Connect to Wi-Fi\n3. Connect to MQTT broker (local or cloud)\n4. Subscribe to topics for receiving data\n5. Publish sensor data to topics\n\n**Popular MQTT Brokers:**\n• Mosquitto (local)\n• HiveMQ Cloud (free tier)\n• AWS IoT Core\n• Adafruit IO\n\nMQTT is ideal for IoT sensor networks and remote monitoring. Need help setting it up?`;
    }
    
    if (message.includes('problem') || message.includes('issue') || message.includes('error') || message.includes('reset') || message.includes('crash')) {
      return `Common ESP32 Issues and Solutions:\n\n🔄 **Resets/Crashes**: ${ESP32_KNOWLEDGE.commonIssues.reset}\n\n📡 **Wi-Fi Problems**: ${ESP32_KNOWLEDGE.commonIssues.wifi}\n\n💾 **Memory Issues**: ${ESP32_KNOWLEDGE.commonIssues.memory}\n\n⬆️ **Upload Problems**: ${ESP32_KNOWLEDGE.commonIssues.upload}\n\n**General Troubleshooting:**\n• Check power supply (should be stable 3.3V, at least 500mA)\n• Verify connections and wiring\n• Enable verbose output in Arduino IDE\n• Use Serial monitor for debugging\n• Check for code errors (watchdog, stack overflow)\n\nWhat specific problem are you experiencing?`;
    }
    
    if (message.includes('sensor') || message.includes('read') || message.includes('data')) {
      return `ESP32 can interface with many sensors:\n\n**Communication Protocols:**\n• I2C: Temperature (DS18B20, TMP102), accelerometers, gyroscopes\n• SPI: SD cards, displays, high-speed sensors\n• Analog: ADC pins for analog sensors (0-3.3V)\n• OneWire: Temperature sensors (DS18B20)\n• Serial: GPS modules, LoRa modules\n\n**Common Sensors:**\n• DHT11/DHT22 (Temperature/Humidity)\n• BMP280/BME280 (Pressure/Temperature/Humidity)\n• MPU6050 (Accelerometer/Gyroscope)\n• Ultrasonic sensors (HC-SR04)\n• PIR motion sensors\n\nWhich sensor are you working with?`;
    }
    
    if (message.includes('ota') || message.includes('over the air') || message.includes('update')) {
      return `ESP32 OTA (Over-The-Air) Updates:\n\nOTA allows you to update ESP32 firmware wirelessly without physical connection.\n\n**OTA Methods:**\n• ArduinoOTA (Arduino IDE) - Simple HTTP-based OTA\n• ESP-IDF OTA - More advanced, supports HTTPS\n• Web-based OTA - Upload firmware through web interface\n\n**Benefits:**\n• No physical access needed\n• Deploy updates remotely\n• Great for deployed IoT devices\n\n**Requirements:**\n• Wi-Fi connection\n• Sufficient flash memory (partition table with OTA support)\n• Web server or update server\n\nWant help setting up OTA?`;
    }
  }
  
  // Communication protocol specific queries
  if (message.includes('i2c') || message.includes('i²c')) {
    return `I2C Communication with ESP32:\n\n${ESP32_KNOWLEDGE.communication.i2c}\n\n**I2C Basics:**\n• Two wires: SDA (data) and SCL (clock)\n• Multiple devices on same bus (each has unique address)\n• Master/slave architecture\n• Standard speed: 100kHz (slow), 400kHz (fast), 1MHz (fast mode plus)\n\n**ESP32 I2C Pins:**\n• Default: GPIO 21 (SDA), GPIO 22 (SCL)\n• Can use other pins (Wire.begin(SDA, SCL))\n\n**Common I2C Devices:**\n• OLED displays\n• Sensors (BMP280, MPU6050)\n• Real-time clocks (DS1307)\n• EEPROMs\n\nNeed help with I2C wiring or code?`;
  }
  
  if (message.includes('spi')) {
    return `SPI Communication with ESP32:\n\n${ESP32_KNOWLEDGE.communication.spi}\n\n**SPI Basics:**\n• 4+ wires: MOSI, MISO, SCK, CS (chip select per device)\n• Full-duplex communication\n• Faster than I2C\n• Multiple devices with different CS pins\n\n**ESP32 SPI Pins:**\n• VSPI (default): GPIO 23 (MOSI), 19 (MISO), 18 (SCK), 5 (CS)\n• HSPI: GPIO 13 (MOSI), 12 (MISO), 14 (SCK), 15 (CS)\n\n**Common SPI Devices:**\n• SD cards\n• TFT displays\n• LoRa modules\n• Flash memory\n\nWhat SPI device are you connecting?`;
  }
  
  if (message.includes('serial') || message.includes('uart')) {
    return `Serial/UART Communication with ESP32:\n\n${ESP32_KNOWLEDGE.communication.serial}\n\n**ESP32 UART:**\n• 3 UART interfaces: UART0, UART1, UART2\n• UART0: Used for programming/debugging (GPIO 1/3)\n• UART1: Usually reserved (GPIO 9/10)\n• UART2: Available for user (configurable pins)\n\n**Common Uses:**\n• Debugging (Serial.print)\n• GPS modules\n• LoRa modules\n• Communication with other microcontrollers\n• Bluetooth modules (HC-05)\n\n**Serial Monitor Settings:**\n• Baud rate: 115200 (common) or 9600\n• Use Serial.begin(115200) in setup()\n\nNeed help with serial communication?`;
  }
  
  // Combine ESP32 knowledge with system metrics
  const metricsInfo = buildMetricsContext(metricsContext);
  const hasMetrics = metricsContext && (metricsContext.summary || metricsContext.pcbMetrics || metricsContext.iotDevices);
  
  // General conversation that references ESP32 context
  if (message.includes('help') || message.includes('what can you')) {
    return `I'm an ESP32 expert assistant! I can help you with:\n\n🔧 **ESP32 Development**\n• Hardware specifications and pinouts\n• Programming (Arduino, ESP-IDF, MicroPython)\n• Communication protocols (Wi-Fi, Bluetooth, I2C, SPI, MQTT, Serial)\n• Power management and sleep modes\n• Sensor interfacing\n• OTA updates\n• Troubleshooting common issues\n\n📊 **System Analysis**\n${hasMetrics ? '• Your current PCB and IoT metrics\n' : ''}• Performance optimization\n• Best practices\n\nAsk me anything about ESP32 development or your system! Try: "How do I connect to WiFi?" or "Explain MQTT communication"`;
  }
  
  // Fallback to intelligent response with ESP32 context
  return getIntelligentESP32Response(userMessage, conversationHistory, metricsContext);
}

// Intelligent response with ESP32 context awareness
function getIntelligentESP32Response(
  userMessage: string,
  conversationHistory: ChatHistory[],
  metricsContext?: any
): string {
  const message = userMessage.toLowerCase().trim();
  const conversationText = conversationHistory.slice(-3).map(m => m.content.toLowerCase()).join(' ');
  
  // Reference conversation history
  if (message.includes('remember') || message.includes('recall') || (message.includes('we') && message.includes('discuss'))) {
    const userMessages = conversationHistory.filter(m => m.role === 'user').length;
    return `Yes! I remember our conversation. We've discussed ${userMessages} topics about ESP32 and your system. ${conversationText.includes('wifi') ? 'You were asking about Wi-Fi.' : ''}${conversationText.includes('sensor') ? 'We talked about sensors.' : ''} What else would you like to know?`;
  }
  
  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return conversationHistory.length > 2 
      ? 'Hello again! Ready to continue working with ESP32? What can I help you with today?'
      : 'Hello! I\'m your ESP32 expert assistant. I can help you with ESP32 development, communication protocols, programming, and your system metrics. Ask me anything!';
  }
  
  // Thanks
  if (message.includes('thanks') || message.includes('thank you')) {
    return 'You\'re welcome! Feel free to ask if you need more help with ESP32 development or your system.';
  }
  
  // Default with ESP32 context
  return `I understand you're asking about "${userMessage}". As your ESP32 expert, I can help with:\n\n• ESP32 hardware and specifications\n• Communication (Wi-Fi, Bluetooth, I2C, SPI, MQTT, Serial)\n• Programming and development\n• Sensor interfacing\n• Power management\n• Troubleshooting\n${metricsContext ? '• Your system metrics and performance\n' : ''}\n\nCould you be more specific? For example: "How do I connect ESP32 to WiFi?" or "Explain I2C communication"`;
}
