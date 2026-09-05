import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore, onNavigate } from './useStore';

const LANG_CODES: Record<string, string> = {
  Hindi: 'hi-IN',
  Nepali: 'ne-NP',
  Bengali: 'bn-IN',
  English: 'en-US',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
};

function pickVoice(langCode: string): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const base = langCode.split('-')[0].toLowerCase();
  return (
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

function speakBrowserFallback(text: string, language: string, onEnd: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();

  const langCode = LANG_CODES[language] || 'en-US';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  const voice = pickVoice(langCode);
  if (voice) utterance.voice = voice;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  window.speechSynthesis.speak(utterance);
}

// Global speech tracking state & in-flight async call ID counter
let currentCallId = 0;
let activeAudio: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;

function cleanupAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (activeBlobUrl) {
    URL.revokeObjectURL(activeBlobUrl);
    activeBlobUrl = null;
  }
}

/** Immediately halts any playing or in-flight voice narration across the application. */
export function stopAllSpeech() {
  currentCallId++; // Invalidate all pending async TTS fetch responses
  cleanupAudio();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Automatically subscribe stopAllSpeech to cut off voice when navigation occurs
onNavigate(() => {
  stopAllSpeech();
});

/** Manual speak/stop control with ElevenLabs TTS + Web Speech Fallback. */
export function useSpeak() {
  const language = useStore((s) => s.language);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stop = useCallback(() => {
    stopAllSpeech();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, onEnd?: () => void, overrideLanguage?: string) => {
      if (!text) {
        if (onEnd) onEnd();
        return;
      }
      stopAllSpeech();
      const thisCallId = ++currentCallId;
      setIsSpeaking(true);

      const targetLanguage = overrideLanguage || language;

      const handleFinished = () => {
        if (thisCallId !== currentCallId) return;
        setIsSpeaking(false);
        cleanupAudio();
        if (onEnd) onEnd();
      };

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: targetLanguage })
        });

        // Abort if a newer request or screen navigation occurred while waiting
        if (thisCallId !== currentCallId) return;

        const contentType = res.headers.get('content-type') || '';

        if (res.ok && contentType.includes('audio/mpeg')) {
          const blob = await res.blob();
          if (thisCallId !== currentCallId) return;

          const audioUrl = URL.createObjectURL(blob);
          activeBlobUrl = audioUrl;

          const audio = new Audio(audioUrl);
          activeAudio = audio;

          audio.onended = () => {
            handleFinished();
          };

          audio.onerror = () => {
            if (thisCallId !== currentCallId) return;
            speakBrowserFallback(text, targetLanguage, handleFinished);
          };

          await audio.play();
          return;
        }

        if (thisCallId === currentCallId) {
          speakBrowserFallback(text, targetLanguage, handleFinished);
        }
      } catch (err) {
        if (thisCallId === currentCallId) {
          console.warn("ElevenLabs TTS failed, using fallback:", err);
          speakBrowserFallback(text, targetLanguage, handleFinished);
        }
      }
    },
    [language]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { speak, stop, isSpeaking };
}

/**
 * Auto-speaks `text` whenever it changes, once it's actually ready to be heard.
 * Accepts an optional `onEnd` callback that fires when audio finishes playing.
 */
export function useAutoSpeak(text: string, sourceText: string, onEnd?: () => void) {
  const language = useStore((s) => s.language);
  const currentScreen = useStore((s) => s.currentScreen);
  const { speak } = useSpeak();
  const lastSpoken = useRef<string>('');

  // Cut off audio whenever screen changes or component unmounts
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [currentScreen]);

  useEffect(() => {
    const ready = language === 'English' || text !== sourceText;
    if (!ready || !text || lastSpoken.current === text) return;
    lastSpoken.current = text;
    speak(text, onEnd);
  }, [text, sourceText, language, speak, onEnd]);
}
