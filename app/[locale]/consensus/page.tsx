import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import ConsensusPage from '@/views/ConsensusPage';
import EmptyState from '@/components/ui/EmptyState';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchGuruAnalysis, fetchGuruStats } from '@/infrastructure/api/guruClient';
import type { GuruAnalysis, GuruStats } from '@/domain/guru/types';

const REVALIDATE = 86400;

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

  return (
    <Reveal>
      {stats ? (
        <ConsensusPage stats={stats} analysis={analysis} />
      ) : (
        <EmptyState message="Preparing data." />
      )}
    </Reveal>
  );
}
