import { ChevronDown } from 'lucide-react';
import { useGuruStore } from '../../application/guru/useGuruStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { splitInvestorName } from '../../domain/guru/types';

const InvestorPicker = () => {
  const t = useLanguageStore((s) => s.t);
  const investors = useGuruStore((s) => s.investors);
  const selectedKey = useGuruStore((s) => s.selectedKey);
  const selectInvestor = useGuruStore((s) => s.selectInvestor);

  if (investors.length === 0) return null;

  return (
    <section aria-label={t.gurus.pickerLabel}>
      <p className="text-sm font-medium text-cb-muted mb-2 ml-1">{t.gurus.pickerLabel}</p>

      {/* 모바일: 드롭다운 (칩 수가 많아 좁은 화면에서 세로 점유 큼) */}
      <div className="relative sm:hidden">
        <select
          value={selectedKey}
          onChange={(e) => selectInvestor(e.target.value)}
          aria-label={t.gurus.pickerLabel}
          className="w-full appearance-none bg-cb-surface border border-cb-border rounded-lg px-3 py-2.5 pr-9 text-sm font-semibold text-cb-foreground focus:outline-none focus:border-cb-accent/50"
        >
          {investors.map((inv) => (
            <option key={inv.key} value={inv.key}>
              {inv.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-cb-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 데스크톱: 칩 */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {investors.map((inv) => {
          const { firm, person } = splitInvestorName(inv.name);
          const active = inv.key === selectedKey;
          return (
            <button
              key={inv.key}
              onClick={() => selectInvestor(inv.key)}
              aria-pressed={active}
              className={[
                'px-3 py-1.5 rounded-full border text-left transition-all duration-150',
                active
                  ? 'border-cb-accent bg-cb-accent/12 shadow-[0_0_0_1px_var(--cb-accent)]'
                  : 'border-cb-border hover:border-cb-accent/40 hover:bg-[var(--cb-hover)]',
              ].join(' ')}
            >
              <span
                className={[
                  'block text-sm font-semibold leading-tight',
                  active ? 'text-cb-accent' : 'text-cb-foreground',
                ].join(' ')}
              >
                {person}
              </span>
              <span className="block text-[11px] text-cb-muted leading-tight">{firm}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default InvestorPicker;
