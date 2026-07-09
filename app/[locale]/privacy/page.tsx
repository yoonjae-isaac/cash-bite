import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/privacy', locale as Locale);
}

const UPDATED = '2026-07-07';

type Content = {
  h1: string;
  updatedLabel: string;
  intro: string;
  s1Title: string;
  s1Items: string[];
  s2Title: string;
  s2a: string;
  s2Link: string;
  s2b: string;
  s3Title: string;
  s3: string;
  s4Title: string;
  s4: string;
  s5Title: string;
  s5: string;
  s6Title: string;
  s6: string;
  s7Title: string;
  s7: string;
};

const CONTENT: Record<Locale, Content> = {
  ko: {
    h1: '개인정보처리방침',
    updatedLabel: '최종 개정일',
    intro:
      'AntsUp(이하 “서비스”)는 이용자의 개인정보를 중요하게 생각하며, 아래와 같이 개인정보를 처리합니다. 본 서비스는 회원가입·로그인 기능이 없으며, 이용자를 식별하는 개인정보를 서버에 직접 수집·저장하지 않습니다.',
    s1Title: '1. 수집하는 정보',
    s1Items: [
      '브라우저 로컬 저장(localStorage): 테마·언어·상승하락 색상 설정, 관심 종목 등 이용 편의를 위한 설정값. 해당 데이터는 이용자 브라우저에만 저장되며 서버로 전송되지 않습니다.',
      '자동 수집 정보: 방문 분석 및 광고를 위해 쿠키·유사기술을 통해 접속 기기·브라우저·IP(익명화)·페이지 이용 기록 등이 수집될 수 있습니다.',
    ],
    s2Title: '2. 쿠키 및 광고',
    s2a:
      '본 서비스는 방문 통계(Google Analytics / Google Tag Manager)와 광고(Google AdSense)를 위해 쿠키를 사용할 수 있습니다. Google 등 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전 방문 기록에 기반한 광고를 게재할 수 있습니다. 이용자는 최초 방문 시 표시되는 동의 배너에서 광고·분석 쿠키 사용에 대해 동의하거나 거부할 수 있으며, ',
    s2Link: 'Google 광고 설정',
    s2b: '에서 맞춤 광고를 비활성화할 수 있습니다. 또한 브라우저 설정에서 쿠키를 차단·삭제할 수 있습니다.',
    s3Title: '3. 제3자 서비스',
    s3:
      '본 서비스는 다음의 제3자 서비스를 이용하며, 각 서비스의 개인정보 처리에는 해당 사업자의 방침이 적용됩니다: Google Analytics·Google Tag Manager·Google AdSense. 또한 뉴스·시세·재무 등 정보는 외부 데이터 제공처의 API를 통해 표시됩니다.',
    s4Title: '4. 동의 철회 및 이용자 권리',
    s4:
      '이용자는 언제든지 브라우저 쿠키를 삭제하거나 로컬 저장 데이터를 초기화하여 저장된 설정을 제거할 수 있습니다. 광고·분석 쿠키 동의는 브라우저 저장소를 삭제하면 초기화되어 다음 방문 시 다시 선택할 수 있습니다.',
    s5Title: '5. 투자 정보 관련 고지',
    s5:
      '본 서비스가 제공하는 모든 정보는 참고용이며 투자 권유·자문이 아닙니다. 투자 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다.',
    s6Title: '6. 문의',
    s6: '개인정보 처리에 관한 문의는 서비스 운영자에게 연락해 주시기 바랍니다. (문의: 운영자 이메일 기재 예정)',
    s7Title: '7. 개정',
    s7: '본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 개정 시 본 페이지를 통해 고지합니다.',
  },
  en: {
    h1: 'Privacy Policy',
    updatedLabel: 'Last updated',
    intro:
      'AntsUp (the “Service”) values your privacy and processes personal data as described below. The Service has no sign-up or login, and does not directly collect or store personal data that identifies you on its servers.',
    s1Title: '1. Information We Collect',
    s1Items: [
      'Browser local storage (localStorage): preferences such as theme, language, up/down colors, and watchlist. This data is stored only in your browser and is not sent to our servers.',
      'Automatically collected data: for analytics and advertising, cookies and similar technologies may collect your device, browser, IP (anonymized), page-usage history, and the like.',
    ],
    s2Title: '2. Cookies and Advertising',
    s2a:
      'The Service may use cookies for visit analytics (Google Analytics / Google Tag Manager) and advertising (Google AdSense). Third-party ad vendors such as Google may use cookies to serve ads based on your prior visits. On your first visit, a consent banner lets you accept or decline advertising/analytics cookies, and you can disable personalized ads in ',
    s2Link: 'Google Ads Settings',
    s2b: '. You can also block or delete cookies in your browser settings.',
    s3Title: '3. Third-Party Services',
    s3:
      'The Service uses the following third-party services, each governed by its own privacy policy: Google Analytics, Google Tag Manager, and Google AdSense. News, prices, financials, and other information are also displayed via APIs from external data providers.',
    s4Title: '4. Withdrawing Consent and Your Rights',
    s4:
      'You may delete browser cookies or reset local storage at any time to remove saved settings. Deleting your browser storage resets your advertising/analytics cookie consent, so you can choose again on your next visit.',
    s5Title: '5. Notice on Investment Information',
    s5:
      'All information provided by the Service is for reference only and is not investment solicitation or advice. Investment decisions and their outcomes are your own responsibility.',
    s6Title: '6. Contact',
    s6: 'For questions about how personal data is handled, please contact the Service operator. (Contact: operator email to be provided.)',
    s7Title: '7. Amendments',
    s7: 'This policy may be amended in line with legal or service changes, and any amendment will be announced on this page.',
  },
  ja: {
    h1: 'プライバシーポリシー',
    updatedLabel: '最終改定日',
    intro:
      'AntsUp（以下「サービス」）は利用者の個人情報を重要と考え、以下のとおり個人情報を取り扱います。本サービスには会員登録・ログイン機能がなく、利用者を識別する個人情報をサーバーに直接収集・保存しません。',
    s1Title: '1. 収集する情報',
    s1Items: [
      'ブラウザのローカル保存（localStorage）：テーマ・言語・上昇下落の色設定、ウォッチリストなど利便性のための設定値。これらのデータは利用者のブラウザにのみ保存され、サーバーには送信されません。',
      '自動収集情報：訪問分析および広告のため、Cookieや類似技術を通じて接続機器・ブラウザ・IP（匿名化）・ページ利用履歴などが収集される場合があります。',
    ],
    s2Title: '2. Cookieと広告',
    s2a:
      '本サービスは訪問統計（Google Analytics / Google Tag Manager）と広告（Google AdSense）のためにCookieを使用することがあります。Googleなど第三者の広告事業者は、Cookieを用いて利用者の過去の訪問履歴に基づく広告を配信することがあります。利用者は初回訪問時に表示される同意バナーで広告・分析Cookieの使用に同意または拒否でき、',
    s2Link: 'Google 広告設定',
    s2b: 'でパーソナライズ広告を無効化できます。またブラウザの設定でCookieをブロック・削除できます。',
    s3Title: '3. 第三者サービス',
    s3:
      '本サービスは以下の第三者サービスを利用し、各サービスの個人情報の取り扱いには当該事業者の方針が適用されます：Google Analytics・Google Tag Manager・Google AdSense。またニュース・株価・財務などの情報は外部データ提供元のAPIを通じて表示されます。',
    s4Title: '4. 同意の撤回および利用者の権利',
    s4:
      '利用者はいつでもブラウザのCookieを削除し、ローカル保存データを初期化して保存された設定を削除できます。広告・分析Cookieの同意はブラウザ保存領域を削除すると初期化され、次回訪問時に再度選択できます。',
    s5Title: '5. 投資情報に関する告知',
    s5:
      '本サービスが提供するすべての情報は参考用であり、投資勧誘・助言ではありません。投資判断とその結果に対する責任は利用者ご本人にあります。',
    s6Title: '6. お問い合わせ',
    s6: '個人情報の取り扱いに関するお問い合わせは、サービス運営者までご連絡ください。（連絡先：運営者メールアドレスは追って記載予定）',
    s7Title: '7. 改定',
    s7: '本方針は法令・サービスの変更に応じて改定されることがあり、改定時は本ページで告知します。',
  },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const c = CONTENT[((raw as Locale) in CONTENT ? (raw as Locale) : 'ko') as Locale];
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{c.h1}</h1>
      <p className="text-sm text-cb-muted mb-8">{c.updatedLabel}: {UPDATED}</p>

      <div className="space-y-7 text-sm leading-relaxed text-cb-foreground/90">
        <section>
          <p className="text-cb-muted">{c.intro}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s1Title}</h2>
          <ul className="list-disc pl-5 space-y-1 text-cb-muted">
            {c.s1Items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s2Title}</h2>
          <p className="text-cb-muted">
            {c.s2a}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cb-accent hover:underline"
            >
              {c.s2Link}
            </a>
            {c.s2b}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s3Title}</h2>
          <p className="text-cb-muted">{c.s3}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s4Title}</h2>
          <p className="text-cb-muted">{c.s4}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s5Title}</h2>
          <p className="text-cb-muted">{c.s5}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s6Title}</h2>
          <p className="text-cb-muted">{c.s6}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s7Title}</h2>
          <p className="text-cb-muted">{c.s7}</p>
        </section>
      </div>
    </div>
  );
}
