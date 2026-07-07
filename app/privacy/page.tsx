import type { Metadata } from 'next';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '개인정보처리방침',
  description: 'AntsUp 개인정보처리방침 — 수집 항목, 쿠키 및 광고, 제3자 제공, 이용자 권리.',
  path: '/privacy',
});

const UPDATED = '2026-07-07';

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">개인정보처리방침</h1>
      <p className="text-sm text-cb-muted mb-8">최종 개정일: {UPDATED}</p>

      <div className="space-y-7 text-sm leading-relaxed text-cb-foreground/90">
        <section>
          <p className="text-cb-muted">
            AntsUp(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게 생각하며, 아래와 같이 개인정보를
            처리합니다. 본 서비스는 회원가입·로그인 기능이 없으며, 이용자를 식별하는 개인정보를 서버에 직접
            수집·저장하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">1. 수집하는 정보</h2>
          <ul className="list-disc pl-5 space-y-1 text-cb-muted">
            <li>
              <span className="text-cb-foreground/90 font-medium">브라우저 로컬 저장(localStorage):</span> 테마·언어·
              상승하락 색상 설정, 관심 종목 등 이용 편의를 위한 설정값. 해당 데이터는 이용자 브라우저에만 저장되며
              서버로 전송되지 않습니다.
            </li>
            <li>
              <span className="text-cb-foreground/90 font-medium">자동 수집 정보:</span> 방문 분석 및 광고를 위해 쿠키·
              유사기술을 통해 접속 기기·브라우저·IP(익명화)·페이지 이용 기록 등이 수집될 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">2. 쿠키 및 광고</h2>
          <p className="text-cb-muted">
            본 서비스는 방문 통계(Google Analytics / Google Tag Manager)와 광고(Google AdSense)를 위해 쿠키를
            사용할 수 있습니다. Google 등 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전 방문 기록에 기반한
            광고를 게재할 수 있습니다. 이용자는 최초 방문 시 표시되는 동의 배너에서 광고·분석 쿠키 사용에 대해
            동의하거나 거부할 수 있으며,{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cb-accent hover:underline"
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 비활성화할 수 있습니다. 또한 브라우저 설정에서 쿠키를 차단·삭제할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">3. 제3자 서비스</h2>
          <p className="text-cb-muted">
            본 서비스는 다음의 제3자 서비스를 이용하며, 각 서비스의 개인정보 처리에는 해당 사업자의 방침이
            적용됩니다: Google Analytics·Google Tag Manager·Google AdSense. 또한 뉴스·시세·재무 등 정보는 외부
            데이터 제공처의 API를 통해 표시됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">4. 동의 철회 및 이용자 권리</h2>
          <p className="text-cb-muted">
            이용자는 언제든지 브라우저 쿠키를 삭제하거나 로컬 저장 데이터를 초기화하여 저장된 설정을 제거할 수
            있습니다. 광고·분석 쿠키 동의는 브라우저 저장소를 삭제하면 초기화되어 다음 방문 시 다시 선택할 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">5. 투자 정보 관련 고지</h2>
          <p className="text-cb-muted">
            본 서비스가 제공하는 모든 정보는 참고용이며 투자 권유·자문이 아닙니다. 투자 판단과 그 결과에 대한
            책임은 이용자 본인에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">6. 문의</h2>
          <p className="text-cb-muted">
            개인정보 처리에 관한 문의는 서비스 운영자에게 연락해 주시기 바랍니다. (문의: 운영자 이메일 기재
            예정)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">7. 개정</h2>
          <p className="text-cb-muted">
            본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 개정 시 본 페이지를 통해 고지합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
