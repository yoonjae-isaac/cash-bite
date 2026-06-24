import { create } from 'zustand';
import type { IndexQuote } from '../../domain/market/types';
import { fetchIndices as fetchIndicesApi } from '../../infrastructure/api/marketClient';

// 백엔드가 30s 캐시하므로 프론트도 30s 미만이면 재요청 생략 (force 로 우회).
const INDICES_TTL = 30 * 1000;

interface IndicesState {
  indices: IndexQuote[];
  isLoading: boolean;
  lastFetched: number | null;
  error: string | null;
  fetchIndices: (force?: boolean) => Promise<void>;
}

export const useIndicesStore = create<IndicesState>()((set, get) => ({
  indices: [],
  isLoading: false,
  lastFetched: null,
  error: null,
  fetchIndices: async (force = false) => {
    const { isLoading, lastFetched } = get();
    if (isLoading) return;
    if (!force && lastFetched !== null && Date.now() - lastFetched < INDICES_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const indices = await fetchIndicesApi();
      set({ indices, lastFetched: Date.now(), isLoading: false });
    } catch (err) {
      // best-effort — 실패해도 바는 직전 값/플레이스홀더 유지.
      set({ isLoading: false, error: err instanceof Error ? err.message : 'failed' });
    }
  },
}));
