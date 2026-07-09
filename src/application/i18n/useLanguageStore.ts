'use client';

import { createContext, createElement, useContext, type ReactNode } from 'react';
import type { Language, TranslationSchema } from '../../domain/i18n/types';
import { locales } from '../../infrastructure/i18n';

interface LanguageState {
  language: Language;
  t: TranslationSchema;
  setLanguage: (lang: Language) => void;
}

// 언어는 URL 로케일이 결정 → React 컨텍스트로 공급(SSR·클라 동일). 전역 zustand 스토어를 대체.
const LanguageContext = createContext<Language>('ko');

/** URL 로케일을 컨텍스트로 공급([locale] 레이아웃에서 사용). SSR 이 이 언어로 렌더된다. */
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  return createElement(LanguageContext.Provider, { value: language }, children);
}

const noop = () => {};

/**
 * 기존 zustand selector API 호환 훅 — 이제 컨텍스트(URL 로케일) 기반이라 서버 렌더에서도 해당 언어로 나온다.
 * 언어 전환은 setLanguage 가 아니라 LanguageSwitcher 의 URL 라우팅으로 처리(setLanguage 는 호환용 no-op).
 */
export function useLanguageStore(): LanguageState;
export function useLanguageStore<T>(selector: (s: LanguageState) => T): T;
export function useLanguageStore<T>(selector?: (s: LanguageState) => T): T | LanguageState {
  const language = useContext(LanguageContext);
  const state: LanguageState = { language, t: locales[language], setLanguage: noop };
  return selector ? selector(state) : state;
}
