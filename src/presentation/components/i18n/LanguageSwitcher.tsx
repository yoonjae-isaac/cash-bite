import { Globe, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';
import type { Language } from '../../../domain/i18n/types';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-3.5 h-3.5 text-cb-muted absolute left-2 pointer-events-none" />
      <select
        value={language}
        onChange={(e) => {
          const code = e.target.value as Language;
          if (language !== code) {
            trackEvent('language_changed', { language: code });
          }
          setLanguage(code);
        }}
        aria-label="Language"
        className="appearance-none bg-cb-surface/70 border border-cb-border rounded-lg pl-7 pr-7 py-1.5 text-xs font-bold text-cb-foreground cursor-pointer hover:border-cb-accent/40 focus:outline-none focus:border-cb-accent/50 transition-colors"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-cb-muted absolute right-2 pointer-events-none" />
    </div>
  );
};

export default LanguageSwitcher;
