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
import type { Language } from '../i18n/types';

// 투자 도구 카탈로그 — 12종. config 기반이라 [slug] 동적 라우트 + 제네릭 Calculator 가 공통 처리.
// i18n: tools 콘텐츠는 방대해 TranslationSchema 를 오염시키지 않도록 여기서 인라인 Loc{ko,en,ja} 로 자립 처리.
// (메타데이터는 서버/SEO 상 ko 기준, 클라이언트 렌더는 사용자 언어)

export type Loc = { ko: string; en: string; ja: string };
export const L = (ko: string, en: string, ja: string): Loc => ({ ko, en, ja });
export const pick = (loc: Loc, lang: Language): string => loc[lang];

export type ToolCategory = 'trade' | 'tax' | 'asset' | 'dividend';
export const CATEGORY_ORDER: ToolCategory[] = ['trade', 'tax', 'asset', 'dividend'];
export const CATEGORY_LABEL: Record<ToolCategory, Loc> = {
  trade: L('매매 계획', 'Trading Plan', '売買プラン'),
  tax: L('세금·비용', 'Tax & Fees', '税金・手数料'),
  asset: L('자산 배분', 'Asset Growth', '資産形成'),
  dividend: L('배당', 'Dividends', '配当'),
};

// 도구 섹션 공통 UI 문구
export const TOOLS_UI = {
  navLabel: L('투자 도구', 'Tools', '投資ツール'),
  hubTitle: L('투자 도구', 'Investment Tools', '投資ツール'),
  hubSubtitle: L(
    'API 없이 바로 쓰는 투자 계산기 모음. 매매 계획·세금·자산 배분·배당 계산을 도와줍니다.',
    'Free investment calculators — plan trades, taxes, growth, and dividends. No sign-up.',
    '売買・税金・資産形成・配当を計算する無料の投資ツール。',
  ),
  back: L('투자 도구', 'Tools', '投資ツール'),
  formula: L('계산식', 'Formula', '計算式'),
  disclaimer: L(
    '본 계산기는 참고용이며 세금·수수료 등 실제 값은 증권사·상품·개인 상황에 따라 다를 수 있습니다.',
    'For reference only. Actual taxes, fees, and figures vary by broker, product, and situation.',
    '本計算機は参考用です。税金・手数料などの実際の値は証券会社・商品・状況により異なります。',
  ),
};

// 단위
const U = {
  shares: L('주', 'shares', '株'),
  pct: L('%', '%', '%'),
  years: L('년', 'yr', '年'),
  times: L('배', 'x', '倍'),
};

export interface ToolInput {
  key: string;
  label: Loc;
  unit?: Loc | 'currency';
  defaultValue: number;
  step?: number;
  /** 지정 시 슬라이더 노출(주로 %). */
  slider?: { min: number; max: number };
}

export interface ToolResult {
  label: Loc;
  value: string;
  unit?: Loc | 'currency';
  /** 대표 결과 — 히어로로 크게 표시. */
  emphasize?: boolean;
}

export type VizTone = 'base' | 'point' | 'positive' | 'negative';

export type Viz =
  | { type: 'stack'; caption?: Loc; segments: { label: Loc; amount: number; tone: VizTone }[] }
  | {
      type: 'ladder';
      stopPct: number;
      takePct: number;
      stopPrice: string;
      buyPrice: string;
      takePrice: string;
    };

export interface ComputeOutput {
  results: ToolResult[];
  viz?: Viz;
}

export interface ToolCalc {
  slug: string;
  category: ToolCategory;
  title: Loc;
  tagline: Loc;
  description: Loc;
  formula?: Loc;
  inputs: ToolInput[];
  compute: (v: Record<string, number>) => ComputeOutput;
}

export const TOOLS: ToolCalc[] = [
  // ─── 매매 계획 ───────────────────────────────────────────────────────────
  {
    slug: 'averaging',
    category: 'trade',
    title: L('물타기·불타기 평단 계산기', 'Averaging Down/Up Calculator', 'ナンピン・買い増し計算機'),
    tagline: L('추가 매수 후 새 평균 단가를 계산합니다.', 'Your new average price after buying more.', '買い増し後の新しい平均単価を計算。'),
    description: L(
      '보유 중인 종목을 추가로 매수(물타기·불타기)할 때 바뀌는 평균 매수 단가를 계산합니다. 보유 수량과 평단가, 추가 매수 수량과 가격을 넣으면 새 평단가와 총 투자금이 나옵니다.',
      'Calculate how your average cost changes when you buy more shares (averaging down or up). Enter your holdings and the added purchase to get the new average and total invested.',
      '保有銘柄を買い増しした際に変わる平均取得単価を計算します。保有数・平均単価と追加購入を入力すると、新しい平均単価と総投資額が出ます。',
    ),
    formula: L('새 평단 = (기존수량×기존평단 + 추가수량×추가가) ÷ 총수량', 'New avg = (oldQty×oldAvg + addQty×addPrice) ÷ totalQty', '新平均 = (既存数量×既存平均 + 追加数量×追加価格) ÷ 総数量'),
    inputs: [
      { key: 'holdingQty', label: L('보유 수량', 'Shares held', '保有数量'), unit: U.shares, defaultValue: 10 },
      { key: 'avgPrice', label: L('평균 매수가', 'Avg buy price', '平均取得単価'), unit: 'currency', defaultValue: 100000 },
      { key: 'addQty', label: L('추가 매수 수량', 'Shares to add', '追加購入数量'), unit: U.shares, defaultValue: 10 },
      { key: 'addPrice', label: L('추가 매수가', 'Add price', '追加購入価格'), unit: 'currency', defaultValue: 80000 },
    ],
    compute: (v) => {
      const r = averaging(v.holdingQty, v.avgPrice, v.addQty, v.addPrice);
      const base = v.holdingQty * v.avgPrice;
      const add = v.addQty * v.addPrice;
      return {
        results: [
          { label: L('새 평균 단가', 'New average price', '新しい平均単価'), value: fmtNumber(r.newAvg, 0), unit: 'currency', emphasize: true },
          { label: L('총 보유 수량', 'Total shares', '総保有数量'), value: fmtNumber(r.totalQty, 0), unit: U.shares },
          { label: L('총 투자금', 'Total invested', '総投資額'), value: fmtNumber(r.totalInvestment, 0), unit: 'currency' },
        ],
        viz: {
          type: 'stack',
          caption: L('투자금 구성', 'Cost composition', '投資額の構成'),
          segments: [
            { label: L('기존', 'Existing', '既存'), amount: base, tone: 'base' },
            { label: L('추가', 'Added', '追加'), amount: add, tone: 'point' },
          ],
        },
      };
    },
  },
  {
    slug: 'recovery',
    category: 'trade',
    title: L('손실 복구율 계산기', 'Loss Recovery Calculator', '損失回復率計算機'),
    tagline: L('손실 후 본전까지 필요한 상승률을 계산합니다.', 'The gain needed to break even after a loss.', '損失後、元本回復に必要な上昇率を計算。'),
    description: L(
      '주가가 하락했을 때 원금(본전)을 회복하려면 몇 % 올라야 하는지 계산합니다. 손실이 커질수록 필요한 상승률이 급격히 커집니다 — 예: 50% 손실은 회복에 100% 상승이 필요합니다.',
      'Calculate the percentage gain needed to recover to break-even after a drop. The bigger the loss, the steeper the required gain — a 50% loss needs a 100% gain to recover.',
      '株価が下落した際、元本を回復するのに何%上昇が必要かを計算します。損失が大きいほど必要な上昇率は急増します（例：50%の損失は回復に100%の上昇が必要）。',
    ),
    formula: L('필요 상승률 = 손실률 ÷ (100 − 손실률) × 100', 'Gain% = loss% ÷ (100 − loss%) × 100', '必要上昇率 = 損失率 ÷ (100 − 損失率) × 100'),
    inputs: [{ key: 'lossPct', label: L('손실률', 'Loss', '損失率'), unit: U.pct, defaultValue: 20, step: 0.1, slider: { min: 0, max: 95 } }],
    compute: (v) => ({
      results: [{ label: L('본전까지 필요한 상승률', 'Gain needed to break even', '元本回復に必要な上昇率'), value: fmtNumber(recoveryPct(v.lossPct), 2), unit: U.pct, emphasize: true }],
    }),
  },
  {
    slug: 'target-price',
    category: 'trade',
    title: L('목표가 계산기', 'Target Price Calculator', '目標株価計算機'),
    tagline: L('매수가와 목표 수익률로 목표가를 계산합니다.', 'Target price from buy price and target return.', '取得価格と目標利回りから目標株価を計算。'),
    description: L(
      '매수한 가격에서 원하는 수익률에 도달하는 목표 가격을 계산합니다. 매도 목표를 미리 정해두면 감정적 매매를 줄일 수 있습니다.',
      'Calculate the price that reaches your target return from your buy price. Setting a sell target in advance helps reduce emotional trading.',
      '取得価格から目標利回りに達する目標価格を計算します。売却目標を事前に決めると感情的な売買を減らせます。',
    ),
    formula: L('목표가 = 매수가 × (1 + 목표 수익률 ÷ 100)', 'Target = buy × (1 + targetReturn ÷ 100)', '目標価格 = 取得価格 × (1 + 目標利回り ÷ 100)'),
    inputs: [
      { key: 'buy', label: L('매수가', 'Buy price', '取得価格'), unit: 'currency', defaultValue: 100000 },
      { key: 'targetPct', label: L('목표 수익률', 'Target return', '目標利回り'), unit: U.pct, defaultValue: 20, step: 0.1, slider: { min: 0, max: 100 } },
    ],
    compute: (v) => ({
      results: [{ label: L('목표가', 'Target price', '目標株価'), value: fmtNumber(targetPrice(v.buy, v.targetPct), 0), unit: 'currency', emphasize: true }],
    }),
  },
  {
    slug: 'stop-target',
    category: 'trade',
    title: L('손절·익절 계산기 (손익비)', 'Stop-Loss / Take-Profit (R:R)', '損切り・利確計算機（損益比）'),
    tagline: L('손절가·익절가와 손익비를 계산합니다.', 'Stop, target, and risk-reward ratio.', '損切り価格・利確価格と損益比を計算。'),
    description: L(
      '매수가 기준으로 손절 폭과 익절 폭을 정하면 손절가·익절가와 손익비(리스크 대비 기대수익 비율)를 계산합니다. 손익비가 1보다 크면 잃는 것보다 얻는 것이 큰 매매 계획입니다.',
      'Set stop and target percentages from your buy price to get the stop/target prices and risk-reward ratio. A ratio above 1 means potential reward outweighs the risk.',
      '取得価格を基準に損切り幅と利確幅を決めると、損切り・利確価格と損益比（リスク対期待リターン）を計算します。損益比が1を超えると得るものが失うものより大きい計画です。',
    ),
    formula: L('손익비 = 익절 폭 ÷ 손절 폭', 'R:R = take% ÷ stop%', '損益比 = 利確幅 ÷ 損切り幅'),
    inputs: [
      { key: 'buy', label: L('매수가', 'Buy price', '取得価格'), unit: 'currency', defaultValue: 100000 },
      { key: 'stopPct', label: L('손절 폭', 'Stop-loss', '損切り幅'), unit: U.pct, defaultValue: 5, step: 0.1, slider: { min: 1, max: 30 } },
      { key: 'takePct', label: L('익절 폭', 'Take-profit', '利確幅'), unit: U.pct, defaultValue: 15, step: 0.1, slider: { min: 1, max: 60 } },
    ],
    compute: (v) => {
      const r = stopTarget(v.buy, v.stopPct, v.takePct);
      return {
        results: [
          { label: L('손익비', 'Risk : Reward', '損益比'), value: `1 : ${fmtNumber(r.riskReward, 1)}`, emphasize: true },
          { label: L('손절가', 'Stop price', '損切り価格'), value: fmtNumber(r.stopPrice, 0), unit: 'currency' },
          { label: L('익절가', 'Target price', '利確価格'), value: fmtNumber(r.takePrice, 0), unit: 'currency' },
        ],
        viz: {
          type: 'ladder',
          stopPct: v.stopPct,
          takePct: v.takePct,
          stopPrice: fmtNumber(r.stopPrice, 0),
          buyPrice: fmtNumber(v.buy, 0),
          takePrice: fmtNumber(r.takePrice, 0),
        },
      };
    },
  },
  {
    slug: 'split-buy',
    category: 'trade',
    title: L('분할매수 평단 계산기', 'Scaled-Buy Average Calculator', '分割買い平均計算機'),
    tagline: L('3회 분할매수의 평균 단가를 계산합니다.', 'Average price across up to 3 buys.', '最大3回の分割買いの平均単価を計算。'),
    description: L(
      '가격을 나눠 여러 번 매수(분할매수)할 때의 총 수량·총 투자금·평균 단가를 계산합니다. 최대 3회 매수 가격과 수량을 넣으면 됩니다. 매수하지 않은 회차는 수량을 0으로 두세요.',
      'Calculate total shares, total invested, and average price when buying in tranches. Enter up to 3 buys; set quantity to 0 for tranches you did not use.',
      '価格を分けて複数回買う（分割買い）際の総数量・総投資額・平均単価を計算します。最大3回まで入力でき、使わない回は数量を0にしてください。',
    ),
    inputs: [
      { key: 'p1', label: L('1차 매수가', '1st price', '1回目価格'), unit: 'currency', defaultValue: 100000 },
      { key: 'q1', label: L('1차 수량', '1st qty', '1回目数量'), unit: U.shares, defaultValue: 10 },
      { key: 'p2', label: L('2차 매수가', '2nd price', '2回目価格'), unit: 'currency', defaultValue: 90000 },
      { key: 'q2', label: L('2차 수량', '2nd qty', '2回目数量'), unit: U.shares, defaultValue: 10 },
      { key: 'p3', label: L('3차 매수가', '3rd price', '3回目価格'), unit: 'currency', defaultValue: 80000 },
      { key: 'q3', label: L('3차 수량', '3rd qty', '3回目数量'), unit: U.shares, defaultValue: 10 },
    ],
    compute: (v) => {
      const r = splitBuy([
        { price: v.p1, qty: v.q1 },
        { price: v.p2, qty: v.q2 },
        { price: v.p3, qty: v.q3 },
      ]);
      return {
        results: [
          { label: L('평균 단가', 'Average price', '平均単価'), value: fmtNumber(r.avgPrice, 0), unit: 'currency', emphasize: true },
          { label: L('총 수량', 'Total shares', '総数量'), value: fmtNumber(r.totalQty, 0), unit: U.shares },
          { label: L('총 투자금', 'Total invested', '総投資額'), value: fmtNumber(r.totalAmount, 0), unit: 'currency' },
        ],
        viz: {
          type: 'stack',
          caption: L('회차별 투자금', 'Invested per tranche', '回別の投資額'),
          segments: [
            { label: L('1차', '1st', '1回目'), amount: v.p1 * v.q1, tone: 'base' },
            { label: L('2차', '2nd', '2回目'), amount: v.p2 * v.q2, tone: 'point' },
            { label: L('3차', '3rd', '3回目'), amount: v.p3 * v.q3, tone: 'positive' },
          ],
        },
      };
    },
  },
  {
    slug: 'position-size',
    category: 'trade',
    title: L('포지션 사이징 계산기', 'Position Sizing Calculator', 'ポジションサイズ計算機'),
    tagline: L('감수 리스크에 맞는 매수 금액을 계산합니다.', 'Buy amount that fits your risk budget.', '許容リスクに合った買付金額を計算。'),
    description: L(
      '한 번의 매매에서 계좌의 몇 %까지 잃을지(감수 리스크)와 손절 폭을 정하면, 그 리스크에 맞는 적정 매수 금액을 계산합니다. 계좌를 지키는 리스크 관리의 기본입니다.',
      'Set how much of your account you are willing to lose per trade (risk) and your stop width to get the right position size. A cornerstone of protecting your account.',
      '1回の売買で口座の何%まで失うか（許容リスク）と損切り幅を決めると、適切な買付金額を計算します。口座を守るリスク管理の基本です。',
    ),
    formula: L('매수금액 = (계좌 × 리스크%) ÷ 손절폭%', 'Position = (account × risk%) ÷ stop%', '買付金額 = (口座 × リスク%) ÷ 損切り幅%'),
    inputs: [
      { key: 'account', label: L('계좌 자금', 'Account size', '口座資金'), unit: 'currency', defaultValue: 10000000 },
      { key: 'riskPct', label: L('감수 리스크', 'Risk per trade', '許容リスク'), unit: U.pct, defaultValue: 2, step: 0.1, slider: { min: 0.5, max: 10 } },
      { key: 'stopPct', label: L('손절 폭', 'Stop-loss', '損切り幅'), unit: U.pct, defaultValue: 8, step: 0.1, slider: { min: 1, max: 30 } },
    ],
    compute: (v) => {
      const r = positionSize(v.account, v.riskPct, v.stopPct);
      const pos = Math.min(r.positionAmount, v.account);
      return {
        results: [
          { label: L('적정 매수 금액', 'Position size', '適正買付金額'), value: fmtNumber(r.positionAmount, 0), unit: 'currency', emphasize: true },
          { label: L('최대 손실액', 'Max loss', '最大損失額'), value: fmtNumber(r.maxLoss, 0), unit: 'currency' },
        ],
        viz: {
          type: 'stack',
          caption: L('계좌 대비 비중', 'Share of account', '口座に対する割合'),
          segments: [
            { label: L('이 매매 투입', 'This trade', 'この売買'), amount: pos, tone: 'point' },
            { label: L('잔여', 'Remaining', '残り'), amount: Math.max(0, v.account - pos), tone: 'base' },
          ],
        },
      };
    },
  },
  // ─── 세금·비용 ───────────────────────────────────────────────────────────
  {
    slug: 'overseas-tax',
    category: 'tax',
    title: L('해외주식 양도세 계산기', 'Overseas Stock Capital Gains Tax', '海外株式譲渡税計算機'),
    tagline: L('해외주식 양도소득세(22%)를 계산합니다.', 'Korean overseas capital gains tax (22%).', '海外株式の譲渡所得税（22%）を計算。'),
    description: L(
      '해외주식(미국주식 등) 매매로 실현한 연간 손익에 대한 양도소득세를 계산합니다. 연 250만원 기본공제 후 초과분에 22%(지방세 포함)가 부과됩니다. 연간 실현 손익 합계를 입력하세요.',
      'Calculate Korean capital gains tax on realized annual profit from overseas stocks (e.g. US shares). After a 2.5M KRW annual deduction, the excess is taxed at 22% (incl. local tax).',
      '海外株式（米国株など）の売買で実現した年間損益に対する譲渡所得税を計算します。年250万ウォンの基礎控除後、超過分に22%（地方税込み）が課されます。',
    ),
    formula: L('세금 = max(0, 실현손익 − 250만원) × 22%', 'Tax = max(0, profit − 2.5M) × 22%', '税金 = max(0, 実現損益 − 250万) × 22%'),
    inputs: [{ key: 'annualProfit', label: L('연간 실현 손익', 'Annual realized profit', '年間実現損益'), unit: 'currency', defaultValue: 5000000 }],
    compute: (v) => {
      const r = overseasTax(v.annualProfit);
      const out: ComputeOutput = {
        results: [
          { label: L('양도소득세', 'Capital gains tax', '譲渡所得税'), value: fmtNumber(r.tax, 0), unit: 'currency', emphasize: true },
          { label: L('과세 대상 금액', 'Taxable amount', '課税対象額'), value: fmtNumber(r.taxable, 0), unit: 'currency' },
          { label: L('세후 실수령', 'After-tax profit', '税引後の手取り'), value: fmtNumber(r.netProfit, 0), unit: 'currency' },
        ],
      };
      if (v.annualProfit > 0) {
        out.viz = {
          type: 'stack',
          caption: L('손익 분배', 'Profit split', '損益の内訳'),
          segments: [
            { label: L('세후 실수령', 'After tax', '税引後'), amount: Math.max(0, r.netProfit), tone: 'positive' },
            { label: L('세금', 'Tax', '税金'), amount: r.tax, tone: 'negative' },
          ],
        };
      }
      return out;
    },
  },
  {
    slug: 'trade-cost',
    category: 'tax',
    title: L('거래비용·손익분기 계산기', 'Trading Cost / Break-even', '取引コスト・損益分岐計算機'),
    tagline: L('수수료·세금 포함 손익분기가를 계산합니다.', 'Break-even price incl. fees and tax.', '手数料・税込みの損益分岐価格を計算。'),
    description: L(
      '매수·매도 수수료와 매도 거래세를 포함해 실제로 본전이 되는 손익분기 가격을 계산합니다. 국내 주식 거래세는 약 0.18%, 증권사 수수료는 상품마다 다릅니다(예: 0.015%).',
      'Calculate the break-even price including buy/sell fees and the sell transaction tax. Korean transaction tax is ~0.18%; broker fees vary by product (e.g. 0.015%).',
      '売買手数料と売却時の取引税を含めて、実際に元本回復となる損益分岐価格を計算します。韓国の取引税は約0.18%、証券会社の手数料は商品により異なります（例：0.015%）。',
    ),
    formula: L('손익분기가 = (매수금액 + 왕복비용) ÷ 수량', 'Break-even = (buyAmount + roundTripCost) ÷ qty', '損益分岐価格 = (買付金額 + 往復コスト) ÷ 数量'),
    inputs: [
      { key: 'price', label: L('주가', 'Price', '株価'), unit: 'currency', defaultValue: 100000 },
      { key: 'qty', label: L('수량', 'Quantity', '数量'), unit: U.shares, defaultValue: 10 },
      { key: 'feePct', label: L('수수료율', 'Fee rate', '手数料率'), unit: U.pct, defaultValue: 0.015, step: 0.001 },
      { key: 'taxPct', label: L('거래세율', 'Transaction tax', '取引税率'), unit: U.pct, defaultValue: 0.18, step: 0.01 },
    ],
    compute: (v) => {
      const r = tradeCost(v.price, v.qty, v.feePct, v.taxPct);
      return {
        results: [
          { label: L('손익분기가', 'Break-even price', '損益分岐価格'), value: fmtNumber(r.breakEvenPrice, 0), unit: 'currency', emphasize: true },
          { label: L('왕복 비용', 'Round-trip cost', '往復コスト'), value: fmtNumber(r.roundTripCost, 0), unit: 'currency' },
          { label: L('매수 금액', 'Buy amount', '買付金額'), value: fmtNumber(r.buyAmount, 0), unit: 'currency' },
        ],
      };
    },
  },
  // ─── 자산 배분 ───────────────────────────────────────────────────────────
  {
    slug: 'compound',
    category: 'asset',
    title: L('복리 계산기', 'Compound Interest Calculator', '複利計算機'),
    tagline: L('초기 투자금 + 월 적립의 복리 성장을 계산합니다.', 'Growth of a lump sum plus monthly deposits.', '初期投資＋毎月積立の複利成長を計算。'),
    description: L(
      '초기 투자금과 매월 적립하는 금액이 연 수익률로 복리 성장했을 때의 최종 금액을 계산합니다. 복리는 시간이 길수록 눈덩이처럼 커집니다.',
      'Calculate the final amount when an initial investment plus monthly deposits grow at an annual rate, compounded monthly. Compounding snowballs over time.',
      '初期投資金と毎月の積立額が年利回りで複利成長した際の最終金額を計算します。複利は期間が長いほど雪だるま式に増えます。',
    ),
    inputs: [
      { key: 'initial', label: L('초기 투자금', 'Initial amount', '初期投資金'), unit: 'currency', defaultValue: 10000000 },
      { key: 'monthly', label: L('월 적립금', 'Monthly deposit', '毎月積立'), unit: 'currency', defaultValue: 500000 },
      { key: 'annualRatePct', label: L('연 수익률', 'Annual return', '年利回り'), unit: U.pct, defaultValue: 7, step: 0.1, slider: { min: 0, max: 20 } },
      { key: 'years', label: L('투자 기간', 'Years', '投資期間'), unit: U.years, defaultValue: 10, slider: { min: 1, max: 40 } },
    ],
    compute: (v) => {
      const r = compound(v.initial, v.monthly, v.annualRatePct, v.years);
      const gainPct = r.totalContributed > 0 ? (r.totalGain / r.totalContributed) * 100 : 0;
      return {
        results: [
          { label: L('예상 최종 금액', 'Estimated final amount', '予想最終金額'), value: fmtNumber(r.finalAmount, 0), unit: 'currency', emphasize: true },
          { label: L('총 납입금', 'Total contributed', '総拠出額'), value: fmtNumber(r.totalContributed, 0), unit: 'currency' },
          { label: L('총 수익', 'Total gain', '総利益'), value: fmtNumber(r.totalGain, 0), unit: 'currency' },
          { label: L('수익률', 'Return', '利回り'), value: fmtNumber(gainPct, 1), unit: U.pct },
        ],
        viz: {
          type: 'stack',
          caption: L('원금 vs 수익', 'Principal vs gain', '元本 vs 利益'),
          segments: [
            { label: L('총 납입', 'Contributed', '拠出'), amount: r.totalContributed, tone: 'base' },
            { label: L('수익', 'Gain', '利益'), amount: Math.max(0, r.totalGain), tone: 'positive' },
          ],
        },
      };
    },
  },
  {
    slug: 'sip',
    category: 'asset',
    title: L('적립식 목표 계산기', 'Savings Goal Calculator', '積立目標計算機'),
    tagline: L('목표 금액 달성에 필요한 월 적립금을 계산합니다.', 'Monthly deposit needed to hit a goal.', '目標金額に必要な毎月積立額を計算。'),
    description: L(
      '원하는 목표 금액을 정해진 기간 안에 모으려면 매월 얼마를 적립해야 하는지 계산합니다. 연 수익률을 반영한 적립식(월복리) 기준입니다.',
      'Calculate the monthly deposit needed to reach a target amount within a set period, assuming a given annual return (monthly compounding).',
      '目標金額を決めた期間内に貯めるために毎月いくら積み立てるべきかを計算します。年利回りを反映した積立（月複利）基準です。',
    ),
    inputs: [
      { key: 'targetAmount', label: L('목표 금액', 'Target amount', '目標金額'), unit: 'currency', defaultValue: 100000000 },
      { key: 'years', label: L('기간', 'Years', '期間'), unit: U.years, defaultValue: 10, slider: { min: 1, max: 40 } },
      { key: 'annualRatePct', label: L('연 수익률', 'Annual return', '年利回り'), unit: U.pct, defaultValue: 7, step: 0.1, slider: { min: 0, max: 20 } },
    ],
    compute: (v) => ({
      results: [{ label: L('필요 월 적립금', 'Required monthly deposit', '必要な毎月積立額'), value: fmtNumber(sipMonthly(v.targetAmount, v.years, v.annualRatePct), 0), unit: 'currency', emphasize: true }],
    }),
  },
  {
    slug: 'rule72',
    category: 'asset',
    title: L('72법칙 계산기', 'Rule of 72 Calculator', '72の法則計算機'),
    tagline: L('자산이 2배 되는 데 걸리는 기간을 계산합니다.', 'How long it takes to double your money.', '資産が2倍になる期間を計算。'),
    description: L(
      '72를 연 수익률로 나누면 자산이 2배가 되는 데 걸리는 대략적인 기간(년)이 나옵니다. 복리의 위력을 직관적으로 보여주는 간단한 법칙입니다.',
      'Dividing 72 by the annual return gives the approximate number of years for your money to double. A simple rule that shows the power of compounding.',
      '72を年利回りで割ると、資産が2倍になるおおよその年数が出ます。複利の力を直感的に示す簡単な法則です。',
    ),
    formula: L('2배 기간(년) ≈ 72 ÷ 연 수익률', 'Years to double ≈ 72 ÷ annualReturn', '2倍になる年数 ≈ 72 ÷ 年利回り'),
    inputs: [{ key: 'annualRatePct', label: L('연 수익률', 'Annual return', '年利回り'), unit: U.pct, defaultValue: 8, step: 0.1, slider: { min: 1, max: 30 } }],
    compute: (v) => ({
      results: [{ label: L('2배 소요 기간', 'Years to double', '2倍になる期間'), value: fmtNumber(rule72(v.annualRatePct), 1), unit: U.years, emphasize: true }],
    }),
  },
  // ─── 배당 ───────────────────────────────────────────────────────────────
  {
    slug: 'dividend',
    category: 'dividend',
    title: L('배당금 계산기', 'Dividend Calculator', '配当金計算機'),
    tagline: L('세전·세후 배당금과 배당수익률을 계산합니다.', 'Gross/net dividend and dividend yield.', '税引前後の配当金と配当利回りを計算。'),
    description: L(
      '보유 수량과 주당 배당금으로 받게 될 배당금을 계산합니다. 배당소득세 15.4%(지방세 포함)를 반영한 세후 금액과 현재 주가 기준 배당수익률도 함께 보여줍니다.',
      'Calculate the dividend you will receive from your shares and dividend per share. Shows the after-tax amount (15.4% dividend tax, incl. local tax) and the yield at the current price.',
      '保有数と1株あたり配当金から受け取る配当金を計算します。配当所得税15.4%（地方税込み）を反映した税引後金額と、現在株価基準の配当利回りも表示します。',
    ),
    formula: L('세후 배당 = 세전 배당 × (1 − 15.4%)', 'Net = gross × (1 − 15.4%)', '税引後 = 税引前 × (1 − 15.4%)'),
    inputs: [
      { key: 'qty', label: L('보유 수량', 'Shares held', '保有数量'), unit: U.shares, defaultValue: 100 },
      { key: 'price', label: L('현재 주가', 'Current price', '現在株価'), unit: 'currency', defaultValue: 100000 },
      { key: 'dps', label: L('주당 배당금', 'Dividend per share', '1株配当金'), unit: 'currency', defaultValue: 3000 },
    ],
    compute: (v) => {
      const r = dividend(v.qty, v.price, v.dps);
      return {
        results: [
          { label: L('세후 배당금', 'After-tax dividend', '税引後配当金'), value: fmtNumber(r.net, 0), unit: 'currency', emphasize: true },
          { label: L('세전 배당금', 'Gross dividend', '税引前配当金'), value: fmtNumber(r.gross, 0), unit: 'currency' },
          { label: L('배당수익률', 'Dividend yield', '配当利回り'), value: fmtNumber(r.yieldPct, 2), unit: U.pct },
        ],
        viz: {
          type: 'stack',
          caption: L('세전 배당 분배', 'Gross dividend split', '税引前配当の内訳'),
          segments: [
            { label: L('세후 수령', 'After tax', '税引後'), amount: r.net, tone: 'positive' },
            { label: L('세금', 'Tax', '税金'), amount: r.gross - r.net, tone: 'negative' },
          ],
        },
      };
    },
  },
];

export function getTool(slug: string): ToolCalc | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
