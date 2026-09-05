import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';

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
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
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

// Memory tracking references for HTML5 Audio & Blob URL cleanup
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

/** Manual speak/stop control with ElevenLabs TTS + Web Speech Fallback. */
export function useSpeak() {
  const language = useStore((s) => s.language);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stop = useCallback(() => {
    cleanupAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;
      stop();
      setIsSpeaking(true);

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language })
        });

        const contentType = res.headers.get('content-type') || '';

        if (res.ok && contentType.includes('audio/mpeg')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          activeBlobUrl = audioUrl;

          const audio = new Audio(audioUrl);
          activeAudio = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            cleanupAudio();
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            cleanupAudio();
            speakBrowserFallback(text, language, () => setIsSpeaking(false));
          };

          await audio.play();
          return;
        }

        speakBrowserFallback(text, language, () => setIsSpeaking(false));
      } catch (err) {
        console.warn("ElevenLabs TTS failed, using fallback:", err);
        cleanupAudio();
        speakBrowserFallback(text, language, () => setIsSpeaking(false));
      }
    },
    [language, stop]
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
 */
export function useAutoSpeak(text: string, sourceText: string) {
  const language = useStore((s) => s.language);
  const { speak } = useSpeak();
  const lastSpoken = useRef<string>('');

  useEffect(() => {
    const ready = language === 'English' || text !== sourceText;
    if (!ready || !text || lastSpoken.current === text) return;
    lastSpoken.current = text;
    speak(text);
  }, [text, sourceText, language, speak]);
}
