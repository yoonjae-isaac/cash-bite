import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import CalendarPage from '@/views/CalendarPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchUsCalendar } from '@/infrastructure/api/calendarClient';
import type { UsCalendarWeek } from '@/domain/calendar/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/calendar', locale as Locale);
}

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

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
