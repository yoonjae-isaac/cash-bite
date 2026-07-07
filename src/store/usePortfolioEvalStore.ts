import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EvalPosition, StoredEvaluation } from '../domain/persona/types';

/** 평가 기록 보관 상한. */
const MAX_HISTORY = 20;

interface PortfolioEvalState {
  /** 등록한 보유 종목 (브라우저 영속). */
  positions: EvalPosition[];
  /** 선택한 거장 키 (브라우저 영속). */
  selectedKey: string;
  /** 지난 평가 기록 (최신순, 브라우저 영속). */
  evaluations: StoredEvaluation[];

  addPosition: (p: EvalPosition) => void;
  updatePosition: (id: string, patch: Partial<EvalPosition>) => void;
  removePosition: (id: string) => void;
  clearPositions: () => void;
  setSelectedKey: (key: string) => void;
  addEvaluation: (e: StoredEvaluation) => void;
  clearEvaluations: () => void;
}

/**
 * 내 종목 평가 상태 — 등록 종목·선택 거장·평가 기록을 localStorage 에 영속(재방문 시 복원).
 */
export const usePortfolioEvalStore = create<PortfolioEvalState>()(
  persist(
    (set) => ({
      positions: [],
      selectedKey: '',
      evaluations: [],

      addPosition: (p) => set((s) => ({ positions: [...s.positions, p] })),
      updatePosition: (id, patch) =>
        set((s) => ({
          positions: s.positions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removePosition: (id) => set((s) => ({ positions: s.positions.filter((x) => x.id !== id) })),
      clearPositions: () => set({ positions: [] }),
      setSelectedKey: (key) => set({ selectedKey: key }),
      addEvaluation: (e) => set((s) => ({ evaluations: [e, ...s.evaluations].slice(0, MAX_HISTORY) })),
      clearEvaluations: () => set({ evaluations: [] }),
    }),
    {
      name: 'cashbite-portfolio-eval',
      storage: createJSONStorage(() => localStorage),
      // SSR: 마운트 후 ClientInit 에서 rehydrate.
      skipHydration: true,
    },
  ),
);
