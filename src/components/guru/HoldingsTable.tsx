import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { GuruHolding, GuruHoldingChange } from '../../domain/guru/types';
import { formatIssuerName, formatShares, formatUsd13F } from '../../domain/guru/format';
import TickerLogo from '../ui/TickerLogo';

const COLLAPSED_COUNT = 15;

const PutCallBadge = ({ putCall }: { putCall: 'Put' | 'Call' }) => {
  const t = useLanguageStore((s) => s.t);
  const isPut = putCall === 'Put';
  return (
    <span
      title={t.glossary.putCall}
      className={[
        'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold align-middle cursor-help',
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

const HoldingsTable = ({
  holdings,
  logos,
}: {
  holdings: GuruHolding[];
  logos?: Record<string, string>;
}) => {
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
              <th className="py-2 pl-3 text-right w-20">{t.gurus.weight}</th>
              <th className="py-2 pl-3 text-right w-24">{t.gurus.value}</th>
              <th className="py-2 pl-3 text-right w-24 hidden sm:table-cell">{t.gurus.shares}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr
                key={`${h.cusip}:${h.putCall ?? ''}`}
                className="border-b border-cb-border/50 last:border-0 theme-row"
              >
                <td className="py-2 pr-2 text-cb-muted tabular-nums">{i + 1}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2.5">
                    <TickerLogo
                      symbol={h.ticker ?? h.nameOfIssuer}
                      src={h.ticker ? logos?.[h.ticker] : undefined}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-cb-foreground">
                          {h.ticker ?? formatIssuerName(h.nameOfIssuer)}
                        </span>
                        {h.putCall && <PutCallBadge putCall={h.putCall} />}
                        {h.change && <ChangeBadge change={h.change} />}
                      </span>
                      <span className="block truncate text-[11px] leading-tight text-cb-muted">
                        {h.ticker ? formatIssuerName(h.nameOfIssuer) : h.titleOfClass}
                      </span>
                      {/* 비중 막대는 종목명 아래 얇은 선으로 — 별도 컬럼을 차지하면 숫자가 밀리고,
                          폭을 좁히면 이름과 숫자 사이가 비어 보여 남는 폭을 그대로 쓴다. */}
                      <span className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-cb-border/50">
                        <span
                          className="block h-full rounded-full bg-cb-accent"
                          style={{ width: `${maxWeight > 0 ? (h.weight / maxWeight) * 100 : 0}%` }}
                        />
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-2 pl-3 text-right font-semibold text-cb-foreground tabular-nums">
                  {h.weight.toFixed(2)}%
                </td>
                <td className="py-2 pl-3 text-right text-cb-foreground tabular-nums">
                  {formatUsd13F(h.value)}
                </td>
                <td className="py-2 pl-3 text-right text-cb-muted tabular-nums hidden sm:table-cell">
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
