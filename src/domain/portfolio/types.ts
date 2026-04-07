
export interface StockItem {
  id: string; // uuid
  ticker: string; // ex: 'O', 'AAPL'
  shares: number; // 보유 주식 수
  currentPrice: number; // [NEW] 현재 주가
  dividendPerShare: number; // 1주당 배당금
  dividendYield: number; // 배당률
  exDividendDate: string; // 배당락일 (Finnhub 무료 API에서는 빈 값 처리 가능)
  name: string; // 종목명
}
