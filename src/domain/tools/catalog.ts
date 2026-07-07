import {
  averaging,
  compound,
  dividend,
  fmtNumber,
  overseasTax,
  positionSize,
  recoveryPct,
  rule72,
  sipMonthly,
  splitBuy,
  stopTarget,
  targetPrice,
  tradeCost,
} from './calc';

// 투자 도구 카탈로그 — 12종. config 기반이라 라우트/UI 는 [slug] 동적 라우트 + Calculator 가 공통 처리.
// API 불필요한 순수 계산기만. 값·설명은 한국어(주린이 대상 콘텐츠).

export interface ToolInput {
  key: string;
  label: string;
  unit?: string;
  defaultValue: number;
  step?: number;
}

export interface ToolResult {
  label: string;
  value: string;
  unit?: string;
  /** 대표 결과 — 강조 표시. */
  emphasize?: boolean;
}

export interface ToolCalc {
  slug: string;
  category: string;
  title: string;
  /** 카드/메타 설명용 짧은 한 줄. */
  tagline: string;
  /** 페이지 본문 설명(SEO) — 개념 + 사용법. */
  description: string;
  /** 계산식 표기(선택). */
  formula?: string;
  inputs: ToolInput[];
  compute: (v: Record<string, number>) => ToolResult[];
}

export const TOOL_CATEGORIES = ['매매 계획', '세금·비용', '자산 배분', '배당'] as const;

export const TOOLS: ToolCalc[] = [
  // ─── 매매 계획 ───────────────────────────────────────────────────────────
  {
    slug: 'averaging',
    category: '매매 계획',
    title: '물타기·불타기 평단 계산기',
    tagline: '추가 매수 후 새 평균 단가를 계산합니다.',
    description:
      '보유 중인 종목을 추가로 매수(물타기·불타기)할 때 바뀌는 평균 매수 단가를 계산합니다. 현재 보유 수량과 평단가, 추가 매수 수량과 가격을 넣으면 새 평단가와 총 투자금이 나옵니다.',
    formula: '새 평단 = (기존수량×기존평단 + 추가수량×추가가) ÷ 총수량',
    inputs: [
      { key: 'holdingQty', label: '보유 수량', unit: '주', defaultValue: 10 },
      { key: 'avgPrice', label: '평균 매수가', unit: '원', defaultValue: 100000 },
      { key: 'addQty', label: '추가 매수 수량', unit: '주', defaultValue: 10 },
      { key: 'addPrice', label: '추가 매수가', unit: '원', defaultValue: 80000 },
    ],
    compute: (v) => {
      const r = averaging(v.holdingQty, v.avgPrice, v.addQty, v.addPrice);
      return [
        { label: '새 평균 단가', value: fmtNumber(r.newAvg, 0), unit: '원', emphasize: true },
        { label: '총 보유 수량', value: fmtNumber(r.totalQty, 0), unit: '주' },
        { label: '총 투자금', value: fmtNumber(r.totalInvestment, 0), unit: '원' },
      ];
    },
  },
  {
    slug: 'recovery',
    category: '매매 계획',
    title: '손실 복구율 계산기',
    tagline: '손실 후 본전까지 필요한 상승률을 계산합니다.',
    description:
      '주가가 하락했을 때 원금(본전)을 회복하려면 몇 % 올라야 하는지 계산합니다. 손실이 커질수록 필요한 상승률이 급격히 커집니다. 예를 들어 50% 손실은 회복에 100% 상승이 필요합니다.',
    formula: '필요 상승률 = 손실률 ÷ (100 − 손실률) × 100',
    inputs: [{ key: 'lossPct', label: '손실률', unit: '%', defaultValue: 20, step: 0.1 }],
    compute: (v) => [
      {
        label: '본전까지 필요한 상승률',
        value: fmtNumber(recoveryPct(v.lossPct), 2),
        unit: '%',
        emphasize: true,
      },
    ],
  },
  {
    slug: 'target-price',
    category: '매매 계획',
    title: '목표가 계산기',
    tagline: '매수가와 목표 수익률로 목표가를 계산합니다.',
    description:
      '매수한 가격에서 원하는 수익률에 도달하는 목표 가격을 계산합니다. 매도 목표를 미리 정해두면 감정적 매매를 줄일 수 있습니다.',
    formula: '목표가 = 매수가 × (1 + 목표 수익률 ÷ 100)',
    inputs: [
      { key: 'buy', label: '매수가', unit: '원', defaultValue: 100000 },
      { key: 'targetPct', label: '목표 수익률', unit: '%', defaultValue: 20, step: 0.1 },
    ],
    compute: (v) => [
      { label: '목표가', value: fmtNumber(targetPrice(v.buy, v.targetPct), 0), unit: '원', emphasize: true },
    ],
  },
  {
    slug: 'stop-target',
    category: '매매 계획',
    title: '손절·익절 계산기 (손익비)',
    tagline: '손절가·익절가와 손익비를 계산합니다.',
    description:
      '매수가 기준으로 손절 폭과 익절 폭을 정하면 손절가·익절가와 손익비(리스크 대비 기대수익 비율)를 계산합니다. 손익비가 1보다 크면 잃는 것보다 얻는 것이 큰 매매 계획입니다.',
    formula: '손익비 = 익절 폭 ÷ 손절 폭',
    inputs: [
      { key: 'buy', label: '매수가', unit: '원', defaultValue: 100000 },
      { key: 'stopPct', label: '손절 폭', unit: '%', defaultValue: 5, step: 0.1 },
      { key: 'takePct', label: '익절 폭', unit: '%', defaultValue: 15, step: 0.1 },
    ],
    compute: (v) => {
      const r = stopTarget(v.buy, v.stopPct, v.takePct);
      return [
        { label: '손절가', value: fmtNumber(r.stopPrice, 0), unit: '원' },
        { label: '익절가', value: fmtNumber(r.takePrice, 0), unit: '원' },
        { label: '손익비', value: fmtNumber(r.riskReward, 2), unit: '배', emphasize: true },
      ];
    },
  },
  {
    slug: 'split-buy',
    category: '매매 계획',
    title: '분할매수 평단 계산기',
    tagline: '3회 분할매수의 평균 단가를 계산합니다.',
    description:
      '가격을 나눠 여러 번 매수(분할매수)할 때의 총 수량·총 투자금·평균 단가를 계산합니다. 최대 3회 매수 가격과 수량을 넣으면 됩니다. 매수하지 않은 회차는 수량을 0으로 두세요.',
    inputs: [
      { key: 'p1', label: '1차 매수가', unit: '원', defaultValue: 100000 },
      { key: 'q1', label: '1차 수량', unit: '주', defaultValue: 10 },
      { key: 'p2', label: '2차 매수가', unit: '원', defaultValue: 90000 },
      { key: 'q2', label: '2차 수량', unit: '주', defaultValue: 10 },
      { key: 'p3', label: '3차 매수가', unit: '원', defaultValue: 80000 },
      { key: 'q3', label: '3차 수량', unit: '주', defaultValue: 10 },
    ],
    compute: (v) => {
      const r = splitBuy([
        { price: v.p1, qty: v.q1 },
        { price: v.p2, qty: v.q2 },
        { price: v.p3, qty: v.q3 },
      ]);
      return [
        { label: '평균 단가', value: fmtNumber(r.avgPrice, 0), unit: '원', emphasize: true },
        { label: '총 수량', value: fmtNumber(r.totalQty, 0), unit: '주' },
        { label: '총 투자금', value: fmtNumber(r.totalAmount, 0), unit: '원' },
      ];
    },
  },
  {
    slug: 'position-size',
    category: '매매 계획',
    title: '포지션 사이징 계산기',
    tagline: '감수 리스크에 맞는 매수 금액을 계산합니다.',
    description:
      '한 번의 매매에서 계좌의 몇 %까지 잃을지(감수 리스크)와 손절 폭을 정하면, 그 리스크에 맞는 적정 매수 금액을 계산합니다. 계좌를 지키는 리스크 관리의 기본입니다.',
    formula: '매수금액 = (계좌 × 리스크%) ÷ 손절폭%',
    inputs: [
      { key: 'account', label: '계좌 자금', unit: '원', defaultValue: 10000000 },
      { key: 'riskPct', label: '감수 리스크', unit: '%', defaultValue: 2, step: 0.1 },
      { key: 'stopPct', label: '손절 폭', unit: '%', defaultValue: 8, step: 0.1 },
    ],
    compute: (v) => {
      const r = positionSize(v.account, v.riskPct, v.stopPct);
      return [
        { label: '적정 매수 금액', value: fmtNumber(r.positionAmount, 0), unit: '원', emphasize: true },
        { label: '최대 손실액', value: fmtNumber(r.maxLoss, 0), unit: '원' },
      ];
    },
  },
  // ─── 세금·비용 ───────────────────────────────────────────────────────────
  {
    slug: 'overseas-tax',
    category: '세금·비용',
    title: '해외주식 양도세 계산기',
    tagline: '해외주식 양도소득세(22%)를 계산합니다.',
    description:
      '해외주식(미국주식 등) 매매로 실현한 연간 손익에 대한 양도소득세를 계산합니다. 연 250만원 기본공제 후 초과분에 22%(지방세 포함)가 부과됩니다. 실현 손익 합계를 입력하세요.',
    formula: '세금 = max(0, 실현손익 − 250만원) × 22%',
    inputs: [{ key: 'annualProfit', label: '연간 실현 손익', unit: '원', defaultValue: 5000000 }],
    compute: (v) => {
      const r = overseasTax(v.annualProfit);
      return [
        { label: '양도소득세', value: fmtNumber(r.tax, 0), unit: '원', emphasize: true },
        { label: '과세 대상 금액', value: fmtNumber(r.taxable, 0), unit: '원' },
        { label: '세후 실수령', value: fmtNumber(r.netProfit, 0), unit: '원' },
      ];
    },
  },
  {
    slug: 'trade-cost',
    category: '세금·비용',
    title: '거래비용·손익분기 계산기',
    tagline: '수수료·세금 포함 손익분기가를 계산합니다.',
    description:
      '매수·매도 수수료와 매도 거래세를 포함해 실제로 본전이 되는 손익분기 가격을 계산합니다. 국내 주식 거래세는 약 0.18%, 증권사 수수료는 상품마다 다릅니다(예: 0.015%).',
    formula: '손익분기가 = (매수금액 + 왕복비용) ÷ 수량',
    inputs: [
      { key: 'price', label: '주가', unit: '원', defaultValue: 100000 },
      { key: 'qty', label: '수량', unit: '주', defaultValue: 10 },
      { key: 'feePct', label: '수수료율', unit: '%', defaultValue: 0.015, step: 0.001 },
      { key: 'taxPct', label: '거래세율', unit: '%', defaultValue: 0.18, step: 0.01 },
    ],
    compute: (v) => {
      const r = tradeCost(v.price, v.qty, v.feePct, v.taxPct);
      return [
        { label: '손익분기가', value: fmtNumber(r.breakEvenPrice, 0), unit: '원', emphasize: true },
        { label: '왕복 비용', value: fmtNumber(r.roundTripCost, 0), unit: '원' },
        { label: '매수 금액', value: fmtNumber(r.buyAmount, 0), unit: '원' },
      ];
    },
  },
  // ─── 자산 배분 ───────────────────────────────────────────────────────────
  {
    slug: 'compound',
    category: '자산 배분',
    title: '복리 계산기',
    tagline: '초기 투자금 + 월 적립의 복리 성장을 계산합니다.',
    description:
      '초기 투자금과 매월 적립하는 금액이 연 수익률로 복리 성장했을 때의 최종 금액을 계산합니다. 복리는 시간이 길수록 눈덩이처럼 커집니다.',
    inputs: [
      { key: 'initial', label: '초기 투자금', unit: '원', defaultValue: 10000000 },
      { key: 'monthly', label: '월 적립금', unit: '원', defaultValue: 500000 },
      { key: 'annualRatePct', label: '연 수익률', unit: '%', defaultValue: 7, step: 0.1 },
      { key: 'years', label: '투자 기간', unit: '년', defaultValue: 10 },
    ],
    compute: (v) => {
      const r = compound(v.initial, v.monthly, v.annualRatePct, v.years);
      const gainPct = r.totalContributed > 0 ? (r.totalGain / r.totalContributed) * 100 : 0;
      return [
        { label: '최종 금액', value: fmtNumber(r.finalAmount, 0), unit: '원', emphasize: true },
        { label: '총 납입금', value: fmtNumber(r.totalContributed, 0), unit: '원' },
        { label: '총 수익', value: fmtNumber(r.totalGain, 0), unit: '원' },
        { label: '수익률', value: fmtNumber(gainPct, 1), unit: '%' },
      ];
    },
  },
  {
    slug: 'sip',
    category: '자산 배분',
    title: '적립식 목표 계산기',
    tagline: '목표 금액 달성에 필요한 월 적립금을 계산합니다.',
    description:
      '원하는 목표 금액을 정해진 기간 안에 모으려면 매월 얼마를 적립해야 하는지 계산합니다. 연 수익률을 반영한 적립식(월복리) 기준입니다.',
    inputs: [
      { key: 'targetAmount', label: '목표 금액', unit: '원', defaultValue: 100000000 },
      { key: 'years', label: '기간', unit: '년', defaultValue: 10 },
      { key: 'annualRatePct', label: '연 수익률', unit: '%', defaultValue: 7, step: 0.1 },
    ],
    compute: (v) => [
      {
        label: '필요 월 적립금',
        value: fmtNumber(sipMonthly(v.targetAmount, v.years, v.annualRatePct), 0),
        unit: '원',
        emphasize: true,
      },
    ],
  },
  {
    slug: 'rule72',
    category: '자산 배분',
    title: '72법칙 계산기',
    tagline: '자산이 2배 되는 데 걸리는 기간을 계산합니다.',
    description:
      '72를 연 수익률로 나누면 자산이 2배가 되는 데 걸리는 대략적인 기간(년)이 나옵니다. 복리의 위력을 직관적으로 보여주는 간단한 법칙입니다.',
    formula: '2배 기간(년) ≈ 72 ÷ 연 수익률',
    inputs: [{ key: 'annualRatePct', label: '연 수익률', unit: '%', defaultValue: 8, step: 0.1 }],
    compute: (v) => [
      { label: '2배 소요 기간', value: fmtNumber(rule72(v.annualRatePct), 1), unit: '년', emphasize: true },
    ],
  },
  // ─── 배당 ───────────────────────────────────────────────────────────────
  {
    slug: 'dividend',
    category: '배당',
    title: '배당금 계산기',
    tagline: '세전·세후 배당금과 배당수익률을 계산합니다.',
    description:
      '보유 수량과 주당 배당금으로 받게 될 배당금을 계산합니다. 배당소득세 15.4%(지방세 포함)를 반영한 세후 금액과 현재 주가 기준 배당수익률도 함께 보여줍니다.',
    formula: '세후 배당 = 세전 배당 × (1 − 15.4%)',
    inputs: [
      { key: 'qty', label: '보유 수량', unit: '주', defaultValue: 100 },
      { key: 'price', label: '현재 주가', unit: '원', defaultValue: 100000 },
      { key: 'dps', label: '주당 배당금', unit: '원', defaultValue: 3000 },
    ],
    compute: (v) => {
      const r = dividend(v.qty, v.price, v.dps);
      return [
        { label: '세후 배당금', value: fmtNumber(r.net, 0), unit: '원', emphasize: true },
        { label: '세전 배당금', value: fmtNumber(r.gross, 0), unit: '원' },
        { label: '배당수익률', value: fmtNumber(r.yieldPct, 2), unit: '%' },
      ];
    },
  },
];

export function getTool(slug: string): ToolCalc | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
