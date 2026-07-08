import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import NewsPage from '../../src/views/NewsPage';
import { pageMetadata } from '../../src/config/site';
import { fetchMarketNews, fetchNewsDigests } from '../../src/infrastructure/api/backendNewsClient';
import type { NewsItem, NewsDigest } from '../../src/domain/news/types';

export const metadata: Metadata = pageMetadata({
  title: '시장 뉴스',
  description: '국내·미국 증시 뉴스와 AI 요약 다이제스트를 한눈에.',
  path: '/news',
});

// ISR — 30분마다 재생성. 서버에서 국내(KR) 뉴스·다이제스트를 렌더해 SSR 콘텐츠 확보.
export const revalidate = 1800;

export default async function Page() {
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
