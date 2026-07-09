import type { Metadata } from 'next';
import { TOOLS, pick } from '@/domain/tools/catalog';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, localePath, PAGE_SEO, SITE_URL, type Locale } from '@/config/site';
import JsonLd from '@/components/app/JsonLd';
import ToolsHub from '@/components/tools/ToolsHub';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/tools', locale as Locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: PAGE_SEO['/tools'].title[locale],
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: pick(t.title, locale),
      url: `${SITE_URL}${localePath(locale, `/tools/${t.slug}`)}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <ToolsHub />
    </>
  );
}
