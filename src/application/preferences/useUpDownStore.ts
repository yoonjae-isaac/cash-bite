import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 상승/하락 색. default: 상승 파랑/하락 빨강 · swap: 상승 빨강/하락 파랑 */
export type UpDownMode = 'default' | 'swap';

export const UPDOWN_STORAGE_KEY = 'updown-storage';

// SSR 안전: 서버에는 document 가 없다. 첫 페인트는 layout 프리하이드레이션 스크립트가 data-updown 로 반영.
function applyDataUpDown(mode: UpDownMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.updown = mode;
}

interface UpDownState {
  mode: UpDownMode;
  toggle: () => void;
  setMode: (mode: UpDownMode) => void;
}

export const useUpDownStore = create<UpDownState>()(
  persist(
    (set, get) => ({
      // 기본값 default. 실제 저장값은 rehydrate 로 복원.
      mode: 'default',
      toggle: () => {
        const next: UpDownMode = get().mode === 'swap' ? 'default' : 'swap';
        applyDataUpDown(next);
        set({ mode: next });
      },
      setMode: (mode) => {
        applyDataUpDown(mode);
        set({ mode });
      },
    }),
    {
      name: UPDOWN_STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) applyDataUpDown(state.mode);
      },
    },
  ),
);
