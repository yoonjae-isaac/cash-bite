
import type { ExchangeRates } from '../../domain/exchange/types';
import { FALLBACK_RATES } from '../../domain/exchange/constants';

export const fetchLatestRates = async (): Promise<ExchangeRates> => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    
    if (data && data.rates) {
      return {
        USD: 1,
        KRW: data.rates.KRW || FALLBACK_RATES.KRW,
        JPY: data.rates.JPY || FALLBACK_RATES.JPY,
      };
    }
    return FALLBACK_RATES;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return FALLBACK_RATES;
  }
};
