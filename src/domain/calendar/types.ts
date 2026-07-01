/** 실적 발표 한 건. */
export interface CalEarning {
  date: string;
  symbol: string;
  hour: string; // bmo | amc | dmh | ''
  epsEstimate: number | null;
  revenueEstimate: number | null;
}

/** 경제 지표 발표 한 건 (FRED 발표 일정 — 지표명·발표일·중요도). */
export interface CalEconomic {
  date: string;
  key: string; // i18n 매핑용 안정 키 (cpi, gdp, ...)
  event: string; // FRED 영문 릴리스명 (i18n 폴백)
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

/** 미국 증시 주간 일정 (실적 + IPO + 경제지표). */
export interface UsCalendarWeek {
  from: string;
  to: string;
  earnings: CalEarning[];
  ipos: CalIpo[];
  economic: CalEconomic[];
}
