import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '../i18n/useLanguageStore';
import { translateHeadline, isChromeTranslationAvailable } from '../../infrastructure/ai/chromeTranslator';
import { translateWithMyMemory } from '../../infrastructure/translation/translatorService';

// Shared with useNewsStore — same key/shape so translations are reused across pages
const TRANS_CACHE_KEY = 'cashbite-news-translations';

interface StoredTranslations {
  language: string;
  data: Record<string, string>;
}

function readFromCache(id: number, language: string): string | null {
  try {
    const raw = localStorage.getItem(TRANS_CACHE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredTranslations;
    if (stored.language !== language) return null;
    return stored.data[String(id)] ?? null;
  } catch {
    return null;
  }
}

function writeToCache(id: number, language: string, text: string): void {
  try {
    const raw = localStorage.getItem(TRANS_CACHE_KEY);
    const stored: StoredTranslations = raw
      ? (JSON.parse(raw) as StoredTranslations)
      : { language, data: {} };

    // If language changed, reset
    if (stored.language !== language) {
      localStorage.setItem(TRANS_CACHE_KEY, JSON.stringify({ language, data: { [String(id)]: text } }));
      return;
    }
    stored.data[String(id)] = text;
    localStorage.setItem(TRANS_CACHE_KEY, JSON.stringify(stored));
  } catch {
    // quota exceeded — ignore
  }
}

interface TranslationResult {
  text: string;
  isTranslating: boolean;
  isAvailable: boolean;
}

/**
 * Auto-translates a headline based on the app's current language.
 * Priority: localStorage cache → Chrome AI → MyMemory (silent fallback).
 * Pass `id` (Finnhub article id) so the result is persisted and shared with NewsPage.
 */
export function useHeadlineTranslation(headline: string, id?: number): TranslationResult {
  const language = useLanguageStore((s) => s.language);
  const [translatedText, setTranslatedText] = useState<string>(() => {
    // Hydrate from cache synchronously on first render
    if (id !== undefined && language !== 'en') {
      return readFromCache(id, language) ?? headline;
    }
    return headline;
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const mountedRef = useRef(true);
  const isAvailable = isChromeTranslationAvailable();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedText(headline);
      return;
    }

    // 1. Check persistent cache first
    if (id !== undefined) {
      const cached = readFromCache(id, language);
      if (cached) {
        setTranslatedText(cached);
        return;
      }
    }

    // 2. No cache — translate
    setIsTranslating(true);
    setTranslatedText(headline); // show original while translating

    const run = async () => {
      let result = headline;

      if (isAvailable) {
        // Chrome AI (window.translation)
        result = await translateHeadline(headline, language);
      } else {
        // MyMemory silent fallback
        try {
          result = await translateWithMyMemory(headline, language);
        } catch {
          result = headline;
        }
      }

      if (!mountedRef.current) return;
      setTranslatedText(result);
      setIsTranslating(false);

      // Persist so other pages can reuse
      if (id !== undefined && result !== headline) {
        writeToCache(id, language, result);
      }
    };

    run().catch(() => {
      if (mountedRef.current) {
        setTranslatedText(headline);
        setIsTranslating(false);
      }
    });
  }, [headline, language, id, isAvailable]);

  return { text: translatedText, isTranslating, isAvailable };
}
