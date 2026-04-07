
export type Language = 'ko' | 'en' | 'ja';

export interface TranslationSchema {
  common: {
    title: string;
    subtitle: string;
    currency: string;
    exchangeRate: string;
    footerInfo: string;
  };
  portfolio: {
    totalValue: string;
    annualDividend: string;
    annualDividendUSD: string;
    annualDividendKRW: string;
    monthlyDividend: string;
    monthlyDividendUSD: string;
    monthlyDividendKRW: string;
    averageYield: string;
    taxInfo: string;
    avgPerMonth: string;
    inputTitle: string;
    stockName: string;
    ticker: string;
    quantity: string;
    purchasePrice: string;
    currentPrice: string;
    dividendPerShare: string;
    addStock: string;
    stockList: string;
    noStocks: string;
    actions: string;
    delete: string;
  };
}
