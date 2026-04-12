
import { create } from 'zustand';
import type { StockDetail, MarketNewsCache, DetailLoadState } from '../domain/portfolio/detailTypes';
import * as detailApi from '../infrastructure/api/finnhubDetailClient';

const DETAIL_CACHE_TTL = 5 * 60 * 1000;   // 5분
const MARKET_NEWS_TTL = 30 * 60 * 1000;   // 30분

interface StockDetailState {
  details: Record<string, StockDetail>;
  loadStates: Record<string, DetailLoadState>;
  errors: Record<string, string | null>;
  marketNews: MarketNewsCache | null;
  marketNewsLoadState: DetailLoadState;
}

interface StockDetailActions {
  fetchStockDetail: (ticker: string) => Promise<void>;
  fetchMarketNews: () => Promise<void>;
}

export type StockDetailStore = StockDetailState & StockDetailActions;

export const useStockDetailStore = create<StockDetailStore>()((set, get) => ({
  details: {},
  loadStates: {},
  errors: {},
  marketNews: null,
  marketNewsLoadState: 'idle',

  fetchStockDetail: async (ticker) => {
    const state = get();
    const existing = state.details[ticker];
    const now = Date.now();

    if (existing && now - existing.fetchedAt < DETAIL_CACHE_TTL) return;
    if (state.loadStates[ticker] === 'loading') return;

    set((s) => ({
      loadStates: { ...s.loadStates, [ticker]: 'loading' },
      errors: { ...s.errors, [ticker]: null },
    }));

    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    try {
      const [recommendation, priceTarget, news] = await Promise.all([
        detailApi.fetchRecommendation(ticker, apiKey),
        detailApi.fetchPriceTarget(ticker, apiKey),
        detailApi.fetchCompanyNews(ticker, apiKey, 3),
      ]);

      set((s) => ({
        details: {
          ...s.details,
          [ticker]: { ticker, recommendation, priceTarget, news, fetchedAt: Date.now() },
        },
        loadStates: { ...s.loadStates, [ticker]: 'success' },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load detail';
      set((s) => ({
        loadStates: { ...s.loadStates, [ticker]: 'error' },
        errors: { ...s.errors, [ticker]: message },
      }));
    }
  },

  fetchMarketNews: async () => {
    const state = get();
    const now = Date.now();

    if (state.marketNews && now - state.marketNews.fetchedAt < MARKET_NEWS_TTL) return;
    if (state.marketNewsLoadState === 'loading') return;

    set({ marketNewsLoadState: 'loading' });
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    try {
      const articles = await detailApi.fetchMarketNews(apiKey);
      set({ marketNews: { articles, fetchedAt: Date.now() }, marketNewsLoadState: 'success' });
    } catch {
      set({ marketNewsLoadState: 'error' });
    }
  },
}));
