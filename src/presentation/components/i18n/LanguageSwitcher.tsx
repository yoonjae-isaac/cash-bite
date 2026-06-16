
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';
import type { Language } from '../../../domain/i18n/types';
import { Globe } from 'lucide-react';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: 'KO' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: 'JA' },
  ];

  return (
    <div className="flex items-center gap-2 bg-cb-surface/70 p-1 rounded-lg border border-cb-border">
      <Globe className="w-3.5 h-3.5 text-cb-muted ml-1.5" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              if (language !== lang.code) {
                trackEvent('language_changed', { language: lang.code });
              }
              setLanguage(lang.code);
            }}
            className={`px-2 py-1 text-xs font-bold rounded transition-all ${
              language === lang.code
                ? 'bg-cb-accent text-cb-on-accent shadow-lg shadow-black/25'
                : 'text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
