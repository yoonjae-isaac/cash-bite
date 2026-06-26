// 주요 지수 시세 — cash-bite-backend `GET /market/indices` 응답 타입 (libs/market IndexQuote)
export interface IndexQuote {
  symbol: string; // Yahoo 심볼 (^IXIC 등)
  name: string; // 정식명 (NASDAQ Composite 등)
  price: number;
  change: number; // 전일 대비 절대 변동
  changePercent: number; // 전일 대비 % 변동
  currency: string;
}

// ── 종목 재무제표 — `GET /market/financials` 응답 (libs/market FinancialsResult) ──

/** 재무제표 집계 기준 — 연간 / 분기. */
export type StatementPeriod = 'annual' | 'quarterly';

/** 손익계산서 한 기간 (단위: 보고 통화). */
export interface IncomeRow {
  date: string; // YYYY-MM-DD (기간 종료일)
  revenue?: number; // 매출
  operatingIncome?: number; // 영업이익
  netIncome?: number; // 당기순이익
}

/** 재무상태표 한 시점. */
export interface BalanceRow {
  date: string;
  totalAssets?: number; // 자산총계
  totalLiabilities?: number; // 부채총계
  equity?: number; // 자본총계
}

/** 현금흐름표 한 기간. */
export interface CashflowRow {
  date: string;
  operating?: number; // 영업활동 현금흐름
  investing?: number; // 투자활동 현금흐름
  financing?: number; // 재무활동 현금흐름
  freeCashFlow?: number; // 잉여현금흐름
}

/** 밸류에이션 지표 — 기간과 무관하게 항상 연간/현재가 기준. */
export interface Valuation {
  per?: number; // 주가수익비율
  forwardPer?: number; // 선행 PER
  pbr?: number; // 주가순자산비율
  bps?: number; // 주당순자산
  eps?: number; // 주당순이익
  psr?: number; // 주가매출비율
  peg?: number; // PER/성장률
  dividendYield?: number; // 배당수익률 (0~1)
  marketCap?: number; // 시가총액
  price?: number; // 현재가
  derived: boolean; // Yahoo 미제공 지표를 재무제표+현재가로 파생했는지 (KR 등)
}

export interface Financials {
  ticker: string;
  period: StatementPeriod; // 손익·현금흐름 표의 집계 기준
  currency: string; // 보고 통화 (USD / KRW 등)
  valuation: Valuation;
  income: IncomeRow[]; // 최신순
  balance: BalanceRow[];
  cashflow: CashflowRow[];
}
