import HomePage from '@/views/HomePage';
import JsonLd from '@/components/app/JsonLd';
import { setRequestLocale } from 'next-intl/server';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION_LOC, localePath, type Locale } from '@/config/site';

const OG_INLANG: Record<Locale, string> = { ko: 'ko', en: 'en', ja: 'ja' };

// 홈은 섹션별 스크롤 리빌을 자체 처리(HomePage 내부) → 페이지 단위 Reveal 미적용 (기존 App.tsx 동작 그대로).
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}${localePath(locale, '/')}`,
        description: SITE_DESCRIPTION_LOC[locale],
        inLanguage: OG_INLANG[locale],
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={siteJsonLd} />
      <HomePage />
    </>
  );
}
