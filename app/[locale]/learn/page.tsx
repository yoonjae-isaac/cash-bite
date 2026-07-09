import type { Metadata } from 'next';
import { getArticles } from '@/domain/learn/articles';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, localePath, PAGE_SEO, SITE_URL, type Locale } from '@/config/site';
import JsonLd from '@/components/app/JsonLd';
import LearnBoard from '@/components/learn/LearnBoard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/learn', locale as Locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const articles = getArticles(locale);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: PAGE_SEO['/learn'].title[locale],
    itemListElement: articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.title,
      url: `${SITE_URL}${localePath(locale, `/learn/${a.slug}`)}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <LearnBoard />
    </>
  );
}
