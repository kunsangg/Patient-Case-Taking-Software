import { create } from 'zustand';
import { useCallback } from 'react';
import { useStore } from './useStore';

interface TranslationCacheState {
  cache: Record<string, Record<string, string>>;
  commit: (lang: string, pairs: [string, string][]) => void;
}

const useTranslationCache = create<TranslationCacheState>((set) => ({
  cache: {},
  commit: (lang, pairs) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [lang]: {
          ...state.cache[lang],
          ...Object.fromEntries(pairs),
        },
      },
    })),
}));

// Module-level batching: every t() call for a not-yet-cached string enqueues
// it here; a short debounce coalesces everything a screen requests on mount
// into a handful of /api/translate calls instead of one request per string.
const CHUNK_SIZE = 8; // keeps each LLM call small enough to reliably return valid JSON
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

const pendingByLang = new Map<string, Set<string>>();
const inFlightByLang = new Map<string, Set<string>>();
const timerByLang = new Map<string, ReturnType<typeof setTimeout>>();

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sendBatch(lang: string, texts: string[], attempt: number) {
  const inFlight = inFlightByLang.get(lang)!;

  fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, targetLanguage: lang }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null);
      const translations: unknown = data?.translations;
      const valid = res.ok && Array.isArray(translations) && translations.length === texts.length;

      if (valid) {
        const pairs: [string, string][] = texts.map((source, i) => [source, String((translations as string[])[i] ?? source)]);
        useTranslationCache.getState().commit(lang, pairs);
        texts.forEach((t) => inFlight.delete(t));
        return;
      }

      throw new Error(`Invalid translate response (ok=${res.ok})`);
    })
    .catch((err) => {
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => sendBatch(lang, texts, attempt + 1), RETRY_DELAY_MS * attempt);
      } else {
        console.error('Translation batch failed permanently:', err);
        texts.forEach((t) => inFlight.delete(t)); // allow a later t() call to retry
      }
    });
}

function flush(lang: string) {
  timerByLang.delete(lang);
  const pending = pendingByLang.get(lang);
  if (!pending || pending.size === 0) return;

  const texts = Array.from(pending);
  pending.clear();

  const inFlight = inFlightByLang.get(lang) ?? new Set<string>();
  inFlightByLang.set(lang, inFlight);
  texts.forEach((t) => inFlight.add(t));

  chunk(texts, CHUNK_SIZE).forEach((batch) => sendBatch(lang, batch, 1));
}

function scheduleTranslation(lang: string, text: string) {
  const inFlight = inFlightByLang.get(lang);
  if (inFlight?.has(text)) return;

  let pending = pendingByLang.get(lang);
  if (!pending) {
    pending = new Set();
    pendingByLang.set(lang, pending);
  }
  if (pending.has(text)) return;
  pending.add(text);

  if (!timerByLang.has(lang)) {
    timerByLang.set(lang, setTimeout(() => flush(lang), 150));
  }
}

/**
 * Translate-by-value UI hook. Wrap any user-facing string in t("...") —
 * the English string doubles as the cache key. Returns the source text
 * immediately (so the UI never blanks out) and swaps in the translation
 * once the batched request resolves, which re-renders the component.
 */
export function useT() {
  const language = useStore((s) => s.language);
  const cache = useTranslationCache((s) => s.cache);

  return useCallback(
    (text: string) => {
      if (!text || language === 'English') return text;
      const hit = cache[language]?.[text];
      if (hit !== undefined) return hit;
      scheduleTranslation(language, text);
      return text;
    },
    [language, cache]
  );
}
