import { ECONOMIC_INSIGHTS, etToKst, type EconomicInsight } from './insights';
import type { CalendarWeek } from './types';

/**
 * 전광판(MarketBoard) 표시 데이터 — 현재는 경제지표 전용이다.
 *
 * 실적·브리핑·공지 프리셋(`src/config/boardRules.ts`)을 켤 때는 `insight` 를 프리셋별 본문의
 * 유니온으로 넓혀야 한다. 쓰지도 않는 프리셋을 미리 상상해 옵셔널로 만들어두면,
 * 정작 켤 때 맞지도 않는 형태를 물려받는다.
 */
export interface BoardItem {
  id: string;
  /** 발표 시점 날짜(KST) 'YYYY-MM-DD'. 미 동부 밤 발표는 국내 기준 다음날이 된다. */
  date: string;
  /** 발표 시각(KST) 'HH:mm'. */
  time: string;
  /** 표기명·해설 본문. 제목은 `insight.title` 하나만 두고 따로 복사하지 않는다. */
  insight: EconomicInsight;
}

export interface BoardConfig {
  /** 좌측 고정 라벨. */
  label: string;
  /** 주간 범위 표기 '8/10–8/14'. */
  weekLabel: string;
  items: BoardItem[];
}

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
export function buildEconomicItems(week: CalendarWeek): BoardItem[] {
  return week.economic
    .flatMap((e) => {
      const insight = e.impact === 'high' ? ECONOMIC_INSIGHTS[e.key] : undefined;
      if (!insight) {
        return [];
      }
      const kst = etToKst(e.date, insight.etTime);
      return [{ id: `${e.key}-${e.date}`, date: kst.date, time: kst.time, insight }];
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}
