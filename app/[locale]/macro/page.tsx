import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import MacroPage from '@/views/MacroPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchMacroOverview } from '@/infrastructure/api/macroClient';
import type { MacroOverviewRow } from '@/domain/macro/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/macro', locale as Locale);
}

// ISR — 1시간마다 재생성. 서버에서 거시 한눈에를 렌더해 SSR 콘텐츠 확보.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let initialOverview: MacroOverviewRow[] | undefined;
  try {
    initialOverview = await fetchMacroOverview(3600);
  } catch {
    initialOverview = undefined; // 백엔드 일시 장애 시 클라가 폴백 fetch
  }

  return (
    <Reveal>
      <MacroPage initialOverview={initialOverview} />
    </Reveal>
  );
}
