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
  name: string;
  currency: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

/** 종목별 거장 코멘트 + 거장 13F 겹침 여부. */
export interface HoldingReview {
  ticker: string;
  note: string;
  overlap: { held: boolean; reportDate?: string };
}

/** 평가 API 응답 (구조화). */
export interface PortfolioEvaluation {
  key: string;
  displayName: string;
  /** 포트폴리오 전체 총평. */
  verdict: string;
  /** 스스로 점검할 질문. */
  checkpoints: string[];
  /** 종목별 코멘트 + 13F 겹침. */
  holdings: HoldingReview[];
  usedHoldings: boolean;
  reportDate?: string;
  disclaimer: string;
}

/** 브라우저에 저장하는 평가 기록 한 건. */
export interface StoredEvaluation {
  id: string;
  key: string;
  displayName: string;
  verdict: string;
  checkpoints: string[];
  holdings: HoldingReview[];
  usedHoldings: boolean;
  reportDate?: string;
  tickers: string[];
  at: number; // epoch ms
}
