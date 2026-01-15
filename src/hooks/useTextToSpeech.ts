import { useRef, useState, useEffect } from 'react';

interface UseTextToSpeechOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { enabled = false, rate = 1, pitch = 1, volume = 1, voice } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text: string) => {
    if (!enabled || !isSupported || !synthesisRef.current) {
      return;
    }

    // Cancel any ongoing speech
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to select a voice
    if (voice) {
      const voices = synthesisRef.current.getVoices();
      const selectedVoice = voices.find((v) => v.name.includes(voice));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthesisRef.current && synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
