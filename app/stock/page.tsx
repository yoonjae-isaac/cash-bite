import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import StockPage from '../../src/views/StockPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '종목 분석',
  description: '국내·미국 주식의 재무·기술적 지표를 한눈에 분석합니다.',
  path: '/stock',
});

export default function Page() {
  return (
    <Reveal>
      <StockPage />
    </Reveal>
  );
}
