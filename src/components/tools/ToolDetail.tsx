'use client';

import { Link } from '@/i18n/navigation';
import { ChevronLeft } from 'lucide-react';
import { getTool, pick, TOOLS_UI } from '../../domain/tools/catalog';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import Calculator from './Calculator';
import AveragingCalculator from './AveragingCalculator';

/**
 * 계산기 상세 본문(클라이언트) — 제목·설명·계산식·주의를 사용자 언어로 렌더 + Calculator.
 * (SSR 은 기본 ko 로 프리렌더되어 SEO 확보, 클라이언트에서 사용자 언어로 동기화)
 */
export default function ToolDetail({ slug }: { slug: string }) {
  const lang = useLanguageStore((s) => s.language);
  const tool = getTool(slug);
  if (!tool) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-xs font-semibold text-cb-muted hover:text-cb-accent transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> {pick(TOOLS_UI.back, lang)}
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{pick(tool.title, lang)}</h1>
      <p className="text-sm text-cb-muted mb-6 leading-relaxed">{pick(tool.description, lang)}</p>

      {slug === 'averaging' ? <AveragingCalculator /> : <Calculator slug={slug} />}

      {tool.formula && (
        <p className="mt-4 text-xs text-cb-muted">
          {pick(TOOLS_UI.formula, lang)} ·{' '}
          <span className="font-mono text-cb-foreground/80">{pick(tool.formula, lang)}</span>
        </p>
      )}
      <p className="mt-6 text-[11px] text-cb-muted/70 leading-relaxed">{pick(TOOLS_UI.disclaimer, lang)}</p>
    </div>
  );
}
