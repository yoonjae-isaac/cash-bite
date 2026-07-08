'use client';

import Link from 'next/link';
import { TOOLS, CATEGORY_ORDER, CATEGORY_LABEL, TOOLS_UI, pick } from '../../domain/tools/catalog';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

/** 투자 도구 허브(클라이언트) — 카테고리별 계산기 카드. 사용자 언어로 렌더. */
export default function ToolsHub() {
  const lang = useLanguageStore((s) => s.language);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{pick(TOOLS_UI.hubTitle, lang)}</h1>
      <p className="text-cb-muted mb-2 leading-relaxed">{pick(TOOLS_UI.hubSubtitle, lang)}</p>

      {CATEGORY_ORDER.map((cat) => {
        const items = TOOLS.filter((t) => t.category === cat);
        if (!items.length) {
          return null;
        }
        return (
          <section key={cat} className="mt-8">
            <h2 className="text-sm font-bold text-cb-muted uppercase tracking-wide mb-3">
              {pick(CATEGORY_LABEL[cat], lang)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group glass-panel p-5 hover:border-cb-accent/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <h3 className="font-bold text-cb-foreground group-hover:text-cb-accent transition-colors">
                    {pick(t.title, lang)}
                  </h3>
                  <p className="mt-1 text-sm text-cb-muted leading-relaxed">{pick(t.tagline, lang)}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
