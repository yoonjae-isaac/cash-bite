'use client';

import { useMemo, useState } from 'react';
import { Layers, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import {
  GURU_STYLE_DESC,
  GURU_STYLE_LABEL,
  GURU_STYLE_ORDER,
  styleOf,
  type GuruStyle,
} from '../domain/guru/investors';
import { splitInvestorName, toQuarterLabel, type GuruOverview } from '../domain/guru/types';
import InvestorCard from '../components/guru/InvestorCard';
import EmptyState from '../components/ui/EmptyState';
import ExplainToggle from '../components/ui/ExplainToggle';
import FilterChips, { type FilterChipOption } from '../components/ui/FilterChips';

type StyleFilter = GuruStyle | 'all';

const GuruIndexPage = ({ overview }: { overview: GuruOverview }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<StyleFilter>('all');

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return overview.investors;
    return overview.investors.filter((inv) => inv.name.toLowerCase().includes(q));
  }, [overview.investors, query]);

  // 칩 건수는 검색 결과 기준 — 검색 후 어떤 스타일에 몇 명 남았는지가 바로 보인다.
  const chips: FilterChipOption<StyleFilter>[] = useMemo(() => {
    const counts = new Map<GuruStyle, number>();
    for (const inv of searched) {
      const s = styleOf(inv.key);
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return [
      { id: 'all' as StyleFilter, label: t.gurus.styleAll, count: searched.length },
      ...GURU_STYLE_ORDER.map((s) => ({
        id: s as StyleFilter,
        label: GURU_STYLE_LABEL[s][lang],
        count: counts.get(s) ?? 0,
      })),
    ];
  }, [searched, t, lang]);

  // 스타일별 섹션 — 'all' 이면 전 스타일을 순서대로, 아니면 선택한 하나만.
  const sections = useMemo(() => {
    const targets = style === 'all' ? GURU_STYLE_ORDER : [style];
    return targets
      .map((s) => ({ style: s, items: searched.filter((inv) => styleOf(inv.key) === s) }))
      .filter((sec) => sec.items.length > 0);
  }, [searched, style]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-cb-foreground md:text-3xl">{t.gurus.title}</h1>
        <p className="mt-1.5 text-cb-muted">{t.gurus.indexSubtitle}</p>
        <p className="mt-2 text-xs text-cb-muted">
          {t.gurus.asOfLabel} {toQuarterLabel(overview.asOf)} · {overview.investors.length}
          {t.gurus.peopleUnit}
        </p>
      </header>

      <Link
        href="/consensus"
        className="glass-panel flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-cb-accent/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cb-accent/15 text-cb-accent">
          <Layers className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold text-cb-foreground">
            {t.gurus.consensusTitle}
          </span>
          <span className="block truncate text-xs text-cb-muted">{t.gurus.consensusSubtitle}</span>
        </span>
      </Link>

      <div className="space-y-3">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cb-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.gurus.searchPlaceholder}
            aria-label={t.gurus.searchPlaceholder}
            className="theme-field w-full rounded-lg py-2.5 pl-9 pr-3 text-sm"
          />
        </label>
        <FilterChips
          options={chips}
          value={style}
          onChange={setStyle}
          ariaLabel={t.gurus.styleAll}
        />
      </div>

      {sections.length === 0 ? (
        <EmptyState message={t.gurus.searchEmpty} />
      ) : (
        sections.map((sec) => (
          <section key={sec.style} className="space-y-3">
            <div>
              <h2 className="flex items-baseline gap-2 text-lg font-bold text-cb-foreground">
                {GURU_STYLE_LABEL[sec.style][lang]}
                <span className="text-sm font-semibold text-cb-muted tabular-nums">
                  {sec.items.length}
                </span>
              </h2>
              <p className="text-xs text-cb-muted">{GURU_STYLE_DESC[sec.style][lang]}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sec.items.map((inv) => (
                <InvestorCard key={inv.cik + splitInvestorName(inv.name).person} item={inv} />
              ))}
            </div>
          </section>
        ))
      )}

      <ExplainToggle label={t.gurus.howToRead}>{t.gurus.howToReadBody}</ExplainToggle>
    </div>
  );
};

export default GuruIndexPage;
