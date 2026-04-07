
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import type { Language, TranslationSchema } from '../../domain/i18n/types';

export const locales: Record<Language, TranslationSchema> = {
  ko: ko as TranslationSchema,
  en: en as TranslationSchema,
  ja: ja as TranslationSchema,
};
