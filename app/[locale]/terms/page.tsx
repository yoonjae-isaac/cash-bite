import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/terms', locale as Locale);
}

const UPDATED = '2026-07-07';

type Content = {
  h1: string;
  updatedLabel: string;
  s1Title: string;
  s1: string;
  s2Title: string;
  s2Items: string[];
  s3Title: string;
  s3: string;
  s4Title: string;
  s4: string;
  s5Title: string;
  s5: string;
  s6Title: string;
  s6: string;
};

const CONTENT: Record<Locale, Content> = {
  ko: {
    h1: '이용약관',
    updatedLabel: '최종 개정일',
    s1Title: '1. 서비스의 성격',
    s1:
      'AntsUp(이하 “서비스”)는 주식·거시경제 관련 정보를 제공하는 정보 서비스입니다. 서비스가 제공하는 정보는 참고 목적이며, 특정 종목의 매수·매도 권유나 투자 자문에 해당하지 않습니다.',
    s2Title: '2. 면책',
    s2Items: [
      '서비스는 제3자 데이터 제공처의 정보를 표시하며, 정보의 정확성·완전성·적시성을 보장하지 않습니다.',
      '데이터는 지연되거나 오류가 있을 수 있으며, 이에 근거한 투자 판단과 결과의 책임은 이용자에게 있습니다.',
      '서비스 이용으로 발생한 직간접적 손해에 대해 운영자는 관련 법령이 허용하는 범위에서 책임을 지지 않습니다.',
    ],
    s3Title: '3. 지식재산권',
    s3:
      '서비스의 디자인·로고·구성·콘텐츠에 대한 권리는 운영자 또는 정당한 권리자에게 있으며, 무단 복제·배포를 금합니다. 제3자 데이터의 권리는 각 제공처에 귀속됩니다.',
    s4Title: '4. 금지 행위',
    s4:
      '이용자는 서비스의 정상적 운영을 방해하는 행위(비정상적 자동 수집, 과도한 트래픽 유발, 역공학 등)를 해서는 안 됩니다.',
    s5Title: '5. 서비스 변경·중단',
    s5: '운영자는 서비스의 전부 또는 일부를 사전 고지 없이 변경하거나 중단할 수 있습니다.',
    s6Title: '6. 준거법',
    s6: '본 약관은 대한민국 법령에 따라 해석·적용됩니다.',
  },
  en: {
    h1: 'Terms of Service',
    updatedLabel: 'Last updated',
    s1Title: '1. Nature of the Service',
    s1:
      'AntsUp (the “Service”) is an information service providing stock and macroeconomic information. The information it provides is for reference and does not constitute solicitation to buy or sell any specific security, nor investment advice.',
    s2Title: '2. Disclaimer',
    s2Items: [
      'The Service displays information from third-party data providers and does not guarantee its accuracy, completeness, or timeliness.',
      'Data may be delayed or contain errors; investment decisions based on it and their outcomes are the user’s responsibility.',
      'To the extent permitted by applicable law, the operator is not liable for any direct or indirect damages arising from use of the Service.',
    ],
    s3Title: '3. Intellectual Property',
    s3:
      'Rights to the Service’s design, logo, structure, and content belong to the operator or the rightful owners; unauthorized reproduction or distribution is prohibited. Rights to third-party data belong to their respective providers.',
    s4Title: '4. Prohibited Conduct',
    s4:
      'Users must not engage in conduct that interferes with normal operation of the Service (abnormal automated scraping, excessive traffic, reverse engineering, and the like).',
    s5Title: '5. Changes and Suspension',
    s5: 'The operator may change or suspend all or part of the Service without prior notice.',
    s6Title: '6. Governing Law',
    s6: 'These terms are interpreted and applied under the laws of the Republic of Korea.',
  },
  ja: {
    h1: '利用規約',
    updatedLabel: '最終改定日',
    s1Title: '1. サービスの性質',
    s1:
      'AntsUp（以下「サービス」）は株式・マクロ経済に関する情報を提供する情報サービスです。サービスが提供する情報は参考目的であり、特定銘柄の売買勧誘や投資助言には該当しません。',
    s2Title: '2. 免責',
    s2Items: [
      'サービスは第三者データ提供元の情報を表示し、その正確性・完全性・適時性を保証しません。',
      'データは遅延やエラーを含む場合があり、それに基づく投資判断と結果の責任は利用者にあります。',
      'サービス利用により生じた直接・間接の損害について、運営者は関連法令が許す範囲で責任を負いません。',
    ],
    s3Title: '3. 知的財産権',
    s3:
      'サービスのデザイン・ロゴ・構成・コンテンツに関する権利は運営者または正当な権利者にあり、無断複製・配布を禁じます。第三者データの権利は各提供元に帰属します。',
    s4Title: '4. 禁止行為',
    s4:
      '利用者はサービスの正常な運営を妨げる行為（異常な自動収集、過度なトラフィックの発生、リバースエンジニアリング等）を行ってはなりません。',
    s5Title: '5. サービスの変更・中断',
    s5: '運営者はサービスの全部または一部を事前告知なく変更または中断することができます。',
    s6Title: '6. 準拠法',
    s6: '本規約は大韓民国の法令に従って解釈・適用されます。',
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
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s1Title}</h2>
          <p className="text-cb-muted">{c.s1}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-cb-foreground mb-2">{c.s2Title}</h2>
          <ul className="list-disc pl-5 space-y-1 text-cb-muted">
            {c.s2Items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
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
      </div>
    </div>
  );
}
