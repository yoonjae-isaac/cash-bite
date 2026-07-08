import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import GuruPage from '../../src/views/GuruPage';
import { pageMetadata } from '../../src/config/site';
import { fetchGuruPortfolio } from '../../src/infrastructure/api/guruClient';
import type { GuruPortfolio } from '../../src/domain/guru/types';

const DEFAULT_INVESTOR = 'buffett';

export const metadata: Metadata = pageMetadata({
  title: '거장 포트폴리오',
  description: '워런 버핏 등 투자 거장들의 13F 포트폴리오와 보유 종목 변화를 확인하세요.',
  path: '/gurus',
});

// ISR — 하루 1회 재생성(13F 는 분기 공시). 서버에서 기본 거장 보유를 렌더해 SSR 콘텐츠 확보.
export const revalidate = 86400;

export default async function Page() {
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
