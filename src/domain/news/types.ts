export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // Unix timestamp (seconds)
  image: string;
  category: string;
}

export type TranslationMode = 'chrome-ai' | 'mymemory' | 'not-needed';
export type TranslationStatus = 'idle' | 'translating' | 'done' | 'error';
