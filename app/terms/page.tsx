import type { Metadata } from 'next';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '이용약관',
  description: 'AntsUp 이용약관 — 서비스 성격, 면책, 지식재산, 금지행위.',
  path: '/terms',
});

const UPDATED = '2026-07-07';

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">이용약관</h1>
      <p className="text-sm text-cb-muted mb-8">최종 개정일: {UPDATED}</p>

      <div className="space-y-7 text-sm leading-relaxed text-cb-foreground/90">
        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">1. 서비스의 성격</h2>
          <p className="text-cb-muted">
            AntsUp(이하 &ldquo;서비스&rdquo;)는 주식·거시경제 관련 정보를 제공하는 정보 서비스입니다. 서비스가
            제공하는 정보는 참고 목적이며, 특정 종목의 매수·매도 권유나 투자 자문에 해당하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">2. 면책</h2>
          <ul className="list-disc pl-5 space-y-1 text-cb-muted">
            <li>서비스는 제3자 데이터 제공처의 정보를 표시하며, 정보의 정확성·완전성·적시성을 보장하지 않습니다.</li>
            <li>데이터는 지연되거나 오류가 있을 수 있으며, 이에 근거한 투자 판단과 결과의 책임은 이용자에게 있습니다.</li>
            <li>서비스 이용으로 발생한 직간접적 손해에 대해 운영자는 관련 법령이 허용하는 범위에서 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">3. 지식재산권</h2>
          <p className="text-cb-muted">
            서비스의 디자인·로고·구성·콘텐츠에 대한 권리는 운영자 또는 정당한 권리자에게 있으며, 무단 복제·배포를
            금합니다. 제3자 데이터의 권리는 각 제공처에 귀속됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">4. 금지 행위</h2>
          <p className="text-cb-muted">
            이용자는 서비스의 정상적 운영을 방해하는 행위(비정상적 자동 수집, 과도한 트래픽 유발, 역공학 등)를 해서는
            안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">5. 서비스 변경·중단</h2>
          <p className="text-cb-muted">
            운영자는 서비스의 전부 또는 일부를 사전 고지 없이 변경하거나 중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">6. 준거법</h2>
          <p className="text-cb-muted">본 약관은 대한민국 법령에 따라 해석·적용됩니다.</p>
        </section>
      </div>
    </div>
  );
}
