import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { MacroOverviewRow } from '../../domain/macro/types';
import { changeColorClass, formatChange, formatMacroValue } from '../../domain/macro/format';

/** 카테고리 순서 보존 그룹핑 (카탈로그 순서 = 논리 순서). */
const groupByCategory = (rows: MacroOverviewRow[]): [string, MacroOverviewRow[]][] => {
  const map = new Map<string, MacroOverviewRow[]>();
  for (const row of rows) {
    const c = row.entry.category;
    (map.get(c) ?? map.set(c, []).get(c)!).push(row);
  }
  return [...map.entries()];
};

/** 카테고리 블록 색(순환) — 시안 팔레트. */
const DOT = ['var(--cb-ma60)', 'var(--cb-point)', 'var(--cb-ma5)', 'var(--cb-ma20)', 'var(--cb-ma120)'];

/**
 * 전체 지표 한눈에 — 카테고리 블록을 멀티컬럼(masonry)으로 패킹해 세로 스크롤을 줄인다.
 * 한 줄 = 지표명 · 값 · 변동. 행 클릭 시 상세로.
 */
const MacroOverviewGrid = ({
  rows,
  selectedId,
  onSelect,
}: {
  rows: MacroOverviewRow[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const lang = useLanguageStore((s) => s.language);

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-3">
      {groupByCategory(rows).map(([category, group], gi) => (
        <section
          key={category}
          className="mb-3 break-inside-avoid rounded-2xl border border-cb-border bg-cb-surface p-1.5"
        >
          <div className="flex items-center gap-2 px-2.5 pt-1.5 pb-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: DOT[gi % DOT.length] }} />
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-cb-muted">
              {category}
            </span>
          </div>
          {group.map(({ entry, latest }) => {
            const label = lang === 'ko' ? entry.label : (entry.labelEn ?? entry.label);
            const change = latest.yoyChange != null ? latest.yoyChange : latest.momChange;
            const active = entry.id === selectedId;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                aria-pressed={active}
                className={[
                  'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg transition-colors text-left',
                  active ? 'bg-cb-accent/10' : 'hover:bg-[var(--cb-hover)]',
                ].join(' ')}
              >
                <span className="flex-1 min-w-0 truncate text-[12.5px] text-cb-foreground">
                  {label}
                </span>
                <span className="text-[13px] font-bold text-cb-foreground tabular-nums">
                  {formatMacroValue(latest.value)}
                </span>
                <span
                  className={`w-16 text-right text-[11px] font-bold tabular-nums ${changeColorClass(change)}`}
                >
                  {change != null ? formatChange(change) : ''}
                </span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
};

export default MacroOverviewGrid;
