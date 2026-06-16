import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { GuruHolding, GuruHoldingChange } from '../../domain/guru/types';
import { formatIssuerName, formatShares, formatUsd13F } from '../../domain/guru/format';

const COLLAPSED_COUNT = 15;

const PutCallBadge = ({ putCall }: { putCall: 'Put' | 'Call' }) => {
  const t = useLanguageStore((s) => s.t);
  const isPut = putCall === 'Put';
  return (
    <span
      className={[
        'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold align-middle',
        isPut ? 'bg-cb-negative/15 text-cb-negative' : 'bg-cb-positive/15 text-cb-positive',
      ].join(' ')}
    >
      {isPut ? t.gurus.putBadge : t.gurus.callBadge}
    </span>
  );
};

const ChangeBadge = ({ change }: { change: GuruHoldingChange }) => {
  const t = useLanguageStore((s) => s.t);
  if (change.type === 'unchanged') return null;

  if (change.type === 'new') {
    return (
      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold align-middle bg-cb-accent/15 text-cb-accent">
        {t.gurus.changeNew}
      </span>
    );
  }

  const increased = change.type === 'increased';
  const pct =
    change.sharesDeltaPct !== undefined
      ? ` ${increased ? '+' : ''}${change.sharesDeltaPct.toFixed(1)}%`
      : '';
  return (
    <span
      className={[
        'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold align-middle tabular-nums',
        increased ? 'bg-cb-positive/15 text-cb-positive' : 'bg-cb-negative/15 text-cb-negative',
      ].join(' ')}
    >
      {increased ? t.gurus.changeIncreased : t.gurus.changeDecreased}
      {pct}
    </span>
  );
};

const HoldingsTable = ({ holdings }: { holdings: GuruHolding[] }) => {
  const t = useLanguageStore((s) => s.t);
  const [expanded, setExpanded] = useState(false);

  const rows = expanded ? holdings : holdings.slice(0, COLLAPSED_COUNT);
  const maxWeight = holdings[0]?.weight ?? 0;

  return (
    <div className="glass-panel rounded-xl p-5">
      <h3 className="text-base font-bold text-cb-foreground mb-4">
        {t.gurus.holdingsTitle}
        <span className="ml-2 text-sm font-medium text-cb-muted">{holdings.length}</span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-cb-muted border-b border-cb-border">
              <th className="py-2 pr-2 w-8">{t.gurus.rank}</th>
              <th className="py-2 pr-3">{t.gurus.company}</th>
              <th className="py-2 pr-3 w-[30%] min-w-36">{t.gurus.weight}</th>
              <th className="py-2 pr-3 text-right">{t.gurus.value}</th>
              <th className="py-2 text-right hidden sm:table-cell">{t.gurus.shares}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr
                key={`${h.cusip}:${h.putCall ?? ''}`}
                className="border-b border-cb-border/50 last:border-0 theme-row"
              >
                <td className="py-2.5 pr-2 text-cb-muted tabular-nums">{i + 1}</td>
                <td className="py-2.5 pr-3">
                  <span className="font-semibold text-cb-foreground">
                    {h.ticker ?? formatIssuerName(h.nameOfIssuer)}
                  </span>
                  {h.putCall && <PutCallBadge putCall={h.putCall} />}
                  {h.change && <ChangeBadge change={h.change} />}
                  <span className="block text-[11px] text-cb-muted">
                    {h.ticker ? formatIssuerName(h.nameOfIssuer) : h.titleOfClass}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-cb-border/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cb-accent"
                        style={{ width: `${maxWeight > 0 ? (h.weight / maxWeight) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-14 text-right text-cb-foreground font-medium tabular-nums">
                      {h.weight.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-right text-cb-foreground tabular-nums">
                  {formatUsd13F(h.value)}
                </td>
                <td className="py-2.5 text-right text-cb-muted tabular-nums hidden sm:table-cell">
                  {formatShares(h.shares)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {holdings.length > COLLAPSED_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> {t.gurus.showLess}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> {t.gurus.showAll} ({holdings.length})
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default HoldingsTable;
