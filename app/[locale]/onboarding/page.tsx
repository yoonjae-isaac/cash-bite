import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import OnboardingBoard from '@/components/onboarding/OnboardingBoard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/onboarding', locale as Locale);
}

// 국내(주린이) 대상 정적 콘텐츠 — SSR 로 초기 홈 화면 렌더(색인·AdSense). 단계 전환은 클라이언트 상태.
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OnboardingBoard />;
}
