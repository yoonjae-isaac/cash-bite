
/**
 * Chrome 내장 Translation API 래퍼 (Chrome 131+)
 * 미지원 환경에서는 graceful fallback.
 */

// Chrome Translation API 타입 선언
interface ChromeTranslator {
  translate(input: string): Promise<string>;
  destroy(): void;
}

interface ChromeTranslationAPI {
  canTranslate(options: { sourceLanguage: string; targetLanguage: string }): Promise<'readily' | 'after-download' | 'no'>;
  createTranslator(options: { sourceLanguage: string; targetLanguage: string }): Promise<ChromeTranslator>;
}

declare global {
  interface Window {
    translation?: ChromeTranslationAPI;
  }
}

// 언어별 translator 인스턴스 캐시 (생성 비용이 크므로 재사용)
const translatorCache = new Map<string, Promise<ChromeTranslator | null>>();

// 번역 결과 캐시 (같은 텍스트 반복 번역 방지)
const resultCache = new Map<string, string>();

function cacheKey(text: string, targetLanguage: string): string {
  return `${targetLanguage}::${text}`;
}

async function getTranslator(targetLanguage: string): Promise<ChromeTranslator | null> {
  if (!window.translation) return null;

  const existing = translatorCache.get(targetLanguage);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const availability = await window.translation!.canTranslate({
        sourceLanguage: 'en',
        targetLanguage,
      });
      if (availability === 'no') return null;

      const translator = await window.translation!.createTranslator({
        sourceLanguage: 'en',
        targetLanguage,
      });
      return translator;
    } catch {
      return null;
    }
  })();

  translatorCache.set(targetLanguage, promise);
  return promise;
}

export function isChromeTranslationAvailable(): boolean {
  return typeof window !== 'undefined' && 'translation' in window;
}

export async function translateHeadline(text: string, targetLanguage: string): Promise<string> {
  // 영어→영어는 번역 불필요
  if (targetLanguage === 'en') return text;
  if (!isChromeTranslationAvailable()) return text;

  const key = cacheKey(text, targetLanguage);
  if (resultCache.has(key)) return resultCache.get(key)!;

  try {
    const translator = await getTranslator(targetLanguage);
    if (!translator) return text;

    const translated = await translator.translate(text);
    resultCache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}
