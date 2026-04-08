import type { ExchangeRates } from '../../domain/exchange/types';
import { FALLBACK_RATES } from '../../domain/exchange/constants';
import { fetchNaverExchangeRates } from '../api/naverExchangeClient';

export const fetchLatestRates = async (): Promise<ExchangeRates> => {
  try {
    const partial = await fetchNaverExchangeRates();
    return {
      USD: 1,
      KRW: partial.KRW ?? FALLBACK_RATES.KRW,
      JPY: partial.JPY ?? FALLBACK_RATES.JPY,
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return FALLBACK_RATES;
  }
};
