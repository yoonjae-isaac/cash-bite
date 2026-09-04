import {
  buildEconomicItems,
  buildGuruEarningsItems,
  weekRangeLabel,
  type BoardConfig,
  type BoardItem,
} from '../domain/calendar/board';
import type { CalendarWeek } from '../domain/calendar/types';

/**
 * 홈 최상단 전광판(MarketBoard)의 노출 규칙 단일 소스.
 *
 * 전광판은 항상 떠 있는 배너가 아니라 조건이 맞을 때만 나타나는 자리다. 조건을 컴포넌트 안에
 * 흩어두면 "왜 오늘은 안 뜨지"를 답할 수 없게 되므로 규칙을 여기 모은다
 * (`features.ts`·백엔드 `cache-policy.ts` 와 같은 방식).
 *
 * 규칙은 위에서부터 평가해 **충족한 규칙의 아이템을 순서대로 합친다**. 한 줄 스트립이라
 * 원래는 하나만 켰지만, 경제지표와 거장 보유 종목 실적은 "이번 주에 시장을 흔들 일정"이라는
 * 같은 질문의 답이라 나란히 있을 때 오히려 읽힌다. 대신 규칙마다 건수를 스스로 제한해
 * 한 규칙이 줄을 독차지하지 않게 한다.
 */

export type BoardPresetId = 'economic' | 'earnings' | 'brief' | 'notice';

export interface BoardContext {
  /** 금주(월~금, KST) 미국 증시 일정. 일정이 없을 때의 처리는 resolveBoard 가 먼저 끝내므로 여기선 항상 있다. */
  week: CalendarWeek;
  /** 티커 → 보유 거장 수. 거장 데이터를 못 받았으면 빈 객체 — 실적 규칙이 스스로 0건이 된다. */
  guruSymbols: Record<string, number>;
}

export interface BoardRule {
  id: string;
  /** 이번 분기 활성 여부. false 면 조건과 무관하게 건너뛴다. */
  enabled: boolean;
  preset: BoardPresetId;
  match: (ctx: BoardContext) => boolean;
  /** 표시 아이템. match 를 통과해도 0건이 나올 수 있다(아래 각 규칙 주석 참고). */
  build: (ctx: BoardContext) => BoardItem[];
}

/** 실적은 전광판에서 최대 이만큼 — 나머지는 증시 일정에 그대로 있다. */
const EARNINGS_LIMIT = 6;

export const BOARD_RULES: BoardRule[] = [
  {
    id: 'weeklyEconomicHigh',
    enabled: true,
    preset: 'economic',
    /**
     * 금주에 중요 경제지표가 1건이라도 있으면 그 주 내내 노출한다(날짜 단위가 아니라 주 단위).
     * 발표 당일만 띄우면 미리 대비할 수 없고, 하루짜리 노출은 대부분 놓친다.
     */
    match: (ctx) => ctx.week.economic.some((e) => e.impact === 'high'),
    // 규칙은 impact 로 판정하고 아이템은 해설 카피 유무까지 거르므로 0건이 될 수 있다.
    build: (ctx) => buildEconomicItems(ctx.week),
  },
  {
    id: 'guruHeldEarnings',
    enabled: true,
    preset: 'earnings',
    /** 금주 실적 발표에 거장 보유 종목이 있으면 — 사용자가 이 서비스에서 따라가는 종목들이다. */
    match: (ctx) =>
      ctx.week.earnings.some((e) => ctx.guruSymbols[e.symbol.toUpperCase()] !== undefined),
    build: (ctx) => buildGuruEarningsItems(ctx.week, ctx.guruSymbols, EARNINGS_LIMIT),
  },
  // ── 아래는 이번 분기 범위 밖(정의만) ──
  {
    id: 'marketBrief',
    enabled: false,
    preset: 'brief',
    /** 미국장 마감 후 ~ 국내장 개장 전 시간대. */
    match: () => false,
    build: () => [],
  },
  {
    id: 'serviceNotice',
    enabled: false,
    preset: 'notice',
    /** 운영자가 등록한 공지가 노출 기간 내. */
    match: () => false,
    build: () => [],
  },
];

/**
 * 같은 날이면 경제지표를 앞에, 그다음 실적.
 *
 * 시각으로는 못 섞는다 — 경제지표는 'HH:mm' 이고 실적은 장전/장후만 공시돼 비교할 값이 없다.
 * 그래서 날짜만 기준으로 두고, 같은 날 안에서는 시장 전체를 움직이는 지표를 먼저 둔다.
 * `Array.sort` 가 안정 정렬이라 각 규칙이 잡아둔 내부 순서(지표=시각순, 실적=보유 거장 수순)는 유지된다.
 */
const KIND_ORDER: Record<BoardItem['kind'], number> = { economic: 0, earnings: 1 };

/**
 * 충족한 규칙들의 표시 데이터를 합친다. null 이면 스트립 자체를 렌더하지 않는다
 * (빈 껍데기가 최상단에 남아 있는 게 더 나쁘다).
 *
 * 주간 일정이 없는 경우(백엔드 장애 등)를 여기서 먼저 끝내므로, 각 규칙의 match 는
 * 일정이 있다는 전제만 다루면 된다 — 규칙을 늘릴 때마다 null 검사를 반복하지 않도록.
 */
export function resolveBoard(
  week: CalendarWeek | null,
  guruSymbols: Record<string, number> = {},
): BoardConfig | null {
  if (!week) {
    return null;
  }
  const ctx: BoardContext = { week, guruSymbols };
  const items = BOARD_RULES.filter((r) => r.enabled && r.match(ctx))
    .flatMap((r) => r.build(ctx))
    .sort((a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  return items.length > 0
    ? { label: '이번 주 발표', weekLabel: weekRangeLabel(week), items }
    : null;
}
