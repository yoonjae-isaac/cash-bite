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
      currency: 'USD',
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
