import { buildEconomicItems, weekRangeLabel, type BoardConfig } from '../domain/calendar/board';
import type { CalendarWeek } from '../domain/calendar/types';

/**
 * 홈 최상단 전광판(MarketBoard)의 노출 규칙 단일 소스.
 *
 * 전광판은 항상 떠 있는 배너가 아니라 조건이 맞을 때만 나타나는 자리다. 조건을 컴포넌트 안에
 * 흩어두면 "왜 오늘은 안 뜨지"를 답할 수 없게 되므로 규칙을 여기 모은다
 * (`features.ts`·백엔드 `cache-policy.ts` 와 같은 방식).
 *
 * 규칙은 위에서부터 평가해 **가장 먼저 충족한 하나만** 켠다 — 최상단은 한 줄이고,
 * 둘이 겹치면 둘 다 안 읽힌다. 이번 분기는 `weeklyEconomicHigh` 하나만 활성이고
 * 나머지는 순서를 미리 잡아두기 위해 정의만 해둔다.
 */

export type BoardPresetId = 'economic' | 'earnings' | 'brief' | 'notice';

export interface BoardContext {
  /** 금주(월~금, KST) 미국 증시 일정. 일정이 없을 때의 처리는 resolveBoard 가 먼저 끝내므로 여기선 항상 있다. */
  week: CalendarWeek;
}

export interface BoardRule {
  id: string;
  /** 이번 분기 활성 여부. false 면 조건과 무관하게 건너뛴다. */
  enabled: boolean;
  preset: BoardPresetId;
  match: (ctx: BoardContext) => boolean;
}

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
  },
  // ── 아래는 이번 분기 범위 밖(정의만) ──
  {
    id: 'ownedEarnings',
    enabled: false,
    preset: 'earnings',
    /** 금주 실적 발표에 보유 종목이 있으면. */
    match: () => false,
  },
  {
    id: 'marketBrief',
    enabled: false,
    preset: 'brief',
    /** 미국장 마감 후 ~ 국내장 개장 전 시간대. */
    match: () => false,
  },
  {
    id: 'serviceNotice',
    enabled: false,
    preset: 'notice',
    /** 운영자가 등록한 공지가 노출 기간 내. */
    match: () => false,
  },
];

/**
 * 첫 충족 규칙의 표시 데이터를 만든다. null 이면 스트립 자체를 렌더하지 않는다
 * (빈 껍데기가 최상단에 남아 있는 게 더 나쁘다).
 *
 * 주간 일정이 없는 경우(백엔드 장애 등)를 여기서 먼저 끝내므로, 각 규칙의 match 는
 * 일정이 있다는 전제만 다루면 된다 — 규칙을 늘릴 때마다 null 검사를 반복하지 않도록.
 */
export function resolveBoard(week: CalendarWeek | null): BoardConfig | null {
  if (!week) {
    return null;
  }
  const rule = BOARD_RULES.find((r) => r.enabled && r.match({ week }));
  if (!rule) {
    return null;
  }
  if (rule.preset !== 'economic') {
    return null; // 나머지 프리셋은 미구현 — 규칙도 enabled:false 라 여기 닿지 않는다.
  }
  const items = buildEconomicItems(week);
  // 규칙은 impact 로 판정하고 아이템은 해설 카피 유무까지 거르므로, 카피가 없으면 0건이 될 수 있다.
  return items.length > 0
    ? { label: '이번 주 발표', weekLabel: weekRangeLabel(week), items }
    : null;
}
