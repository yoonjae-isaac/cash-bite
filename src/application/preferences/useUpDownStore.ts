import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 상승/하락 색. default: 상승 파랑/하락 빨강 · swap: 상승 빨강/하락 파랑 */
export type UpDownMode = 'default' | 'swap';

export const UPDOWN_STORAGE_KEY = 'updown-storage';

function readStored(): UpDownMode {
  try {
    const raw = localStorage.getItem(UPDOWN_STORAGE_KEY);
    if (!raw) return 'default';
    const parsed = JSON.parse(raw) as { state?: { mode?: string } };
    return parsed.state?.mode === 'swap' ? 'swap' : 'default';
  } catch {
    return 'default';
  }
}

function applyDataUpDown(mode: UpDownMode): void {
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
      mode: readStored(),
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
      onRehydrateStorage: () => (state) => {
        if (state) applyDataUpDown(state.mode);
      },
    },
  ),
);
