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
  const voices = window.speechSynthesis.getVoices();
  const base = langCode.split('-')[0].toLowerCase();
  return (
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

function speakNow(text: string, language: string, onEnd: () => void) {
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

/** Manual speak/stop control, bound to the currently selected language. */
export function useSpeak() {
  const language = useStore((s) => s.language);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!text) return;
      setIsSpeaking(true);
      speakNow(text, language, () => setIsSpeaking(false));
    },
    [language]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}

/**
 * Auto-speaks `text` whenever it changes, once it's actually ready to be
 * heard: either the patient chose English (nothing to wait for), or the
 * live translation of `sourceText` has resolved. Speaking the raw English
 * fallback while a translation is still in flight would narrate the prompt
 * twice — once in English, once in the target language — so that case is
 * skipped and the effect re-fires on its own once the real text lands.
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
