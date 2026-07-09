import { defineRouting } from 'next-intl/routing';

// ko 는 루트(prefix 없음), en·ja 만 /en·/ja 프리픽스 → 기존 색인 URL 보존.
// localeDetection:false — 브라우저 언어로 루트를 리다이렉트하지 않음(무리다이렉트 원칙, 기존 색인 ko URL 보존).
// 언어 전환은 헤더 LanguageSwitcher 의 명시적 URL 이동으로만.
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
