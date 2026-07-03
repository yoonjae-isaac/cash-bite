import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { PortfolioBalance } from '../../domain/persona/balance';

const SEG_COLORS = ['var(--cb-ma5)', 'var(--cb-point)', 'var(--cb-ma60)', 'var(--cb-ma120)', '#5b6472'];
const REST_COLOR = '#3a3a43';

const fmtKrw = (n: number): string => `₩ ${n.toLocaleString('en-US')}`;

/** 포트폴리오 총평 — 지표(비중 밸런스, 프론트 계산) + 거장 총평(verdict/checkpoints). */
const PortfolioSummaryPanel = ({
  balance,
  verdict,
  checkpoints,
  displayName,
  usedHoldings,
  reportDate,
}: {
  balance: PortfolioBalance;
  verdict: string;
  checkpoints: string[];
  displayName: string;
  usedHoldings: boolean;
  reportDate?: string;
}) => {
  const t = useLanguageStore((s) => s.t);
  const p = t.persona;

  const shown = balance.weights.slice(0, 5);
  const restWeight = balance.weights.slice(5).reduce((s, w) => s + w.weight, 0);

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-cb-accent/15 text-cb-accent text-xs font-bold shrink-0">
            {displayName.slice(0, 1)}
          </span>
          <span className="text-sm font-bold text-cb-foreground truncate">{p.summaryTitle}</span>
        </div>
        {balance.unified && balance.totalValueKrw != null && (
          <div className="text-right shrink-0">
            <span className="block text-[10px] text-cb-muted">{p.totalValueKrw}</span>
            <span className="text-sm font-extrabold text-cb-foreground tabular-nums">
              {fmtKrw(balance.totalValueKrw)}
            </span>
          </div>
        )}
      </div>

      {/* 지표: 비중 밸런스 */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: 'var(--cb-ma5)' }}>
          {p.balanceTitle}
        </p>
        {balance.unified ? (
          <>
            <div className="flex h-3.5 rounded-lg overflow-hidden gap-0.5 bg-[var(--cb-bg)]">
              {shown.map((w, i) => (
                <span key={w.ticker} style={{ width: `${w.weight}%`, background: SEG_COLORS[i] }} />
              ))}
              {restWeight > 0 && <span style={{ width: `${restWeight}%`, background: REST_COLOR }} />}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {shown.map((w, i) => (
                <span key={w.ticker} className="inline-flex items-center gap-1.5 text-xs text-cb-muted tabular-nums">
                  <i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: SEG_COLORS[i] }} />
                  {w.name} <b className="text-cb-foreground">{w.weight}%</b>
                </span>
              ))}
              {restWeight > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-cb-muted tabular-nums">
                  <i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: REST_COLOR }} />
                  {p.othersLabel.replace('{n}', String(balance.weights.length - 5))}{' '}
                  <b className="text-cb-foreground">{Math.round(restWeight * 10) / 10}%</b>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Chip k={p.concMax} v={`${balance.top1}%`} warn={balance.top1 >= 30} />
              <Chip k={p.concTop3} v={`${balance.top3}%`} warn={balance.top3 >= 60} />
              {balance.marketSplit && (
                <Chip k={p.concMarket} v={`${balance.marketSplit.kr} / ${balance.marketSplit.us}`} />
              )}
              <Chip k={p.concCount} v={`${balance.holdingCount}`} />
            </div>
          </>
        ) : (
          <p className="text-xs text-cb-muted">{p.mixedCurrency}</p>
        )}
      </section>

      {/* 거장 총평 */}
      {verdict && (
        <section className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--cb-point)' }}>
            {p.guruVerdictTitle}
          </p>
          <p className="text-sm text-cb-foreground whitespace-pre-wrap leading-relaxed">{verdict}</p>
          {checkpoints.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {checkpoints.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-cb-muted leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cb-accent shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 pt-2.5 border-t border-cb-border/50 text-[10px] text-cb-muted">
            {usedHoldings ? `${reportDate ?? ''} ${p.basisHoldings}`.trim() : p.basisGeneral}
          </p>
        </section>
      )}
    </div>
  );
};

const Chip = ({ k, v, warn }: { k: string; v: string; warn?: boolean }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-cb-border bg-cb-surface px-2.5 py-1 text-xs tabular-nums">
    <span className="text-cb-muted">{k}</span>
    <b className="text-cb-foreground" style={warn ? { color: 'var(--cb-ma60)' } : undefined}>
      {v}
    </b>
  </span>
);

export default PortfolioSummaryPanel;
