import { ECONOMIC_INSIGHTS, etToKst, type EconomicInsight } from './insights';
import type { CalendarWeek } from './types';

/** 전광판 아이템 공통 — 언제 무엇이 있는지. */
interface BoardItemBase {
  id: string;
  /** 발표 시점 날짜(KST) 'YYYY-MM-DD'. 미 동부 밤 발표는 국내 기준 다음날이 된다. */
  date: string;
  /** 발표 시각(KST) 'HH:mm'. 실적은 시각이 불확실해 장전/장후 표기를 쓴다. */
  time: string;
}

/** 경제지표 — 누르면 해설 상세가 열린다. */
export interface BoardEconomicItem extends BoardItemBase {
  kind: 'economic';
  /** 표기명·해설 본문. 제목은 `insight.title` 하나만 두고 따로 복사하지 않는다. */
  insight: EconomicInsight;
}

/**
 * 거장 보유 종목의 실적 발표 — 누르면 증시 일정으로 보낸다.
 *
 * 경제지표처럼 해설을 달지 않는 이유: 종목별 해설을 사람이 쓸 수 없고, 사용자가 여기서 원하는
 * 것은 "이번 주 어느 날 발표한다"는 사실 하나다. 자세한 건 증시 일정에 이미 다 있다.
 */
export interface BoardEarningsItem extends BoardItemBase {
  kind: 'earnings';
  ticker: string;
  /** 현지어 종목명 (없으면 티커만 노출). */
  name?: string;
  /** 이 종목을 보유한 거장 수 — 증시 일정의 ★N 과 같은 값. */
  guruCount: number;
}

/**
 * 전광판(MarketBoard) 표시 데이터.
 *
 * 경제지표와 거장 보유 종목 실적을 한 줄에 함께 싣는다. 둘 다 "이번 주에 시장을 흔들 일정"이고,
 * 사용자가 홈에서 알고 싶은 것도 그 하나다. kind 로 갈라 렌더·클릭 동작만 달리한다.
 */
export type BoardItem = BoardEconomicItem | BoardEarningsItem;

export interface BoardConfig {
  /** 좌측 고정 라벨. */
  label: string;
  /** 주간 범위 표기 '8/10–8/14'. */
  weekLabel: string;
  items: BoardItem[];
  /**
   * 티커 → 로고 URL. 실적 칸의 표식용이며, 없는 티커는 키가 없다(컴포넌트가 이니셜로 대체).
   * items 를 확정한 뒤에야 어떤 티커가 필요한지 알 수 있어 `resolveBoard` 밖에서 채운다.
   */
  logos?: Record<string, string>;
}

/** 로고를 받아야 할 티커 목록 — 실적 칸만 로고를 쓴다. */
export const boardLogoSymbols = (items: BoardItem[]): string[] =>
  items.flatMap((it) => (it.kind === 'earnings' ? [it.ticker] : []));

/** 'YYYY-MM-DD' → 'M/D'. */
const md = (ymd: string): string => {
  const [, m, d] = ymd.split('-');
  return `${Number(m)}/${Number(d)}`;
};

/** 주간 범위 라벨 — 백엔드가 산출한 from/to 를 그대로 쓴다(주간 경계 기준은 KST 한 곳). */
export const weekRangeLabel = (week: CalendarWeek): string =>
  `${md(week.from)}–${md(week.to)}`;

/**
 * 금주 경제지표 → 전광판 아이템.
 *
 * 중요도 high 만 싣는다 — 전광판은 "이번 주에 시장을 흔들 발표"만 두는 자리이고,
 * medium 까지 섞으면 한 줄 스트립에서 우선순위가 무너진다(나머지는 증시 일정 페이지에 그대로 있다).
 * 해설 카피가 없는 키도 제외한다 — 눌렀는데 빈 상세가 뜨는 편이 더 나쁘다.
 */
export function buildEconomicItems(week: CalendarWeek): BoardEconomicItem[] {
  return week.economic
    .flatMap((e) => {
      const insight = e.impact === 'high' ? ECONOMIC_INSIGHTS[e.key] : undefined;
      if (!insight) {
        return [];
      }
      const kst = etToKst(e.date, insight.etTime);
      return [
        {
          kind: 'economic' as const,
          id: `${e.key}-${e.date}`,
          date: kst.date,
          time: kst.time,
          insight,
        },
      ];
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/**
 * 금주 실적 발표 중 거장 보유 종목 → 전광판 아이템.
 *
 * 보유 거장이 많은 순으로 자르고, 남은 종목은 증시 일정에 그대로 있다. 전광판은 한 줄이라
 * 다 실으면 경제지표가 밀려난다.
 *
 * 발표 시각은 장전/장후만 공시되고 정확한 시각이 없어 그 라벨을 그대로 쓴다 — 없는 시각을
 * 지어내면 사용자가 그 시간에 맞춰 기다리게 된다.
 */
export function buildGuruEarningsItems(
  week: CalendarWeek,
  guruSymbols: Record<string, number>,
  limit: number,
): BoardEarningsItem[] {
  const hourLabel: Record<string, string> = { bmo: '장전', amc: '장후', dmh: '장중' };
  return week.earnings
    .flatMap((e) => {
      const guruCount = guruSymbols[e.symbol.toUpperCase()];
      if (guruCount === undefined) {
        return [];
      }
      return [
        {
          kind: 'earnings' as const,
          id: `earnings-${e.symbol}-${e.date}`,
          date: e.date,
          time: (e.hour && hourLabel[e.hour]) || '시간 미정',
          ticker: e.symbol,
          ...(e.name ? { name: e.name } : {}),
          guruCount,
        },
      ];
    })
    .sort((a, b) => b.guruCount - a.guruCount)
    .slice(0, limit);
}
