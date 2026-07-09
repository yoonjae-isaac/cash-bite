import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS, getTool, pick } from '@/domain/tools/catalog';
import { setRequestLocale } from 'next-intl/server';
import { localeMetadata, localePath, PAGE_SEO, SITE_URL, type Locale } from '@/config/site';
import JsonLd from '@/components/app/JsonLd';
import ToolDetail from '@/components/tools/ToolDetail';

const HOME_LABEL: Record<Locale, string> = { ko: '홈', en: 'Home', ja: 'ホーム' };
const OG_INLANG: Record<Locale, string> = { ko: 'ko', en: 'en', ja: 'ja' };

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return {};
  }
  return localeMetadata({
    locale: locale as Locale,
    path: `/tools/${slug}`,
    title: tool.title,
    description: tool.tagline,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const tool = getTool(slug);
  if (!tool) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: pick(tool.title, locale),
    description: pick(tool.tagline, locale),
    url: `${SITE_URL}${localePath(locale, `/tools/${slug}`)}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    inLanguage: OG_INLANG[locale],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: HOME_LABEL[locale], item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: PAGE_SEO['/tools'].title[locale], item: `${SITE_URL}${localePath(locale, '/tools')}` },
      { '@type': 'ListItem', position: 3, name: pick(tool.title, locale), item: `${SITE_URL}${localePath(locale, `/tools/${slug}`)}` },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />
      <ToolDetail slug={slug} />
    </>
  );
}
