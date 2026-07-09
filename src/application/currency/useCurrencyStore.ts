import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SupportedCurrency } from '../../domain/exchange/types';

interface CurrencyState {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      // 기본 KRW — 계산기 기본 입력값이 원화 스케일이라 첫 화면이 자연스럽고, 국내 주린이 주 타깃.
      // 달러는 토글 한 번(+ 실시간 원화 환산 노출)으로 전환.
      currency: 'KRW',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'cashbite-currency',
      storage: createJSONStorage(() => localStorage),
      // SSR: 마운트 후 ClientInit 에서 rehydrate (서버 렌더 크래시·하이드레이션 미스매치 방지).
      skipHydration: true,
    }
  )
);
