/** 시장 구분 — US / KR. */
export type CalendarMarket = 'US' | 'KR';

/** 실적 발표 한 건. */
export interface CalEarning {
  date: string;
  symbol: string;
  hour: string; // bmo | amc | dmh | ''
  epsEstimate: number | null;
  revenueEstimate: number | null;
  name?: string; // KR: 기업명(corp_name). US: 미사용(심볼 매핑)
  url?: string; // KR: 공시 원문 링크
}

/** 경제 지표 발표 한 건 (발표 일정 — 지표명·발표일·중요도). */
export interface CalEconomic {
  date: string;
  key: string; // i18n 매핑용 안정 키 (US: cpi/gdp… / KR: rate…)
  event: string; // 원문 릴리스명 (i18n 폴백)
  impact: string; // high | medium
}

/** IPO 일정 한 건. */
export interface CalIpo {
  date: string;
  symbol: string;
  name: string;
  exchange: string;
  price: string | null;
  totalSharesValue: number | null;
}

/** 증시 주간 일정 (실적 + IPO + 경제지표). market 으로 US/KR 구분. */
export interface CalendarWeek {
  market: CalendarMarket;
  from: string;
  to: string;
  earnings: CalEarning[];
  ipos: CalIpo[];
  economic: CalEconomic[];
}
