import { backendGet } from './backendClient';
import type { CalendarMarket, CalendarWeek } from '../../domain/calendar/types';

/** 증시 주간 일정 (실적·IPO·경제지표). market=US|KR, from·to 는 YYYY-MM-DD. */
export const fetchCalendar = (
  market: CalendarMarket,
  from: string,
  to: string,
  revalidate?: number,
): Promise<CalendarWeek> =>
  backendGet<CalendarWeek>(`/calendar?market=${market}&from=${from}&to=${to}`, revalidate);
