import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import CalendarPage from '../../src/views/CalendarPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '경제 캘린더',
  description: '미국 실적 발표·경제지표·IPO 일정을 주간 캘린더로 확인하세요.',
  path: '/calendar',
});

export default function Page() {
  return (
    <Reveal>
      <CalendarPage />
    </Reveal>
  );
}
