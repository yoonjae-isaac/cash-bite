import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../../application/theme/useThemeStore';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const ThemeToggle = () => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        trackEvent('theme_changed', { theme: next });
        toggleTheme();
      }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-1.5 rounded-lg border border-cb-border bg-cb-surface/70 text-cb-muted hover:text-cb-accent hover:border-cb-accent/35 transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
