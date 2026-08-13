'use client';

import { LineChart } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { changeColorClass, formatChange, formatMacroValue } from '../../domain/macro/format';
import type { MacroOverviewRow } from '../../domain/macro/types';
import SectionHeader from './SectionHeader';

/**
 * 단위 표기 — FRED 단위 문자열('Index 1982-84=100' 등)은 타일에 넣기엔 길어 잘린다.
 * 값만으로 오해가 생기는 퍼센트·달러만 기호로 붙이고 나머지는 생략한다(라벨로 충분).
 */
function unitAffix(unit: string): { prefix: string; suffix: string } {
  const u = unit.toLowerCase();
  if (u.startsWith('percent')) {
    return { prefix: '', suffix: '%' };
  }
  if (u.startsWith('dollars')) {
    return { prefix: '$', suffix: '' };
  }
  return { prefix: '', suffix: '' };
}

/** 홈 — 핵심 거시지표 타일. 값과 전년 대비 변동만 보여주고 상세는 거시지표 페이지로. */
const MacroPreview = ({ rows }: { rows: MacroOverviewRow[] }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<LineChart className="h-4 w-4" />}
        title={t.nav.macro}
        desc={t.macro.subtitle}
        href="/macro"
        linkLabel={t.marketNews.viewAll}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(({ entry, latest }) => {
          const { prefix, suffix } = unitAffix(entry.unit);
          return (
          <div key={entry.id} className="rounded-xl bg-[var(--cb-row-bg)] px-3 py-2.5">
            <p className="truncate text-[11px] text-cb-muted">
              {lang === 'ko' ? entry.label : (entry.labelEn ?? entry.label)}
            </p>
            <p className="mt-0.5 truncate text-base font-bold text-cb-foreground tabular-nums">
              {prefix}
              {formatMacroValue(latest.value)}
              {suffix}
            </p>
            {latest.yoyChange !== null && (
              <p className={`text-[11px] font-semibold tabular-nums ${changeColorClass(latest.yoyChange)}`}>
                {formatChange(latest.yoyChange)}
                <span className="ml-1 font-normal text-cb-muted">{t.macro.yoy}</span>
              </p>
            )}
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default MacroPreview;
