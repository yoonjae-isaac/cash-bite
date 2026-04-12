
export interface RecommendationTrend {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface PriceTarget {
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  lastUpdated: string;
}

export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
  image: string;
}

export interface StockDetail {
  ticker: string;
  recommendation: RecommendationTrend | null;
  priceTarget: PriceTarget | null;
  news: NewsArticle[];
  fetchedAt: number;
}

export interface MarketNewsCache {
  articles: NewsArticle[];
  fetchedAt: number;
}

export type DetailLoadState = 'idle' | 'loading' | 'success' | 'error';
