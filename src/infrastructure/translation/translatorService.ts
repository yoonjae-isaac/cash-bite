import type { TranslationMode } from '../../domain/news/types';

// MyMemory free tier: no key, ~1000 words/day per IP
const MY_MEMORY_BASE = 'https://api.mymemory.translated.net/get';

// BCP-47 language codes
const LANG_CODES: Record<string, string> = {
  ko: 'ko',
  ja: 'ja',
  en: 'en',
};

/**
 * Detect which translation strategy is available for the given target language.
 * Priority: Chrome AI (silent, no user config) → MyMemory (manual trigger)
 */
export async function detectTranslationMode(
  targetLanguage: string
): Promise<TranslationMode> {
  if (targetLanguage === 'en') return 'not-needed';

  const langCode = LANG_CODES[targetLanguage] ?? targetLanguage;

  try {
    const ai = window.ai;
    if (ai?.translator?.availability) {
      const status = await ai.translator.availability({
        sourceLanguage: 'en',
        targetLanguage: langCode,
      });
      if (status === 'readily' || status === 'after-download') {
        return 'chrome-ai';
      }
    }
  } catch {
    // Chrome AI not available or blocked
  }

  return 'mymemory';
}

/**
 * Translate an array of English texts using Chrome's built-in AI Translator API.
 * Throws if Chrome AI is unavailable.
 */
export async function translateWithChromeAi(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  const ai = window.ai;
  if (!ai?.translator?.create) throw new Error('Chrome AI Translator not available');

  const translator = await ai.translator.create({
    sourceLanguage: 'en',
    targetLanguage: LANG_CODES[targetLanguage] ?? targetLanguage,
  });

  const results = await Promise.all(texts.map((t) => translator.translate(t)));
  translator.destroy();
  return results;
}

/**
 * Translate a single English text using the free MyMemory API.
 * No API key required; free tier ~1000 words/day per IP.
 */
export async function translateWithMyMemory(
  text: string,
  targetLanguage: string
): Promise<string> {
  const langCode = LANG_CODES[targetLanguage] ?? targetLanguage;
  const url = `${MY_MEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number;
    responseData: { translatedText: string };
  };

  if (data.responseStatus !== 200) throw new Error('MyMemory translation failed');
  return data.responseData.translatedText;
}
