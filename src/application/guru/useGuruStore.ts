import { create } from 'zustand';
import type { GuruInvestor, GuruPortfolio, GuruStats } from '../../domain/guru/types';
import {
  fetchGuruInvestors,
  fetchGuruPortfolio,
  fetchGuruStats,
} from '../../infrastructure/api/guruClient';
import {
  loadCachedInvestors,
  loadCachedPortfolio,
  loadCachedStats,
  saveCachedInvestors,
  saveCachedPortfolio,
  saveCachedStats,
} from '../../infrastructure/guru/guruCache';

const DEFAULT_INVESTOR = 'buffett';

interface GuruState {
  investors: GuruInvestor[];
  selectedKey: string;
  portfolios: Record<string, GuruPortfolio>; // 메모리 캐시 (하위: localStorage 24h → 백엔드 Redis 24h)
  isLoadingInvestors: boolean;
  isLoadingPortfolio: boolean;
  error: string | null;
  stats: GuruStats | null;
  isLoadingStats: boolean;
  statsError: string | null;
}

interface GuruActions {
  init: () => Promise<void>;
  selectInvestor: (key: string) => Promise<void>;
  loadStats: () => Promise<void>;
}

export const useGuruStore = create<GuruState & GuruActions>()((set, get) => ({
  investors: [],
  selectedKey: DEFAULT_INVESTOR,
  portfolios: {},
  isLoadingInvestors: false,
  isLoadingPortfolio: false,
  error: null,
  stats: null,
  isLoadingStats: false,
  statsError: null,

  init: async () => {
    const { investors, selectedKey } = get();
    if (investors.length === 0) {
      const cached = loadCachedInvestors();
      if (cached && cached.length > 0) {
        set({ investors: cached });
      } else {
        set({ isLoadingInvestors: true, error: null });
        try {
          const list = await fetchGuruInvestors();
          saveCachedInvestors(list);
          set({ investors: list, isLoadingInvestors: false });
        } catch (err) {
          set({
            isLoadingInvestors: false,
            error: err instanceof Error ? err.message : 'Failed to load investors',
          });
          return;
        }
      }
    }
    await get().selectInvestor(selectedKey);
  },

  selectInvestor: async (key: string) => {
    set({ selectedKey: key, error: null });
    if (get().portfolios[key]) return; // 메모리 캐시 hit

    const cached = loadCachedPortfolio(key);
    if (cached) {
      set((state) => ({ portfolios: { ...state.portfolios, [key]: cached } }));
      return;
    }

    set({ isLoadingPortfolio: true });
    try {
      const portfolio = await fetchGuruPortfolio(key);
      saveCachedPortfolio(key, portfolio);
      set((state) => ({
        portfolios: { ...state.portfolios, [key]: portfolio },
        isLoadingPortfolio: false,
      }));
    } catch (err) {
      set({
        isLoadingPortfolio: false,
        error: err instanceof Error ? err.message : 'Failed to load portfolio',
      });
    }
  },

  loadStats: async () => {
    if (get().stats) return; // 메모리 캐시 hit

    const cached = loadCachedStats();
    if (cached) {
      set({ stats: cached });
      return;
    }

    set({ isLoadingStats: true, statsError: null });
    try {
      const stats = await fetchGuruStats();
      saveCachedStats(stats);
      set({ stats, isLoadingStats: false });
    } catch (err) {
      set({
        isLoadingStats: false,
        statsError: err instanceof Error ? err.message : 'Failed to load stats',
      });
    }
  },
}));
