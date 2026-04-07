
export interface ExchangeRates {
  USD: number;
  KRW: number;
  JPY: number;
}

export type SupportedCurrency = keyof ExchangeRates;
