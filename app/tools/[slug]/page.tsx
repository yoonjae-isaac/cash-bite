import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TOOLS, getTool } from '../../../src/domain/tools/catalog';
import { pageMetadata, SITE_URL } from '../../../src/config/site';
import Calculator from '../../../src/components/tools/Calculator';
import JsonLd from '../../../src/components/app/JsonLd';

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
  return pageMetadata({ title: tool.title, description: tool.tagline, path: `/tools/${slug}` });
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
    name: tool.title,
    description: tool.tagline,
    url: `${SITE_URL}/tools/${slug}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    inLanguage: 'ko',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <JsonLd data={jsonLd} />
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-xs font-semibold text-cb-muted hover:text-cb-accent transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> 투자 도구
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{tool.title}</h1>
      <p className="text-sm text-cb-muted mb-6 leading-relaxed">{tool.description}</p>

      <Calculator slug={slug} />

      {tool.formula && (
        <p className="mt-4 text-xs text-cb-muted">
          계산식: <span className="font-mono text-cb-foreground/80">{tool.formula}</span>
        </p>
      )}
      <p className="mt-6 text-[11px] text-cb-muted/70 leading-relaxed">
        본 계산기는 참고용이며 세금·수수료 등 실제 값은 증권사·상품·개인 상황에 따라 다를 수 있습니다.
      </p>
    </div>
  );
}
