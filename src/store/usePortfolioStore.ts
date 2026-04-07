import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ExchangeRates } from '../domain/exchange/types';
import type { StockItem } from '../domain/portfolio/types';
import { FALLBACK_RATES } from '../domain/exchange/constants';
import * as finnhub from '../infrastructure/api/finnhubClient';

interface PortfolioState {
  stocks: StockItem[];
  rates: ExchangeRates;
  isLoading: boolean;
  error: string | null;
}

interface PortfolioActions {
  addStock: (ticker: string, shares: number) => Promise<void>;
  removeStock: (id: string) => void;
  setShares: (id: string, shares: number) => void;
  fetchExchangeRate: () => Promise<void>;
  clearError: () => void;
}

export type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      stocks: [],
      rates: FALLBACK_RATES,
      isLoading: false,
      error: null,

      addStock: async (ticker, shares) => {
        set({ isLoading: true, error: null });
        const uppercaseTicker = ticker.toUpperCase().trim();
        const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

        try {
          if (!apiKey) {
             throw new Error("API Key is missing. Please check your .env file.");
          }

          // Parallel API calls
          const [profile, quote, financials] = await Promise.all([
            finnhub.fetchSymbolProfile(uppercaseTicker, apiKey),
            finnhub.fetchQuote(uppercaseTicker, apiKey),
            finnhub.fetchFinancials(uppercaseTicker, apiKey)
          ]);

          const newStock: StockItem = {
            id: crypto.randomUUID(),
            ticker: uppercaseTicker,
            shares,
            currentPrice: quote.currentPrice,
            dividendPerShare: financials.dividendPerShareAnnual,
            dividendYield: financials.dividendYieldIndicatedAnnual,
            exDividendDate: '-',
            name: profile.name,
          };

          set((state) => ({
            stocks: [...state.stocks, newStock],
            isLoading: false,
          }));
        } catch (err: any) {
          console.error("Failed to add stock:", err);
          set({ 
            error: err.message || "Failed to fetch stock data. Please check the ticker.", 
            isLoading: false 
          });
        }
      },

      removeStock: (id) =>
        set((state) => ({
          stocks: state.stocks.filter((stock) => stock.id !== id),
        })),

      setShares: (id, shares) =>
        set((state) => ({
          stocks: state.stocks.map((stock) =>
            stock.id === id ? { ...stock, shares } : stock
          ),
        })),

      fetchExchangeRate: async () => {
        const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
        if (!apiKey) return;

        set({ isLoading: true });
        try {
          const quotes = await finnhub.fetchForexRates(apiKey);
          if (quotes.KRW || quotes.JPY) {
            set({ 
              rates: {
                USD: 1,
                KRW: quotes.KRW || get().rates.KRW,
                JPY: quotes.JPY || get().rates.JPY,
              },
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Failed to fetch exchange rates:', error);
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
