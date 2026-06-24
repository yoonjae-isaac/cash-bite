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

/** 일별 뉴스 다이제스트 — 백엔드 GET /news/digest (Gemini AI 요약). */
export interface NewsDigest {
  market: 'KR' | 'US';
  digestDate: string; // YYYY-MM-DD
  summary: string;
  articleCount: number;
  generatedAt: string; // ISO 8601
  model?: string;
}

export type TranslationMode = 'chrome-ai' | 'mymemory' | 'not-needed';
export type TranslationStatus = 'idle' | 'translating' | 'done' | 'error';
