// ARK ETF 일별 매매 — cash-bite-backend `/ark/*` 응답 타입

export type ArkDirection = 'buy' | 'sell';

/** 여러 펀드가 같은 종목을 매매한 것을 합친 한 줄. */
export interface ArkTradeRow {
  ticker?: string; // 현금성 자산·워런트는 티커가 없다
  company: string;
  cusip: string;
  direction: ArkDirection;
  sharesDelta: number; // 펀드 합산, 매도는 음수
  funds: string[]; // 이 종목을 매매한 ARK 펀드
  isNew: boolean; // 신규 편입
  isExit: boolean; // 전량 매도
}

/** 하루치 매매 (펀드 통합). */
export interface ArkDailyTrades {
  tradeDate: string; // YYYY-MM-DD
  funds: string[];
  buyCount: number;
  sellCount: number;
  trades: ArkTradeRow[]; // 매매 규모 내림차순
}

/** 펀드별 최신 반영 상태. */
export interface ArkFundStatus {
  fund: string;
  tradeDate: string;
  totalValue: number;
  positionCount: number;
  isStale: boolean; // ARK 가 해당 펀드 CSV 갱신을 멈춘 경우
}

/** 주식 수 증감 표기 — 1,234주 / 1.2만주 규모로 압축. */
export function formatShareDelta(delta: number): string {
  const abs = Math.abs(delta);
  if (abs >= 1_000_000) {
    return `${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${Math.round(abs / 1_000).toLocaleString()}K`;
  }
  return abs.toLocaleString();
}
