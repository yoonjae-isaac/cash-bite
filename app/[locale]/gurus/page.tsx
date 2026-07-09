import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import GuruPage from '@/views/GuruPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchGuruPortfolio } from '@/infrastructure/api/guruClient';
import type { GuruPortfolio } from '@/domain/guru/types';

const DEFAULT_INVESTOR = 'buffett';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/gurus', locale as Locale);
}

// ISR — 하루 1회 재생성(13F 는 분기 공시). 서버에서 기본 거장 보유를 렌더해 SSR 콘텐츠 확보.
export const revalidate = 86400;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let initialPortfolio: GuruPortfolio | undefined;
  try {
    initialPortfolio = await fetchGuruPortfolio(DEFAULT_INVESTOR, 86400);
  } catch {
    initialPortfolio = undefined; // 백엔드 장애 시 클라 폴백
  }

  return (
    <Reveal>
      <GuruPage initialPortfolio={initialPortfolio} initialKey={DEFAULT_INVESTOR} />
    </Reveal>
  );
}
