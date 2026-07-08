import type { Metadata } from 'next';
import { ARTICLES } from '../../src/domain/learn/articles';
import { pageMetadata, SITE_URL } from '../../src/config/site';
import JsonLd from '../../src/components/app/JsonLd';
import LearnBoard from '../../src/components/learn/LearnBoard';

export const metadata: Metadata = pageMetadata({
  title: '투자 배우기',
  description:
    '주린이를 위한 투자 학습 — 물타기·복리·손절·배당·거장 13F를 쉽고 짧게. 읽고 바로 계산기로 연습하세요.',
  path: '/learn',
});

export default function Page() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '투자 배우기',
    itemListElement: ARTICLES.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.title,
      url: `${SITE_URL}/learn/${a.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <LearnBoard />
    </>
  );
}
