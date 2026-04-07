
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';
import type { Language } from '../../../domain/i18n/types';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: 'KO' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: 'JA' },
  ];

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2 py-1 text-xs font-bold rounded transition-all ${
              language === lang.code
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
