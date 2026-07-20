import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import CalendarPage from '@/views/CalendarPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchCalendar } from '@/infrastructure/api/calendarClient';
import type { CalendarWeek } from '@/domain/calendar/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/calendar', locale as Locale);
}

// ISR — 30분마다 재생성. 주말→다음주 롤오버가 SSR 에 빠르게 반영되도록 짧게. 서버 렌더로 SSR 콘텐츠 확보(색인·AdSense).
export const revalidate = 1800;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // 주간 범위는 백엔드가 산출(현재 영업주, KST) — 프론트는 응답 from/to 를 그대로 사용.
  // SSR canonical 은 US (색인·AdSense). KR 은 클라 토글 시 fetch.
  let initialData: CalendarWeek | null = null;
  try {
    initialData = await fetchCalendar('US', undefined, undefined, 1800);
  } catch {
    initialData = null; // 백엔드 일시 장애 시 클라가 폴백 fetch
  }
  return (
    <Reveal>
      <CalendarPage initialData={initialData} />
    </Reveal>
  );
}
