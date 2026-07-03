import type { EvalPosition } from './types';

/** 포트폴리오 밸런스(비중/집중도/시장분포) — 프론트 계산(지표 렌즈, LLM 아님). 백엔드 computeBalance 와 동일 규칙. */
export interface PortfolioBalance {
  holdingCount: number;
  unified: boolean; // 단일 통화이거나 환율 확보 → 통합 비중 계산됨
  totalValueKrw: number | null;
  weights: { ticker: string; name: string; weight: number }[]; // % 내림차순 (unified 일 때만)
  top1: number;
  top3: number;
  marketSplit: { kr: number; us: number } | null;
}

const r1 = (n: number): number => Math.round(n * 10) / 10;

/** 종목 평가액을 KRW 로 환산. KRW/USD 만 지원. 그 외/환율없음 → null. */
const toKrw = (value: number, currency: string, usdKrw: number | null): number | null => {
  const c = currency.toUpperCase();
  if (c === 'KRW') {
    return value;
  }
  if (c === 'USD') {
    return usdKrw != null ? value * usdKrw : null;
  }
  return null;
};

export const computeBalance = (
  positions: EvalPosition[],
  usdKrw: number | null,
): PortfolioBalance => {
  const holdingCount = positions.length;
  const valued = positions.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    currency: p.currency.toUpperCase(),
    krw: toKrw(p.quantity * p.currentPrice, p.currency, usdKrw),
  }));

  const unified = valued.every((v) => v.krw != null);
  if (!unified) {
    return {
      holdingCount,
      unified: false,
      totalValueKrw: null,
      weights: [],
      top1: 0,
      top3: 0,
      marketSplit: null,
    };
  }

  const total = valued.reduce((s, v) => s + (v.krw as number), 0);
  const weights = valued
    .map((v) => ({
      ticker: v.ticker,
      name: v.name,
      weight: total > 0 ? r1(((v.krw as number) / total) * 100) : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  const top1 = weights[0]?.weight ?? 0;
  const top3 = r1(weights.slice(0, 3).reduce((s, w) => s + w.weight, 0));

  const krTotal = valued
    .filter((v) => v.currency === 'KRW')
    .reduce((s, v) => s + (v.krw as number), 0);
  const marketSplit =
    total > 0 ? { kr: r1((krTotal / total) * 100), us: r1(((total - krTotal) / total) * 100) } : null;

  return {
    holdingCount,
    unified: true,
    totalValueKrw: Math.round(total),
    weights,
    top1,
    top3,
    marketSplit,
  };
};
