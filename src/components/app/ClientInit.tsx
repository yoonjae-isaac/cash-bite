'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../../application/theme/useThemeStore';
import { useUpDownStore } from '../../application/preferences/useUpDownStore';
import { useCurrencyStore } from '../../application/currency/useCurrencyStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { usePortfolioEvalStore } from '../../store/usePortfolioEvalStore';

/**
 * 클라이언트 초기화 — persist 스토어(skipHydration)를 마운트 후 rehydrate 하고,
 * 기존 App.tsx 의 "마운트 시 환율 로드"를 대체. SSR 크래시·하이드레이션 미스매치를 피하기 위해
 * 서버·첫 클라 렌더는 스토어 기본값으로 렌더되고, 여기서 저장값을 복원한다.
 */
export default function ClientInit() {
  useEffect(() => {
    useThemeStore.persist.rehydrate();
    useUpDownStore.persist.rehydrate();
    useCurrencyStore.persist.rehydrate();
    useLanguageStore.persist.rehydrate();
    usePortfolioStore.persist.rehydrate();
    usePortfolioEvalStore.persist.rehydrate();
    // 환율 초기 로드 (portfolio rehydrate 후 → 캐시된 ratesLastFetched 를 인식해 중복 요청 회피)
    usePortfolioStore.getState().fetchExchangeRate();
  }, []);

  return null;
}
