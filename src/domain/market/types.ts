// 주요 지수 시세 — cash-bite-backend `GET /market/indices` 응답 타입 (libs/market IndexQuote)
export interface IndexQuote {
  symbol: string; // Yahoo 심볼 (^IXIC 등)
  name: string; // 정식명 (NASDAQ Composite 등)
  price: number;
  change: number; // 전일 대비 절대 변동
  changePercent: number; // 전일 대비 % 변동
  currency: string;
}
