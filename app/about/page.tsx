import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '소개',
  description: 'AntsUp 소개 — 주린이를 위한 주식 정보 서비스. 제공 기능과 데이터 출처 안내.',
  path: '/about',
});

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-6">AntsUp 소개</h1>

      <div className="space-y-7 text-sm leading-relaxed text-cb-foreground/90">
        <section>
          <p className="text-cb-muted">
            AntsUp는 주식 투자를 막 시작한 초보 투자자(주린이)를 위한 주식 정보 서비스입니다. 복잡한 정보를
            쉽고 빠르게 파악할 수 있도록, 시장 뉴스·투자 거장 포트폴리오·종목 분석·거시지표·경제 캘린더를 한곳에
            모았습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-3">제공 기능</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-cb-muted">
            <li><Link href="/news" className="text-cb-accent hover:underline">시장 뉴스</Link> — 국내·미국 증시 뉴스와 AI 요약 다이제스트</li>
            <li><Link href="/gurus" className="text-cb-accent hover:underline">거장 포트폴리오</Link> — 투자 거장들의 13F 보유 종목과 변화</li>
            <li><Link href="/stock" className="text-cb-accent hover:underline">종목 분석</Link> — 재무·기술적 지표 분석</li>
            <li><Link href="/macro" className="text-cb-accent hover:underline">거시지표</Link> — 미국 금리·물가·고용 및 금리 방향 전망</li>
            <li><Link href="/calendar" className="text-cb-accent hover:underline">경제 캘린더</Link> — 실적·경제지표·IPO 일정</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">데이터 출처</h2>
          <p className="text-cb-muted">
            시세·재무·뉴스·거시 데이터는 공개 데이터 제공처의 API를 통해 표시됩니다. 데이터는 지연되거나 오류가
            있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">면책</h2>
          <p className="text-cb-muted">
            본 서비스의 정보는 참고용이며 투자 권유가 아닙니다. 투자 판단과 책임은 이용자 본인에게 있습니다. 자세한
            내용은 <Link href="/terms" className="text-cb-accent hover:underline">이용약관</Link>과{' '}
            <Link href="/privacy" className="text-cb-accent hover:underline">개인정보처리방침</Link>을 참고하세요.
          </p>
        </section>
      </div>
    </div>
  );
}
