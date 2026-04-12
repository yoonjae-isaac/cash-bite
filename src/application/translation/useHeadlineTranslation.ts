
import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '../i18n/useLanguageStore';
import { translateHeadline, isChromeTranslationAvailable } from '../../infrastructure/ai/chromeTranslator';

interface TranslationResult {
  text: string;
  isTranslating: boolean;
  isAvailable: boolean;
}

export function useHeadlineTranslation(headline: string): TranslationResult {
  const language = useLanguageStore((s) => s.language);
  const [translatedText, setTranslatedText] = useState(headline);
  const [isTranslating, setIsTranslating] = useState(false);
  const mountedRef = useRef(true);

  const isAvailable = isChromeTranslationAvailable();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // 영어이거나 API 미지원이면 원문 그대로
    if (language === 'en' || !isAvailable) {
      setTranslatedText(headline);
      return;
    }

    setIsTranslating(true);

    translateHeadline(headline, language).then((result) => {
      if (!mountedRef.current) return;
      setTranslatedText(result);
      setIsTranslating(false);
    });
  }, [headline, language, isAvailable]);

  return { text: translatedText, isTranslating, isAvailable };
}
