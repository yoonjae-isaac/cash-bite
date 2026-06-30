import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMacroStore } from '../../application/macro/useMacroStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const MacroPicker = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const catalog = useMacroStore((s) => s.catalog);
  const selectedId = useMacroStore((s) => s.selectedId);
  const selectSeries = useMacroStore((s) => s.selectSeries);
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set(catalog.map((c) => c.category));
    return [...set];
  }, [catalog]);

  const filtered = useMemo(
    () => (category === 'all' ? catalog : catalog.filter((c) => c.category === category)),
    [catalog, category]
  );

  if (catalog.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('all')}
          className={[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            category === 'all'
              ? 'bg-cb-accent text-cb-on-accent'
              : 'border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-accent/40',
          ].join(' ')}
        >
          {t.macro.allCategories}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              category === c
                ? 'bg-cb-accent text-cb-on-accent'
                : 'border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-accent/40',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 지표: 모바일 드롭다운 (칩 수가 많아 좁은 화면에서 세로 점유 큼) */}
      <div className="relative sm:hidden">
        <select
          value={selectedId}
          onChange={(e) => selectSeries(e.target.value)}
          aria-label={t.macro.title}
          className="w-full appearance-none bg-cb-surface border border-cb-border rounded-lg px-3 py-2.5 pr-9 text-sm font-semibold text-cb-foreground focus:outline-none focus:border-cb-accent/50"
        >
          {filtered.map((entry) => (
            <option key={entry.id} value={entry.id} disabled={!entry.isAvailable}>
              {lang === 'ko' ? entry.label : (entry.labelEn ?? entry.label)}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-cb-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 지표: 데스크톱 칩 */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {filtered.map((entry) => {
          const active = entry.id === selectedId;
          const disabled = !entry.isAvailable;
          const label = lang === 'ko' ? entry.label : (entry.labelEn ?? entry.label);
          return (
            <button
              key={entry.id}
              onClick={() => !disabled && selectSeries(entry.id)}
              disabled={disabled}
              aria-pressed={active}
              title={disabled ? t.macro.unavailable : entry.description}
              className={[
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                disabled
                  ? 'border-cb-border text-cb-muted/50 cursor-not-allowed line-through'
                  : active
                    ? 'border-cb-accent bg-cb-accent/10 text-cb-accent shadow-[0_0_0_1px_var(--cb-accent)]'
                    : 'border-cb-border text-cb-foreground hover:border-cb-accent/40 hover:bg-[var(--cb-hover)]',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MacroPicker;
