import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import NewsPage from '../../src/views/NewsPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '시장 뉴스',
  description: '국내·미국 증시 뉴스와 AI 요약 다이제스트를 한눈에.',
  path: '/news',
});

export default function Page() {
  return (
    <Reveal>
      <NewsPage />
    </Reveal>
  );
}
