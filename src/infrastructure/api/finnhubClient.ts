
const BASE_URL = 'https://finnhub.io/api/v1';

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

export const fetchSymbolProfile = async (symbol: string, apiKey: string) => {
  const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return {
    name: data.name || symbol,
    logo: data.logo || '',
    currency: data.currency || 'USD',
  };
};

export const fetchForexRates = async (apiKey: string) => {
  const res = await fetch(`${BASE_URL}/forex/rates?base=USD&token=${apiKey}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.quote || {};
};
