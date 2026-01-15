import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { getESP32AIResponse } from '@/lib/esp32AI';
import { MetricsContext } from '@/lib/openai';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  metricsContext?: MetricsContext;
  className?: string;
}

const STORAGE_KEY = 'pcb-chat-history';
const VOICE_ENABLED_KEY = 'pcb-chat-voice-enabled';

export function ChatWindow({ metricsContext, className }: ChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load conversation history from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // If parsing fails, use default
    }
    return [
      {
        role: 'assistant',
        content: 'Hello! I\'m your ESP32 expert assistant. I can help you with ESP32 development, communication protocols (Wi-Fi, Bluetooth, I2C, SPI, MQTT), programming, and your system metrics. Ask me anything!',
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(VOICE_ENABLED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Save voice preference
  useEffect(() => {
    try {
      localStorage.setItem(VOICE_ENABLED_KEY, voiceEnabled.toString());
    } catch (e) {
      // Ignore storage errors
    }
  }, [voiceEnabled]);

  // Function to speak text
  const speakText = (text: string) => {
    if (!voiceEnabled || !synthesisRef.current) return;

    // Stop any ongoing speech
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }

    // Clean text (remove markdown formatting, special characters)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/[•\-\n]+/g, ' ') // Replace bullet points and newlines
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural-sounding voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoices = ['Google', 'Microsoft', 'Samantha', 'Alex', 'Karen'];
    const selectedVoice = voices.find((v) =>
      preferredVoices.some((pref) => v.name.includes(pref))
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  // Speak assistant messages when they're added
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && voiceEnabled) {
        // Small delay to ensure message is rendered
        setTimeout(() => {
          speakText(lastMessage.content);
        }, 300);
      }
    }
  }, [messages, isLoading, voiceEnabled]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // If storage fails, continue anyway
    }
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current && isOpen) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getESP32AIResponse(input, messages, metricsContext);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn('fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg', className)}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn('fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-lg z-50', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>AI Analytics Assistant</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (voiceEnabled && synthesisRef.current?.speaking) {
                synthesisRef.current.cancel();
              }
            }}
            className="h-6 w-6"
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (synthesisRef.current?.speaking) {
                synthesisRef.current.cancel();
              }
              setIsOpen(false);
            }}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4"
        >
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your metrics..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
