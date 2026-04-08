import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../../domain/theme/types';

export const THEME_STORAGE_KEY = 'theme-storage';

function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return 'dark';
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    return parsed.state?.theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

function applyDataTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: readStoredTheme(),
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
      onRehydrateStorage: () => (state) => {
        if (state) applyDataTheme(state.theme);
      },
    }
  )
);
