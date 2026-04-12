
const BASE_URL = 'https://finnhub.io/api/v1';

export class InvalidTickerError extends Error {
  constructor() {
    super('Invalid ticker');
    this.name = 'InvalidTickerError';
    Object.setPrototypeOf(this, InvalidTickerError.prototype);
  }
}

export const fetchQuote = async (symbol: string, apiKey: string) => {
  const res = await fetch(`${BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return {
    currentPrice: data.c || 0,
    highPrice: data.h || 0,
    lowPrice: data.l || 0,
    openPrice: data.o || 0,
    prevClosePrice: data.pc || 0,
  };
};

export const fetchFinancials = async (symbol: string, apiKey: string) => {
  const res = await fetch(`${BASE_URL}/stock/metric?symbol=${symbol.toUpperCase()}&metric=all&token=${apiKey}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  
  return {
    symbol: data.symbol,
    dividendPerShareAnnual: data.metric?.dividendPerShareAnnual || 0,
    dividendYieldIndicatedAnnual: data.metric?.dividendYieldIndicatedAnnual || 0,
  };
};

export const fetchDividendHistory = async (symbol: string, apiKey: string): Promise<string> => {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 730 * 86400_000).toISOString().split('T')[0];
    const res = await fetch(
      `${BASE_URL}/stock/dividend?symbol=${symbol.toUpperCase()}&from=${from}&to=${to}&token=${apiKey}`
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return '-';
    const sorted = [...data].sort(
      (a, b) => new Date(b.exDate).getTime() - new Date(a.exDate).getTime()
    );
    return sorted[0].exDate ?? '-';
  } catch {
    return '-';
  }
};

export const fetchSymbolProfile = async (symbol: string, apiKey: string) => {
  const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const profileTicker = typeof data.ticker === 'string' ? data.ticker.trim() : '';
  if (!name && !profileTicker) {
    throw new InvalidTickerError();
  }

  return {
    name: name || profileTicker || symbol,
    logo: data.logo || '',
    currency: data.currency || 'USD',
  };
};
