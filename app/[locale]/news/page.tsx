import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import NewsPage from '@/views/NewsPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';
import { fetchMarketNews, fetchNewsDigests } from '@/infrastructure/api/backendNewsClient';
import type { NewsItem, NewsDigest } from '@/domain/news/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/news', locale as Locale);
}

// ISR — 30분마다 재생성. 서버에서 국내(KR) 뉴스·다이제스트를 렌더해 SSR 콘텐츠 확보.
export const revalidate = 1800;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [newsR, digestR] = await Promise.allSettled([
    fetchMarketNews('KR', 30, 1800),
    fetchNewsDigests('KR', 24, 1800),
  ]);
  const initialNews: NewsItem[] | undefined = newsR.status === 'fulfilled' ? newsR.value : undefined;
  const initialDigests: NewsDigest[] | undefined =
    digestR.status === 'fulfilled' ? digestR.value : undefined;

  return (
    <Reveal>
      <NewsPage initialNews={initialNews} initialDigests={initialDigests} />
    </Reveal>
  );
}
