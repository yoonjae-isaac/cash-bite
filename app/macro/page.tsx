import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import MacroPage from '../../src/views/MacroPage';
import { pageMetadata } from '../../src/config/site';
import { fetchMacroOverview, fetchRateOutlook } from '../../src/infrastructure/api/macroClient';
import type { MacroOverviewRow, RateOutlook } from '../../src/domain/macro/types';

export const metadata: Metadata = pageMetadata({
  title: '거시지표',
  description: '미국 금리·물가·고용 등 핵심 거시지표와 금리 방향 전망을 한눈에.',
  path: '/macro',
});

// ISR — 1시간마다 재생성. 서버에서 거시 한눈에·금리 방향을 렌더해 SSR 콘텐츠 확보.
export const revalidate = 3600;

export default async function Page() {
  const [overviewR, outlookR] = await Promise.allSettled([
    fetchMacroOverview(3600),
    fetchRateOutlook(3600),
  ]);
  const initialOverview: MacroOverviewRow[] | undefined =
    overviewR.status === 'fulfilled' ? overviewR.value : undefined;
  const initialOutlook: RateOutlook | null =
    outlookR.status === 'fulfilled' ? outlookR.value : null;

  return (
    <Reveal>
      <MacroPage initialOverview={initialOverview} initialOutlook={initialOutlook} />
    </Reveal>
  );
}
