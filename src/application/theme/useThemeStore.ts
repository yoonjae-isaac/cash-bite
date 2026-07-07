import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../../domain/theme/types';

export const THEME_STORAGE_KEY = 'theme-storage';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// SSR 안전: 서버에는 document 가 없다. 첫 페인트 색은 layout 의 프리하이드레이션 스크립트가
// data-theme 속성으로 이미 반영하므로, 여기서는 클라이언트에서만 속성을 동기화한다.
function applyDataTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 기본값 dark (CSS :root · 프리하이드레이션 스크립트 기본과 일치). 실제 저장값은 rehydrate 로 복원.
      theme: 'dark',
      toggleTheme: () => {
        const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
        applyDataTheme(next);
        set({ theme: next });
      },
      setTheme: (mode) => {
        applyDataTheme(mode);
        set({ theme: mode });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
      // SSR: 서버·첫 클라 렌더는 기본값으로 일치시키고, 마운트 후 ClientInit 에서 rehydrate.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) applyDataTheme(state.theme);
      },
    }
  )
);
