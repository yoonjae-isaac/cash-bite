
import type { ExchangeRates, SupportedCurrency } from './types';

export const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  KRW: 1350,
  JPY: 153.5,
};

/** 통화별 표시 기호 */
export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  KRW: '₩',
  JPY: '¥',
};
