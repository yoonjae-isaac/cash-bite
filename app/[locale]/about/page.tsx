import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/about', locale as Locale);
}

type Feature = { href: string; label: string; desc: string };
type Content = {
  h1: string;
  intro: string;
  featuresTitle: string;
  features: Feature[];
  sourcesTitle: string;
  sources: string;
  disclaimerTitle: string;
  disclaimerA: string;
  termsLabel: string;
  privacyLabel: string;
  disclaimerB: string;
};

const CONTENT: Record<Locale, Content> = {
  ko: {
    h1: 'AntsUp 소개',
    intro:
      'AntsUp는 주식 투자를 막 시작한 초보 투자자(주린이)를 위한 주식 정보 서비스입니다. 복잡한 정보를 쉽고 빠르게 파악할 수 있도록, 시장 뉴스·투자 거장 포트폴리오·종목 분석·거시지표·경제 캘린더를 한곳에 모았습니다.',
    featuresTitle: '제공 기능',
    features: [
      { href: '/news', label: '시장 뉴스', desc: '국내·미국 증시 뉴스와 AI 요약 다이제스트' },
      { href: '/gurus', label: '거장 포트폴리오', desc: '투자 거장들의 13F 보유 종목과 변화' },
      { href: '/stock', label: '종목 분석', desc: '재무·기술적 지표 분석' },
      { href: '/macro', label: '거시지표', desc: '미국 금리·물가·고용 및 금리 방향 전망' },
      { href: '/calendar', label: '경제 캘린더', desc: '실적·경제지표·IPO 일정' },
    ],
    sourcesTitle: '데이터 출처',
    sources:
      '시세·재무·뉴스·거시 데이터는 공개 데이터 제공처의 API를 통해 표시됩니다. 데이터는 지연되거나 오류가 있을 수 있습니다.',
    disclaimerTitle: '면책',
    disclaimerA:
      '본 서비스의 정보는 참고용이며 투자 권유가 아닙니다. 투자 판단과 책임은 이용자 본인에게 있습니다. 자세한 내용은 ',
    termsLabel: '이용약관',
    privacyLabel: '개인정보처리방침',
    disclaimerB: '을 참고하세요.',
  },
  en: {
    h1: 'About AntsUp',
    intro:
      'AntsUp is a stock information service for beginner investors. To help you grasp complex information quickly and easily, it brings market news, guru portfolios, stock analysis, macro indicators, and an economic calendar together in one place.',
    featuresTitle: 'Features',
    features: [
      { href: '/news', label: 'Market News', desc: 'Korean and U.S. market news with AI-summarized digests' },
      { href: '/gurus', label: 'Guru Portfolios', desc: '13F holdings of great investors and how they change' },
      { href: '/stock', label: 'Stock Analysis', desc: 'Fundamental and technical indicators' },
      { href: '/macro', label: 'Macro Indicators', desc: 'U.S. rates, inflation, employment, and a rate outlook' },
      { href: '/calendar', label: 'Economic Calendar', desc: 'Earnings, economic releases, and IPO schedules' },
    ],
    sourcesTitle: 'Data Sources',
    sources:
      'Prices, financials, news, and macro data are displayed via APIs from public data providers. Data may be delayed or contain errors.',
    disclaimerTitle: 'Disclaimer',
    disclaimerA:
      'The information in this service is for reference only and is not investment advice. Investment decisions and their consequences are your own responsibility. For details, see our ',
    termsLabel: 'Terms of Service',
    privacyLabel: 'Privacy Policy',
    disclaimerB: '.',
  },
  ja: {
    h1: 'AntsUpについて',
    intro:
      'AntsUpは株式投資を始めたばかりの初心者のための株式情報サービスです。複雑な情報を素早く簡単に把握できるよう、市場ニュース・投資の巨匠のポートフォリオ・銘柄分析・マクロ指標・経済カレンダーを一か所に集めました。',
    featuresTitle: '機能',
    features: [
      { href: '/news', label: '市場ニュース', desc: '韓国・米国株式市場のニュースとAI要約ダイジェスト' },
      { href: '/gurus', label: '巨匠のポートフォリオ', desc: '投資の巨匠の13F保有銘柄とその変化' },
      { href: '/stock', label: '銘柄分析', desc: '財務・テクニカル指標の分析' },
      { href: '/macro', label: 'マクロ指標', desc: '米国の金利・物価・雇用と金利見通し' },
      { href: '/calendar', label: '経済カレンダー', desc: '決算・経済指標・IPOの予定' },
    ],
    sourcesTitle: 'データ出典',
    sources:
      '株価・財務・ニュース・マクロデータは公開データ提供元のAPIを通じて表示されます。データは遅延やエラーを含む場合があります。',
    disclaimerTitle: '免責',
    disclaimerA:
      '本サービスの情報は参考用であり、投資勧誘ではありません。投資判断と責任は利用者ご本人にあります。詳しくは',
    termsLabel: '利用規約',
    privacyLabel: 'プライバシーポリシー',
    disclaimerB: 'をご覧ください。',
  },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const c = CONTENT[(raw as Locale) in CONTENT ? (raw as Locale) : 'ko'];
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-6">{c.h1}</h1>

      <div className="space-y-7 text-sm leading-relaxed text-cb-foreground/90">
        <section>
          <p className="text-cb-muted">{c.intro}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-3">{c.featuresTitle}</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-cb-muted">
            {c.features.map((f) => (
              <li key={f.href}>
                <Link href={f.href} className="text-cb-accent hover:underline">
                  {f.label}
                </Link>{' '}
                — {f.desc}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.sourcesTitle}</h2>
          <p className="text-cb-muted">{c.sources}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.disclaimerTitle}</h2>
          <p className="text-cb-muted">
            {c.disclaimerA}
            <Link href="/terms" className="text-cb-accent hover:underline">
              {c.termsLabel}
            </Link>
            {locale_sep(raw as Locale)}
            <Link href="/privacy" className="text-cb-accent hover:underline">
              {c.privacyLabel}
            </Link>
            {c.disclaimerB}
          </p>
        </section>
      </div>
    </div>
  );
}

// 약관/개인정보 링크 사이 연결어(로케일별).
function locale_sep(locale: Locale): string {
  if (locale === 'en') return ' and ';
  if (locale === 'ja') return 'と';
  return '과 ';
}
