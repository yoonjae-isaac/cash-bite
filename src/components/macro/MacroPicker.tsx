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

      {/* 지표: 드롭다운 (PC·모바일 통일). 사용 불가 지표는 option disabled */}
      <div className="relative sm:max-w-xs">
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
    </section>
  );
};

export default MacroPicker;
