import { backendGet } from './backendClient';
import type { NewsItem } from '../../domain/news/types';

/** 백엔드 /news 응답 (libs/news NewsItem) */
interface BackendNewsItem {
  source: 'naver' | 'finnhub';
  market: 'KR' | 'US';
  id: string;
  title: string;
  url: string;
  publishedAt: string; // ISO 8601
  publisher?: string;
  summary?: string;
  image?: string;
}

/** 백엔드 NewsItem → 프론트 NewsItem (headline/datetime(unix)/source 형태로 정규화) */
function normalize(it: BackendNewsItem, index: number): NewsItem {
  const ts = Date.parse(it.publishedAt);
  return {
    // 프론트는 number id 를 기대 — 원본 string id 해시 대신 index 기반 안정 키 (목록 내 고유)
    id: Number.isNaN(ts) ? index : ts * 100 + index,
    headline: it.title,
    summary: it.summary ?? '',
    source: it.publisher ?? it.source,
    url: it.url,
    datetime: Number.isNaN(ts) ? Math.floor(Date.now() / 1000) : Math.floor(ts / 1000),
    image: it.image ?? '',
    category: it.market,
  };
}

/** 한국 시장 뉴스 — 네이버 검색 (백엔드 경유). 기본 키워드 '증시'. */
export async function fetchKrMarketNews(query = '증시', limit = 30): Promise<NewsItem[]> {
  const data = await backendGet<BackendNewsItem[]>(
    `/news?market=KR&query=${encodeURIComponent(query)}&limit=${limit}`
  );
  return data.map(normalize);
}
