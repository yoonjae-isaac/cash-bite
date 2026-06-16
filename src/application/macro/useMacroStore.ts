import { create } from 'zustand';
import type { MacroCatalogEntry, MacroSeriesData } from '../../domain/macro/types';
import { fetchMacroCatalog, fetchMacroSeries } from '../../infrastructure/api/macroClient';

export type MacroRange = '1y' | '3y' | '5y' | 'all';

const DEFAULT_ID = 'us-cpi';
const DEFAULT_RANGE: MacroRange = '5y';

/** range → from(YYYY-MM-DD). 'all' 은 undefined (백엔드 전체 반환) */
function rangeToFrom(range: MacroRange): string | undefined {
  if (range === 'all') return undefined;
  const years = range === '1y' ? 1 : range === '3y' ? 3 : 5;
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

interface MacroState {
  catalog: MacroCatalogEntry[];
  selectedId: string;
  range: MacroRange;
  seriesCache: Record<string, MacroSeriesData>; // `${id}:${range}` → 데이터 (세션 메모리)
  isLoadingCatalog: boolean;
  isLoadingSeries: boolean;
  error: string | null;
}

interface MacroActions {
  init: () => Promise<void>;
  selectSeries: (id: string) => Promise<void>;
  setRange: (range: MacroRange) => Promise<void>;
  loadSeries: (id: string, range: MacroRange) => Promise<void>;
}

export const useMacroStore = create<MacroState & MacroActions>()((set, get) => ({
  catalog: [],
  selectedId: DEFAULT_ID,
  range: DEFAULT_RANGE,
  seriesCache: {},
  isLoadingCatalog: false,
  isLoadingSeries: false,
  error: null,

  init: async () => {
    if (get().catalog.length === 0) {
      set({ isLoadingCatalog: true, error: null });
      try {
        const catalog = await fetchMacroCatalog();
        set({ catalog, isLoadingCatalog: false });
      } catch (err) {
        set({
          isLoadingCatalog: false,
          error: err instanceof Error ? err.message : 'Failed to load catalog',
        });
        return;
      }
    }
    await get().loadSeries(get().selectedId, get().range);
  },

  selectSeries: async (id: string) => {
    set({ selectedId: id, error: null });
    await get().loadSeries(id, get().range);
  },

  setRange: async (range: MacroRange) => {
    set({ range, error: null });
    await get().loadSeries(get().selectedId, range);
  },

  // 내부 — 캐시 확인 후 fetch
  loadSeries: async (id: string, range: MacroRange) => {
    const cacheKey = `${id}:${range}`;
    if (get().seriesCache[cacheKey]) return;

    set({ isLoadingSeries: true });
    try {
      const data = await fetchMacroSeries(id, rangeToFrom(range));
      set((state) => ({
        seriesCache: { ...state.seriesCache, [cacheKey]: data },
        isLoadingSeries: false,
      }));
    } catch (err) {
      set({
        isLoadingSeries: false,
        error: err instanceof Error ? err.message : 'Failed to load series',
      });
    }
  },
}));
