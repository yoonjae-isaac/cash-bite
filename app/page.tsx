import HomePage from '../src/views/HomePage';
import JsonLd from '../src/components/app/JsonLd';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '../src/config/site';

// 홈은 섹션별 스크롤 리빌을 자체 처리(HomePage 내부) → 페이지 단위 Reveal 미적용 (기존 App.tsx 동작 그대로).
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'ko',
    },
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={siteJsonLd} />
      <HomePage />
    </>
  );
}
