import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import InfoHint from '../ui/InfoHint';
import { formatMoney } from '../../domain/market/format';
import type { TechnicalResult } from '../../domain/market/types';

const pct = (n: number): string => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

const formatTurnover = (v: number, currency: string): string => {
  if (currency === 'KRW') {
    if (v >= 1e12) return `${(v / 1e12).toFixed(1)}조원`;
    if (v >= 1e8) return `${Math.round(v / 1e8).toLocaleString()}억원`;
    return `${Math.round(v / 1e4).toLocaleString()}만원`;
  }
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return Math.round(v).toLocaleString();
};

const Card = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-cb-border bg-[var(--cb-input-bg)] p-3">
    <p className="text-[11px] font-semibold text-cb-muted mb-1.5 flex items-center gap-1">
      {label}
      {hint && <InfoHint label={label} content={hint} />}
    </p>
    {children}
  </div>
);

/** 종목 분석 요약 카드 — 가장 가까운 지지/저항·52주 위치·하루 평균 변동폭·변동성. 데이터 기준 배지 포함. */
export default function TechnicalSummary({ data }: { data: TechnicalResult }) {
  const t = useLanguageStore((s) => s.t);
  const tt = t.stock.tech;
  const { currency, series } = data;
  const last = series.length ? series[series.length - 1] : null;
  const cur = last?.close ?? 0;

  const res = data.nearestResistance ?? null;
  const sup = data.nearestSupport ?? null;
  const resPct = res && cur ? (res.price - cur) / cur * 100 : null;
  const supPct = sup && cur ? (sup.price - cur) / cur * 100 : null;
  const pos = data.pos52 ?? null;
  const atr = data.signals.atrPct ?? null;
  const squeeze = data.signals.squeeze ?? false;
  const turnover = last ? last.close * last.volume : 0;

  return (
    <div>
      {data.asOf && (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--cb-hover)] text-cb-muted tabular-nums">
            🕒 {tt.freshBadge} · {data.asOf}
            {data.delayed ? ` · ${tt.freshDelayed}` : ''}
          </span>
          {turnover > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--cb-hover)] text-cb-muted">
              {tt.turnoverLabel} <b className="text-cb-foreground tabular-nums">{formatTurnover(turnover, currency)}</b>
              <InfoHint label={tt.turnoverLabel} content={tt.turnoverHint} />
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 가장 가까운 지지/저항 */}
        <Card label={tt.nearSr} hint={tt.nearSrHint}>
          {res || sup ? (
            <div className="space-y-1">
              {res && (
                <div className="text-sm font-extrabold tabular-nums" style={{ color: 'var(--cb-negative)' }}>
                  {tt.resistance} {formatMoney(res.price, currency)}
                  {resPct != null && <span className="text-[11px] font-semibold text-cb-muted ml-1">({pct(resPct)})</span>}
                </div>
              )}
              {sup && (
                <div className="text-sm font-extrabold tabular-nums" style={{ color: 'var(--cb-positive)' }}>
                  {tt.support} {formatMoney(sup.price, currency)}
                  {supPct != null && <span className="text-[11px] font-semibold text-cb-muted ml-1">({pct(supPct)})</span>}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-cb-muted">{tt.srNone}</p>
          )}
        </Card>

        {/* 52주 위치 게이지 */}
        <Card label={tt.pos52Label} hint={tt.pos52Hint}>
          {pos != null && data.lo52 != null && data.hi52 != null ? (
            <>
              <div className="text-[17px] font-extrabold text-cb-foreground tabular-nums">{Math.round(pos)}%</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[var(--cb-hover)] relative overflow-visible">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${pos}%`, background: 'linear-gradient(90deg, var(--cb-point), var(--cb-accent))' }}
                />
                <span
                  className="absolute top-1/2 w-2.5 h-2.5 rounded-full border-2"
                  style={{ left: `${pos}%`, transform: 'translate(-50%,-50%)', background: 'var(--cb-foreground)', borderColor: 'var(--cb-surface)' }}
                />
              </div>
              <div className="mt-1.5 text-[10.5px] text-cb-muted tabular-nums">
                {formatMoney(data.lo52, currency)} ~ {formatMoney(data.hi52, currency)}
              </div>
            </>
          ) : (
            <p className="text-[12px] text-cb-muted">—</p>
          )}
        </Card>

        {/* 하루 평균 변동폭 (ATR) */}
        <Card label={tt.atrLabel} hint={tt.atrHint}>
          <div className="text-[17px] font-extrabold text-cb-foreground tabular-nums">
            {atr != null ? `± ${atr.toFixed(1)}%` : '—'}
          </div>
        </Card>

        {/* 변동성(스퀴즈) */}
        <Card label={tt.squeezeLabel} hint={tt.squeezeHint}>
          <div className="text-sm font-extrabold" style={{ color: squeeze ? 'var(--cb-ma60)' : 'var(--cb-foreground)' }}>
            {squeeze ? tt.squeezeOn : tt.squeezeOff}
          </div>
        </Card>
      </div>
    </div>
  );
}
