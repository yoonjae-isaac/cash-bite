import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import CalendarPage from '../../src/views/CalendarPage';
import { pageMetadata } from '../../src/config/site';
import { fetchUsCalendar } from '../../src/infrastructure/api/calendarClient';
import type { UsCalendarWeek } from '../../src/domain/calendar/types';

export const metadata: Metadata = pageMetadata({
  title: '경제 캘린더',
  description: '미국 실적 발표·경제지표·IPO 일정을 주간 캘린더로 확인하세요.',
  path: '/calendar',
});

// ISR — 1시간마다 재생성. 서버에서 이번 주 일정을 렌더해 SSR 콘텐츠 확보(색인·AdSense).
export const revalidate = 3600;

/** 이번 주 월~금 (서버 생성 시점 기준, 로컬 YYYY-MM-DD). */
function thisWeekMonFri(): { from: string; to: string } {
  const now = new Date();
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { from: ymd(mon), to: ymd(fri) };
}

export default async function Page() {
  const { from, to } = thisWeekMonFri();
  let initialData: UsCalendarWeek | null = null;
  try {
    initialData = await fetchUsCalendar(from, to, 3600);
  } catch {
    initialData = null; // 백엔드 일시 장애 시 클라가 폴백 fetch
  }
  return (
    <Reveal>
      <CalendarPage initialData={initialData} initialFrom={from} />
    </Reveal>
  );
}
