
import type { RecommendationTrend, PriceTarget, NewsArticle } from '../../domain/portfolio/detailTypes';

const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchRecommendation = async (
  symbol: string,
  apiKey: string
): Promise<RecommendationTrend | null> => {
  const res = await fetch(
    `${BASE_URL}/stock/recommendation?symbol=${symbol.toUpperCase()}&token=${apiKey}`
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0] as RecommendationTrend;
};

export const fetchPriceTarget = async (
  symbol: string,
  apiKey: string
): Promise<PriceTarget | null> => {
  const res = await fetch(
    `${BASE_URL}/stock/price-target?symbol=${symbol.toUpperCase()}&token=${apiKey}`
  );
  const data = await res.json();
  if (!data || data.targetMean == null) return null;
  return {
    targetHigh: data.targetHigh ?? 0,
    targetLow: data.targetLow ?? 0,
    targetMean: data.targetMean ?? 0,
    targetMedian: data.targetMedian ?? 0,
    lastUpdated: data.lastUpdated ?? '',
  };
};

export const fetchCompanyNews = async (
  symbol: string,
  apiKey: string,
  count = 3
): Promise<NewsArticle[]> => {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 7 * 86400_000).toISOString().split('T')[0];
  const res = await fetch(
    `${BASE_URL}/company-news?symbol=${symbol.toUpperCase()}&from=${from}&to=${to}&token=${apiKey}`
  );
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.slice(0, count) as NewsArticle[];
};

export const fetchMarketNews = async (apiKey: string): Promise<NewsArticle[]> => {
  const res = await fetch(`${BASE_URL}/news?category=general&token=${apiKey}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.slice(0, 10) as NewsArticle[];
};
