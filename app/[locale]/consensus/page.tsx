import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import ConsensusPage from '@/views/ConsensusPage';
import EmptyState from '@/components/ui/EmptyState';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchGuruAnalysis, fetchGuruStats } from '@/infrastructure/api/guruClient';
import { fetchStockLogos } from '@/infrastructure/api/logoClient';
import type { GuruAnalysis, GuruStats } from '@/domain/guru/types';

const REVALIDATE = 86400;
const LOGO_REVALIDATE = 604800; // 로고는 거의 안 바뀐다 — 주 단위 재검증

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/consensus', locale as Locale);
}

export const revalidate = 86400;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stats: GuruStats | undefined;
  try {
    stats = await fetchGuruStats(REVALIDATE);
  } catch {
    stats = undefined;
  }

  let analysis: GuruAnalysis | null = null;
  try {
    analysis = await fetchGuruAnalysis(undefined, REVALIDATE);
  } catch {
    analysis = null;
  }

  // 4개 랭킹 카드에 등장하는 티커만 모아 한 번에 조회 (백엔드가 종목당 30일 캐시).
  let logos: Record<string, string> | undefined;
  if (stats) {
    const symbols = [stats.mostHeld, stats.grandPortfolio, stats.mostBought, stats.mostSold]
      .flat()
      .slice(0, 40)
      .map((s) => s.ticker)
      .filter((s): s is string => Boolean(s));
    logos = await fetchStockLogos(symbols, LOGO_REVALIDATE).catch(() => undefined);
  }

  return (
    <Reveal>
      {stats ? (
        <ConsensusPage stats={stats} analysis={analysis} logos={logos} />
      ) : (
        <EmptyState message="Preparing data." />
      )}
    </Reveal>
  );
}
