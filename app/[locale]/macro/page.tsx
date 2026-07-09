import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import MacroPage from '@/views/MacroPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchMacroOverview, fetchRateOutlook } from '@/infrastructure/api/macroClient';
import type { MacroOverviewRow, RateOutlook } from '@/domain/macro/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/macro', locale as Locale);
}

// ISR — 1시간마다 재생성. 서버에서 거시 한눈에·금리 방향을 렌더해 SSR 콘텐츠 확보.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
