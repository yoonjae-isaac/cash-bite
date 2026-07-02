import { ChevronDown } from 'lucide-react';
import { useGuruStore } from '../../application/guru/useGuruStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const InvestorPicker = () => {
  const t = useLanguageStore((s) => s.t);
  const investors = useGuruStore((s) => s.investors);
  const selectedKey = useGuruStore((s) => s.selectedKey);
  const selectInvestor = useGuruStore((s) => s.selectInvestor);

  if (investors.length === 0) return null;

  return (
    <section aria-label={t.gurus.pickerLabel}>
      <p className="text-sm font-medium text-cb-muted mb-2 ml-1">{t.gurus.pickerLabel}</p>

      {/* 드롭다운 (PC·모바일 통일) */}
      <div className="relative sm:max-w-xs">
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
    </section>
  );
};

export default InvestorPicker;
