/** 거장 AI 페르소나 — picker 요약. */
export interface PersonaSummary {
  key: string;
  displayName: string;
  firm: string;
  tagline: string;
}

/** 내 포트폴리오 한 종목 (프론트 입력 행). 브라우저에 영속. */
export interface EvalPosition {
  id: string;
  ticker: string;
  name: string;
  currency: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

/** 평가 API 요청 종목. */
export interface EvalHolding {
  ticker: string;
  currency: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

/** 평가 API 응답. */
export interface PortfolioEvaluation {
  key: string;
  displayName: string;
  evaluation: string;
  disclaimer: string;
  usedHoldings: boolean;
  reportDate?: string;
}

/** 브라우저에 저장하는 평가 기록 한 건. */
export interface StoredEvaluation {
  id: string;
  key: string;
  displayName: string;
  evaluation: string;
  usedHoldings: boolean;
  reportDate?: string;
  tickers: string[];
  at: number; // epoch ms
}
