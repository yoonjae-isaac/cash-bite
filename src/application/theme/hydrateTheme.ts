import { THEME_STORAGE_KEY } from './useThemeStore';

/** 첫 페인트 전 `document.documentElement.dataset.theme` 동기화 (Zustand persist 키와 동일 구조). */
export function hydrateTheme(): void {
  const root = document.documentElement;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      root.dataset.theme = 'dark';
      return;
    }
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    root.dataset.theme = parsed.state?.theme === 'light' ? 'light' : 'dark';
  } catch {
    root.dataset.theme = 'dark';
  }
}
