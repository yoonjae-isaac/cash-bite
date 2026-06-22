
import { create } from 'zustand';
import type { StockDetail, MarketNewsCache, DetailLoadState } from '../domain/portfolio/detailTypes';
import { fetchStockDetail as fetchStockDetailApi } from '../infrastructure/api/stockClient';
import { fetchMarketNews as fetchBackendMarketNews } from '../infrastructure/api/backendNewsClient';

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

    try {
      // 백엔드 Finnhub 프록시 — 추천+목표가+종목뉴스 (API 키는 백엔드에만).
      const { recommendation, priceTarget, news } = await fetchStockDetailApi(ticker);

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
    try {
      // 홈 프리뷰도 NewsPage 와 동일하게 백엔드 DB(/news?market=US) 사용 (C: 뉴스 경로 일원화).
      const articles = await fetchBackendMarketNews('US');
      set({ marketNews: { articles, fetchedAt: Date.now() }, marketNewsLoadState: 'success' });
    } catch {
      set({ marketNewsLoadState: 'error' });
    }
  },
}));
