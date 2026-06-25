import { backendGet } from './backendClient';
import type { NewsItem, NewsDigest } from '../../domain/news/types';

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
    // 파싱 실패 시 0(=미상) — 가짜 현재시각으로 채우면 "전부 방금 전"으로 오인되므로 폴백 금지.
    datetime: Number.isNaN(ts) ? 0 : Math.floor(ts / 1000),
    image: it.image ?? '',
    category: it.market,
  };
}

/**
 * 시장별 최신 뉴스 — 백엔드 DB 피드 (크론이 5분마다 적재). KR=Naver 키워드, US=Finnhub 일반.
 * 프론트는 외부 API 를 직접 호출하지 않고 백엔드 DB 값을 받는다.
 */
export async function fetchMarketNews(market: 'KR' | 'US', limit = 30): Promise<NewsItem[]> {
  const data = await backendGet<BackendNewsItem[]>(`/news?market=${market}&limit=${limit}`);
  return data.map(normalize);
}

/** 시장별 최신 AI 다이제스트 (아직 생성 전이면 null). */
export function fetchNewsDigest(market: 'KR' | 'US'): Promise<NewsDigest | null> {
  return backendGet<NewsDigest | null>(`/news/digest?market=${market}`);
}
