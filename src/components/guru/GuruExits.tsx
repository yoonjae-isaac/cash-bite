import { PackageX } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { GuruExit } from '../../domain/guru/types';
import { formatIssuerName, formatShares, formatUsd13F } from '../../domain/guru/format';

const GuruExits = ({ exits }: { exits: GuruExit[] }) => {
  const t = useLanguageStore((s) => s.t);

  if (exits.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <PackageX className="w-4 h-4 text-cb-negative" />
        <h3 className="text-base font-bold text-cb-foreground">{t.gurus.exitsTitle}</h3>
        <span className="text-sm font-medium text-cb-muted">{exits.length}</span>
      </div>
      <p className="text-xs text-cb-muted mb-4">{t.gurus.exitsHint}</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {exits.map((exit) => (
          <li
            key={`${exit.cusip}:${exit.putCall ?? ''}`}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-cb-border theme-row"
          >
            <div className="min-w-0">
              <span className="block font-semibold text-sm text-cb-foreground truncate">
                {exit.ticker ?? formatIssuerName(exit.nameOfIssuer)}
              </span>
              <span className="block text-[11px] text-cb-muted truncate">
                {formatShares(exit.prevShares)} / {exit.ticker ? formatIssuerName(exit.nameOfIssuer) : exit.titleOfClass}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-sm font-medium text-cb-negative tabular-nums">
                {formatUsd13F(exit.prevValue)}
              </span>
              <span className="block text-[10px] text-cb-muted">{t.gurus.prevValueLabel}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuruExits;
