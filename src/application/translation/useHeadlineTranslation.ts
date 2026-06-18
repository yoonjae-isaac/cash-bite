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
    // en 은 번역 불필요 — 표시 텍스트는 반환부에서 headline 으로 파생한다.
    if (language === 'en') return;

    const run = async () => {
      // 1. 영속 캐시 우선
      if (id !== undefined) {
        const cached = readFromCache(id, language);
        if (cached) {
          if (mountedRef.current) setTranslatedText(cached);
          return;
        }
      }

      // 2. 캐시 없음 — 번역 (진행 중엔 원문 표시)
      if (mountedRef.current) {
        setIsTranslating(true);
        setTranslatedText(headline);
      }

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

  // en 은 항상 원문, 그 외엔 번역 상태값을 표시.
  const text = language === 'en' ? headline : translatedText;
  return { text, isTranslating, isAvailable };
}
