import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS, getTool } from '../../../src/domain/tools/catalog';
import { pageMetadata, SITE_URL } from '../../../src/config/site';
import JsonLd from '../../../src/components/app/JsonLd';
import ToolDetail from '../../../src/components/tools/ToolDetail';

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return {};
  }
  // 메타데이터는 SSR/SEO 상 기본 ko 기준 (로케일-in-URL 은 후속).
  return pageMetadata({ title: tool.title.ko, description: tool.tagline.ko, path: `/tools/${slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title.ko,
    description: tool.tagline.ko,
    url: `${SITE_URL}/tools/${slug}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    inLanguage: 'ko',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '투자 도구', item: `${SITE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.title.ko, item: `${SITE_URL}/tools/${slug}` },
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
