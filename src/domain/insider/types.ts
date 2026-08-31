// 내부자 거래 (SEC Form 4) — cash-bite-backend `/insider/*` 응답 타입

export type InsiderCode = 'P' | 'S';

/** 거래 1건. */
export interface InsiderTrade {
  transactionDate: string; // YYYY-MM-DD
  filingDate: string;
  issuerName: string;
  ticker?: string;
  ownerName: string;
  ownerTitle?: string;
  role: string; // 'CEO' · '이사' · '10%주주' 등 백엔드가 합쳐 준 표기
  code: InsiderCode;
  shares: number;
  value?: number; // USD
}

/** 종목 하나에 대한 최근 내부자 거래. */
export interface InsiderSymbolSummary {
  symbol: string;
  buyCount: number;
  sellCount: number;
  buyValue: number;
  trades: InsiderTrade[]; // 최신순
}

/** 최근 장내 매수 상위 한 줄. */
export interface InsiderBuyRow {
  ticker: string;
  issuerName: string;
  buyerCount: number;
  totalValue: number;
  latestDate: string;
  owners: string[];
}

export interface InsiderBuysResult {
  from: string;
  to: string;
  totalBuys: number;
  rows: InsiderBuyRow[];
}
