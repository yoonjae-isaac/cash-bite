'use client';

import { Users } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { formatIssuerName } from '../../domain/guru/format';
import { toQuarterLabel, type GuruStatStock } from '../../domain/guru/types';
import SectionHeader from './SectionHeader';

/** 홈 — 여러 거장이 함께 담은 종목 상위. 클릭하면 컨센서스 전체로. */
const ConsensusPreview = ({ stocks, asOf }: { stocks: GuruStatStock[]; asOf: string }) => {
  const t = useLanguageStore((s) => s.t);
  if (stocks.length === 0) {
    return null;
  }

  const max = stocks.reduce((m, s) => Math.max(m, s.holderCount), 0);

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<Users className="h-4 w-4" />}
        title={t.gurus.consensusTitle}
        desc={t.gurus.mostHeldDesc}
        meta={toQuarterLabel(asOf)}
        href="/consensus"
        linkLabel={t.marketNews.viewAll}
      />

      <ol className="space-y-2">
        {stocks.map((s, i) => (
          <li key={s.cusip} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-right text-xs text-cb-muted tabular-nums">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-cb-foreground">
                  {s.ticker ?? formatIssuerName(s.nameOfIssuer)}
                </span>
                <span className="flex shrink-0 items-baseline gap-1">
                  <span className="text-sm font-bold text-cb-accent tabular-nums">
                    {s.holderCount}
                  </span>
                  <span className="text-[11px] text-cb-muted">{t.gurus.holdersUnit}</span>
                  {s.holderDelta !== undefined && (
                    <span
                      title={t.gurus.deltaHint}
                      className={`text-[11px] font-bold tabular-nums ${
                        s.holderDelta > 0 ? 'text-cb-positive' : 'text-cb-negative'
                      }`}
                    >
                      {s.holderDelta > 0 ? `↑${s.holderDelta}` : `↓${Math.abs(s.holderDelta)}`}
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-cb-border/60">
                <div
                  className="h-full rounded-full bg-cb-accent"
                  style={{ width: `${max > 0 ? (s.holderCount / max) * 100 : 0}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ConsensusPreview;
