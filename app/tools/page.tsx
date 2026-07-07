import type { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS, TOOL_CATEGORIES } from '../../src/domain/tools/catalog';
import { pageMetadata, SITE_URL } from '../../src/config/site';
import JsonLd from '../../src/components/app/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: '투자 도구',
  description: '주린이를 위한 투자 계산기 모음 — 물타기·복리·손절익절·양도세·배당 등 12종. API 없이 바로 계산.',
  path: '/tools',
});

export default function Page() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '투자 도구',
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title,
      url: `${SITE_URL}/tools/${t.slug}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={itemList} />
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">투자 도구</h1>
      <p className="text-cb-muted mb-2 leading-relaxed">
        API 없이 바로 쓰는 투자 계산기 모음. 매매 계획·세금·자산 배분·배당 계산을 도와줍니다.
      </p>

      {TOOL_CATEGORIES.map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="text-sm font-bold text-cb-muted uppercase tracking-wide mb-3">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS.filter((t) => t.category === cat).map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="group glass-panel p-5 hover:border-cb-accent/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="font-bold text-cb-foreground group-hover:text-cb-accent transition-colors">
                  {t.title}
                </h3>
                <p className="mt-1 text-sm text-cb-muted leading-relaxed">{t.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
