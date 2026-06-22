import { backendGet } from './backendClient';
import type {
  RecommendationTrend,
  PriceTarget,
  NewsArticle,
} from '../../domain/portfolio/detailTypes';

/** 백엔드 /stocks/:symbol/summary 응답 (libs/stock StockSummary). */
export interface StockSummary {
  ticker: string;
  name: string;
  logo: string;
  currency: string;
  currentPrice: number;
  dividendPerShare: number;
  dividendYield: number;
  exDividendDate: string;
}

/** 백엔드 /stocks/:symbol/detail 응답 (libs/stock StockDetailData). */
export interface StockDetailData {
  recommendation: RecommendationTrend | null;
  priceTarget: PriceTarget | null;
  news: NewsArticle[];
}

/**
 * 종목 데이터 — 백엔드 Finnhub 프록시. 프론트는 Finnhub 를 직접 호출하지 않으며
 * API 키는 백엔드에만 존재한다. 잘못된 티커는 백엔드가 404 로 응답(BackendApiError).
 */
export const fetchStockSummary = (ticker: string): Promise<StockSummary> =>
  backendGet<StockSummary>(`/stocks/${encodeURIComponent(ticker.toUpperCase())}/summary`);

export const fetchStockDetail = (ticker: string): Promise<StockDetailData> =>
  backendGet<StockDetailData>(`/stocks/${encodeURIComponent(ticker.toUpperCase())}/detail`);
