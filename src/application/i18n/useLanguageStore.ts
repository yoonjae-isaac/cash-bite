
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, TranslationSchema } from '../../domain/i18n/types';
import { locales } from '../../infrastructure/i18n';

interface LanguageState {
  language: Language;
  t: TranslationSchema;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko',
      t: locales.ko,
      setLanguage: (lang: Language) =>
        set({
          language: lang,
          t: locales[lang],
        }),
    }),
    {
      name: 'language-storage',
      // We only want to persist the language code, not the whole translation object
      // But for simplicity in this implementation, we can persist both or re-hydrate
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = locales[state.language];
        }
      },
    }
  )
);
