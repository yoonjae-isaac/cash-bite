import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import GuruPage from '../../src/views/GuruPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '거장 포트폴리오',
  description: '워런 버핏 등 투자 거장들의 13F 포트폴리오와 보유 종목 변화를 확인하세요.',
  path: '/gurus',
});

export default function Page() {
  return (
    <Reveal>
      <GuruPage />
    </Reveal>
  );
}
