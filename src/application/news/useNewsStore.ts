import { create } from 'zustand';
import type { NewsItem, TranslationMode, TranslationStatus } from '../../domain/news/types';
import { fetchMarketNews } from '../../infrastructure/api/finnhubNewsClient';
import {
  detectTranslationMode,
  translateWithChromeAi,
  translateWithMyMemory,
} from '../../infrastructure/translation/translatorService';

// ─── Translation cache (localStorage) ───────────────────────────────────────

const TRANS_CACHE_KEY = 'cashbite-news-translations';

interface StoredTranslations {
  language: string;
  data: Record<string, string>; // string keys for JSON compatibility
}

function loadStoredTranslations(): StoredTranslations | null {
  try {
    const raw = localStorage.getItem(TRANS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as StoredTranslations) : null;
  } catch {
    return null;
  }
}

function saveStoredTranslations(language: string, data: Record<number, string>): void {
  try {
    // Convert number keys to strings for JSON serialisation
    const stringData: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) stringData[k] = v;
    localStorage.setItem(TRANS_CACHE_KEY, JSON.stringify({ language, data: stringData }));
  } catch {
    // localStorage quota exceeded — ignore
  }
}

/**
 * Given the stored translation cache and the current news list + language,
 * return only the translations that are valid (matching language & current IDs).
 */
function resolveStoredTranslations(
  stored: StoredTranslations | null,
  language: string,
  newsIds: Set<number>
): Record<number, string> {
  if (!stored || stored.language !== language) return {};
  const result: Record<number, string> = {};
  for (const [id, text] of Object.entries(stored.data)) {
    const numId = Number(id);
    if (newsIds.has(numId) && text) result[numId] = text;
  }
  return result;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface NewsState {
  news: NewsItem[];
  translations: Record<number, string>;
  isLoading: boolean;
  isTranslating: boolean;
  translationStatus: TranslationStatus;
  translationMode: TranslationMode | null;
  translationProgress: number;
  error: string | null;
  lastFetchedAt: number | null;
}

interface NewsActions {
  fetchNews: (force?: boolean) => Promise<void>;
  initTranslation: (language: string) => Promise<void>;
  translateAll: (language: string) => Promise<void>;
}

export const useNewsStore = create<NewsState & NewsActions>()((set, get) => ({
  news: [],
  translations: {},
  isLoading: false,
  isTranslating: false,
  translationStatus: 'idle',
  translationMode: null,
  translationProgress: 0,
  error: null,
  lastFetchedAt: null,

  fetchNews: async (force = false) => {
    set({ isLoading: true, error: null });
    try {
      const apiKey = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;
      if (!apiKey) throw new Error('Finnhub API key not configured');

      const items = await fetchMarketNews(apiKey, force);

      // When forcing a refresh, clear stale translation cache
      if (force) saveStoredTranslations('', {});

      set({ news: items, isLoading: false, lastFetchedAt: Date.now() });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch news',
        isLoading: false,
      });
    }
  },

  /**
   * Detect translation mode and restore cached translations if available.
   * If Chrome AI is available and no cache exists, auto-translate immediately.
   */
  initTranslation: async (language: string) => {
    if (language === 'en') {
      set({ translationMode: 'not-needed', translations: {}, translationStatus: 'idle' });
      return;
    }

    const { news } = get();
    const newsIds = new Set(news.map((n) => n.id));

    // Restore from localStorage before async availability check
    const stored = loadStoredTranslations();
    const cached = resolveStoredTranslations(stored, language, newsIds);
    const hasCachedAll = Object.keys(cached).length >= news.length * 0.9; // ≥90% coverage

    if (hasCachedAll) {
      // Enough translations cached — apply immediately, skip API call
      set({ translations: cached, translationStatus: 'done', translationProgress: news.length });
    } else {
      // Partial or no cache — apply what we have while detecting mode
      set({ translations: cached, translationStatus: 'idle', translationProgress: Object.keys(cached).length });
    }

    const mode = await detectTranslationMode(language);
    set({ translationMode: mode });

    if (hasCachedAll) return; // All done, no need to translate

    if (mode === 'chrome-ai' && news.length > 0) {
      get().translateAll(language);
    }
  },

  translateAll: async (language: string) => {
    const { news, translationMode } = get();
    if (!news.length || language === 'en') return;

    set({ isTranslating: true, translationStatus: 'translating', translationProgress: 0 });

    try {
      if (translationMode === 'chrome-ai') {
        const headlines = news.map((n) => n.headline);
        const translated = await translateWithChromeAi(headlines, language);
        const map: Record<number, string> = {};
        news.forEach((item, i) => {
          if (translated[i]) map[item.id] = translated[i];
        });
        set({ translations: map, isTranslating: false, translationStatus: 'done', translationProgress: news.length });
        saveStoredTranslations(language, map);
      } else {
        // MyMemory: sequential with delay; persist each result immediately
        const existingTranslations = { ...get().translations };
        let progress = Object.keys(existingTranslations).length;

        for (const item of news) {
          // Skip already-translated items (from partial cache)
          if (existingTranslations[item.id]) {
            progress++;
            set({ translationProgress: progress });
            continue;
          }
          try {
            const text = await translateWithMyMemory(item.headline, language);
            existingTranslations[item.id] = text;
            progress++;
            set({ translations: { ...existingTranslations }, translationProgress: progress });
            // Persist incrementally so partial results survive navigation
            saveStoredTranslations(language, existingTranslations);
            await new Promise((r) => setTimeout(r, 120));
          } catch {
            progress++;
            set({ translationProgress: progress });
          }
        }
        set({ isTranslating: false, translationStatus: 'done' });
        saveStoredTranslations(language, existingTranslations);
      }
    } catch (err) {
      set({
        isTranslating: false,
        translationStatus: 'error',
        error: err instanceof Error ? err.message : 'Translation failed',
      });
    }
  },
}));
