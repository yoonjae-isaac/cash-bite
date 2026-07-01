import { backendGet } from './backendClient';
import type { UsCalendarWeek } from '../../domain/calendar/types';

/** 미국 증시 주간 일정 (실적·IPO·경제지표). from·to 는 YYYY-MM-DD. */
export const fetchUsCalendar = (from: string, to: string): Promise<UsCalendarWeek> =>
  backendGet<UsCalendarWeek>(`/calendar/us?from=${from}&to=${to}`);
