import { backendGet } from './backendClient';
import type { CalendarMarket, CalendarWeek } from '../../domain/calendar/types';

/**
 * 증시 주간 일정 (실적·IPO·경제지표). market=US|KR.
 * from·to 미지정 시 백엔드가 현재 영업주(월~금, KST, 주말→다음주)를 산출 — 응답의 from/to 로 확인.
 */
export const fetchCalendar = (
  market: CalendarMarket,
  from?: string,
  to?: string,
  revalidate?: number,
): Promise<CalendarWeek> => {
  const qs = new URLSearchParams({ market });
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  return backendGet<CalendarWeek>(`/calendar?${qs.toString()}`, revalidate);
};
