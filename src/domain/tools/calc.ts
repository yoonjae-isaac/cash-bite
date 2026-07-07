// 투자 도구 계산 — 순수 함수(프레임워크 무관, API 불필요). UI 는 catalog + Calculator 가 담당.

// ─── 상수 ──────────────────────────────────────────────────────────────────
/** 해외주식 양도소득세율 (22%, 지방세 포함). */
export const OVERSEAS_TAX_RATE = 0.22;
/** 해외주식 양도소득 기본공제 (연 250만원). */
export const OVERSEAS_TAX_DEDUCTION = 2_500_000;
/** 배당소득세율 (15.4%, 지방세 포함). */
export const DIVIDEND_TAX_RATE = 0.154;

// ─── 포맷 ──────────────────────────────────────────────────────────────────
/** 천단위 콤마 + 소수 자리수 고정. 유한수 아니면 '-'. */
export function fmtNumber(n: number, digits = 0): string {
  if (!Number.isFinite(n)) {
    return '-';
  }
  return n.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// ─── 손실 복구율 ──────────────────────────────────────────────────────────
/** 손실률(%)에서 본전까지 필요한 상승률(%). 0<loss<100 범위 밖은 0. */
export function recoveryPct(lossPct: number): number {
  if (lossPct <= 0 || lossPct >= 100) {
    return 0;
  }
  return (lossPct / (100 - lossPct)) * 100;
}

// ─── 목표가 ────────────────────────────────────────────────────────────────
/** 매수가에서 목표 수익률(%) 도달 가격. */
export function targetPrice(buy: number, targetPct: number): number {
  return buy * (1 + targetPct / 100);
}

// ─── 손절·익절 + 손익비 ─────────────────────────────────────────────────────
export interface StopTargetResult {
  stopPrice: number;
  takePrice: number;
  riskReward: number;
}
export function stopTarget(buy: number, stopPct: number, takePct: number): StopTargetResult {
  return {
    stopPrice: buy * (1 - stopPct / 100),
    takePrice: buy * (1 + takePct / 100),
    riskReward: stopPct > 0 ? takePct / stopPct : 0,
  };
}

// ─── 분할매수 평단 ──────────────────────────────────────────────────────────
export interface SplitLeg {
  price: number;
  qty: number;
}
export interface SplitBuyResult {
  totalQty: number;
  totalAmount: number;
  avgPrice: number;
}
export function splitBuy(legs: SplitLeg[]): SplitBuyResult {
  let totalQty = 0;
  let totalAmount = 0;
  for (const leg of legs) {
    totalQty += leg.qty;
    totalAmount += leg.price * leg.qty;
  }
  return {
    totalQty,
    totalAmount,
    avgPrice: totalQty > 0 ? totalAmount / totalQty : 0,
  };
}

// ─── 물타기·불타기 (추가 매수 후 평단) ──────────────────────────────────────
export interface AveragingResult {
  newAvg: number;
  totalQty: number;
  totalInvestment: number;
}
export function averaging(
  holdingQty: number,
  avgPrice: number,
  addQty: number,
  addPrice: number,
): AveragingResult {
  const totalQty = holdingQty + addQty;
  const totalInvestment = holdingQty * avgPrice + addQty * addPrice;
  return {
    newAvg: totalQty > 0 ? totalInvestment / totalQty : 0,
    totalQty,
    totalInvestment,
  };
}

// ─── 복리 (초기 + 월적립, 월복리) ───────────────────────────────────────────
export interface CompoundResult {
  finalAmount: number;
  totalContributed: number;
  totalGain: number;
}
export function compound(
  initial: number,
  monthly: number,
  annualRatePct: number,
  years: number,
): CompoundResult {
  const n = Math.round(years * 12);
  const r = annualRatePct / 12 / 100;
  let balance = initial;
  for (let i = 0; i < n; i++) {
    balance = balance * (1 + r) + monthly;
  }
  const totalContributed = initial + monthly * n;
  return {
    finalAmount: balance,
    totalContributed,
    totalGain: balance - totalContributed,
  };
}

// ─── 포지션 사이징 ──────────────────────────────────────────────────────────
export interface PositionSizeResult {
  maxLoss: number;
  positionAmount: number;
}
export function positionSize(
  account: number,
  riskPct: number,
  stopPct: number,
): PositionSizeResult {
  const maxLoss = account * (riskPct / 100);
  return {
    maxLoss,
    positionAmount: stopPct > 0 ? maxLoss / (stopPct / 100) : 0,
  };
}

// ─── 해외주식 양도세 ────────────────────────────────────────────────────────
export interface OverseasTaxResult {
  taxable: number;
  tax: number;
  netProfit: number;
}
export function overseasTax(annualProfit: number): OverseasTaxResult {
  const taxable = Math.max(0, annualProfit - OVERSEAS_TAX_DEDUCTION);
  const tax = taxable * OVERSEAS_TAX_RATE;
  return {
    taxable,
    tax,
    netProfit: annualProfit - tax,
  };
}

// ─── 거래비용 · 손익분기 ────────────────────────────────────────────────────
export interface TradeCostResult {
  buyAmount: number;
  roundTripCost: number;
  breakEvenPrice: number;
}
export function tradeCost(
  price: number,
  qty: number,
  feePct: number,
  taxPct: number,
): TradeCostResult {
  const buyAmount = price * qty;
  const buyFee = buyAmount * (feePct / 100);
  const sellFee = buyAmount * (feePct / 100);
  const sellTax = buyAmount * (taxPct / 100);
  const roundTripCost = buyFee + sellFee + sellTax;
  return {
    buyAmount,
    roundTripCost,
    breakEvenPrice: qty > 0 ? (buyAmount + roundTripCost) / qty : 0,
  };
}

// ─── 적립식 목표 (목표 금액 → 필요 월적립) ──────────────────────────────────
export function sipMonthly(targetAmount: number, years: number, annualRatePct: number): number {
  const n = Math.round(years * 12);
  if (n <= 0) {
    return 0;
  }
  const r = annualRatePct / 12 / 100;
  if (r === 0) {
    return targetAmount / n;
  }
  return (targetAmount * r) / (Math.pow(1 + r, n) - 1);
}

// ─── 72법칙 (자산 2배 소요 기간) ────────────────────────────────────────────
export function rule72(annualRatePct: number): number {
  return annualRatePct > 0 ? 72 / annualRatePct : 0;
}

// ─── 배당 ──────────────────────────────────────────────────────────────────
export interface DividendResult {
  gross: number;
  net: number;
  yieldPct: number;
}
export function dividend(qty: number, price: number, dps: number): DividendResult {
  const gross = qty * dps;
  return {
    gross,
    net: gross * (1 - DIVIDEND_TAX_RATE),
    yieldPct: price > 0 ? (dps / price) * 100 : 0,
  };
}
