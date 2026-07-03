import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { formatMoney } from '../../domain/market/format';
import type { TechnicalResult } from '../../domain/market/types';

// viewBox 좌표계 — 컨테이너 폭에 맞춰 균일 스케일.
const VB_W = 1000;
const VB_H = 360;
const M = { t: 14, r: 16, b: 24, l: 58 };
const PW = VB_W - M.l - M.r;
const PH = VB_H - M.t - M.b;
const MIN_DRAG = 20; // 이 미만 드래그는 확대로 보지 않음 (viewBox 단위)

type MaKey = 'ma5' | 'ma20' | 'ma60' | 'ma120';
const MA_KEYS: { key: MaKey; w: number; color: string }[] = [
  { key: 'ma5', w: 5, color: 'var(--cb-ma5)' },
  { key: 'ma20', w: 20, color: 'var(--cb-ma20)' },
  { key: 'ma60', w: 60, color: 'var(--cb-ma60)' },
  { key: 'ma120', w: 120, color: 'var(--cb-ma120)' },
];

/** 축 눈금용 "보기 좋은" 간격 (1·2·5 × 10ⁿ). */
const niceStep = (range: number, ticks: number): number => {
  const raw = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
};

const PriceMaChart = ({ data }: { data: TechnicalResult }) => {
  const t = useLanguageStore((s) => s.t);
  const svgRef = useRef<SVGSVGElement>(null);
  const [type, setType] = useState<'candle' | 'line'>('candle');
  const [visible, setVisible] = useState<Record<MaKey, boolean>>({
    ma5: true,
    ma20: true,
    ma60: true,
    ma120: true,
  });
  const [hover, setHover] = useState<number | null>(null);
  const [zoom, setZoom] = useState<[number, number] | null>(null); // series 절대 인덱스
  const [drag, setDrag] = useState<{ startX: number; curX: number } | null>(null);

  const { series, currency } = data;
  const total = series.length;
  const from = zoom ? zoom[0] : 0;
  const to = zoom ? zoom[1] : total - 1;
  const view = useMemo(() => series.slice(from, to + 1), [series, from, to]);
  const n = view.length;

  const geo = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const p of view) {
      const lo = type === 'candle' ? p.low : p.close;
      const hi = type === 'candle' ? p.high : p.close;
      if (lo < min) min = lo;
      if (hi > max) max = hi;
    }
    for (const m of MA_KEYS) {
      if (!visible[m.key]) continue;
      for (const p of view) {
        const v = p[m.key];
        if (v == null) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    const pad = (max - min) * 0.07 || 1;
    min -= pad;
    max += pad;
    const X = (i: number) => M.l + (n <= 1 ? PW / 2 : (i / (n - 1)) * PW);
    const Y = (v: number) => M.t + (1 - (v - min) / (max - min)) * PH;
    return { min, max, X, Y };
  }, [view, type, visible, n]);

  const { min, max, X, Y } = geo;

  const yTicks = useMemo(() => {
    const step = niceStep(max - min, 4);
    const ticks: number[] = [];
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
    return ticks;
  }, [min, max]);

  const xLabels = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    let lastMonth = -1;
    view.forEach((p, i) => {
      const m = Number(p.date.slice(5, 7));
      if (m !== lastMonth && i > 1 && i < n - 3) {
        lastMonth = m;
        out.push({ x: X(i), label: `${m}` });
      }
    });
    return out;
  }, [view, X, n]);

  const cw = Math.max(1, Math.min(13, (PW / Math.max(1, n)) * 0.62));
  const axisFmt = (v: number) => {
    const sym = currency === 'USD' ? '$' : currency === 'KRW' ? '₩' : currency === 'JPY' ? '¥' : '';
    return sym + Math.round(v).toLocaleString();
  };

  // 포인터 x → viewBox x (플롯 영역으로 clamp)
  const toVbX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return M.l;
    const r = svg.getBoundingClientRect();
    const px = (clientX - r.left) * (VB_W / r.width);
    return Math.max(M.l, Math.min(M.l + PW, px));
  };
  const xToIndex = (vbX: number): number =>
    Math.max(0, Math.min(n - 1, Math.round(((vbX - M.l) / PW) * (n - 1))));

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (n < 4) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const x = toVbX(e.clientX);
    setDrag({ startX: x, curX: x });
    setHover(null);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (n === 0) return;
    const x = toVbX(e.clientX);
    if (drag) {
      setDrag({ startX: drag.startX, curX: x });
    } else {
      setHover(xToIndex(x));
    }
  };
  const onUp = () => {
    if (drag) {
      const a = xToIndex(drag.startX);
      const b = xToIndex(drag.curX);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (Math.abs(drag.curX - drag.startX) >= MIN_DRAG && hi - lo >= 2) {
        setZoom([from + lo, from + hi]); // 현재 view 인덱스 → series 절대 인덱스
      }
      setDrag(null);
    }
  };
  const onLeave = () => {
    if (!drag) setHover(null);
  };

  const toggleMa = (key: MaKey) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  const hp = hover != null ? view[hover] : null;
  const hoverX = hover != null ? X(hover) : 0;
  const rawPct = (hoverX / VB_W) * 100;
  const tipTransform = rawPct < 18 ? 'translateX(0)' : rawPct > 82 ? 'translateX(-100%)' : 'translateX(-50%)';

  const seg = (active: boolean) =>
    [
      'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
      active ? 'bg-cb-accent text-cb-on-accent' : 'text-cb-muted hover:text-cb-foreground',
    ].join(' ');

  return (
    <div>
      {/* 상단 컨트롤: 확대 상태/힌트 · 캔들/라인 토글 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-[11px] text-cb-muted min-w-0">
          {zoom ? (
            <button
              type="button"
              onClick={() => setZoom(null)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-accent/40 font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t.stock.tech.zoomReset}
            </button>
          ) : (
            <span className="hidden sm:inline">{t.stock.tech.zoomHint}</span>
          )}
        </div>
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--cb-input-bg)] shrink-0">
          <button type="button" onClick={() => setType('candle')} className={seg(type === 'candle')}>
            {t.stock.tech.typeCandle}
          </button>
          <button type="button" onClick={() => setType('line')} className={seg(type === 'line')}>
            {t.stock.tech.typeLine}
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block touch-none select-none"
          role="img"
          aria-label={t.stock.tech.chartTitle}
          style={{ cursor: drag ? 'ew-resize' : 'crosshair' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onLeave}
        >
          {/* Y 그리드 + 라벨 */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={M.l}
                x2={M.l + PW}
                y1={Y(v)}
                y2={Y(v)}
                style={{ stroke: 'var(--cb-border-subtle)' }}
                strokeWidth={1}
              />
              <text
                x={M.l - 8}
                y={Y(v) + 3.5}
                textAnchor="end"
                style={{ fill: 'var(--cb-muted)', fontSize: 11 }}
                className="tabular-nums"
              >
                {axisFmt(v)}
              </text>
            </g>
          ))}

          {/* X 월 라벨 */}
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={VB_H - 7}
              textAnchor="middle"
              style={{ fill: 'var(--cb-muted)', fontSize: 11 }}
              className="tabular-nums"
            >
              {l.label}
            </text>
          ))}

          {/* 캔들 or 라인 */}
          {type === 'candle'
            ? view.map((p, i) => {
                const up = p.close >= p.open;
                const col = up ? 'var(--cb-positive)' : 'var(--cb-negative)';
                const bodyTop = Y(Math.max(p.open, p.close));
                const bodyBot = Y(Math.min(p.open, p.close));
                const x = X(i);
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={Y(p.high)} y2={Y(p.low)} style={{ stroke: col }} strokeWidth={1} />
                    <rect
                      x={x - cw / 2}
                      y={bodyTop}
                      width={cw}
                      height={Math.max(1, bodyBot - bodyTop)}
                      style={{ fill: col }}
                    />
                  </g>
                );
              })
            : (
                <polyline
                  points={view.map((p, i) => `${X(i).toFixed(1)},${Y(p.close).toFixed(1)}`).join(' ')}
                  fill="none"
                  style={{ stroke: 'var(--cb-foreground)' }}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

          {/* 이동평균선 */}
          {MA_KEYS.map((m) =>
            visible[m.key] ? (
              <polyline
                key={m.key}
                points={view
                  .map((p, i) => (p[m.key] == null ? '' : `${X(i).toFixed(1)},${Y(p[m.key] as number).toFixed(1)}`))
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                style={{ stroke: m.color }}
                strokeWidth={1.4}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.95}
              />
            ) : null,
          )}

          {/* 최신 종가 끝점 강조 (전체 마지막 봉이 보일 때만) */}
          {n > 0 && to === total - 1 && (
            <circle cx={X(n - 1)} cy={Y(view[n - 1].close)} r={3.4} style={{ fill: 'var(--cb-foreground)' }} />
          )}

          {/* 드래그 선택 영역 */}
          {drag && (
            <rect
              x={Math.min(drag.startX, drag.curX)}
              y={M.t}
              width={Math.abs(drag.curX - drag.startX)}
              height={PH}
              style={{ fill: 'var(--cb-accent)' }}
              opacity={0.12}
            />
          )}

          {/* 크로스헤어 + 호버 점 (드래그 중 아님) */}
          {hp && !drag && (
            <>
              <line
                x1={hoverX}
                x2={hoverX}
                y1={M.t}
                y2={M.t + PH}
                style={{ stroke: 'var(--cb-muted)' }}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {type === 'line' && (
                <circle cx={hoverX} cy={Y(hp.close)} r={3} style={{ fill: 'var(--cb-foreground)' }} />
              )}
              {MA_KEYS.map((m) =>
                visible[m.key] && hp[m.key] != null ? (
                  <circle key={m.key} cx={hoverX} cy={Y(hp[m.key] as number)} r={3} style={{ fill: m.color }} />
                ) : null,
              )}
            </>
          )}
        </svg>

        {/* 호버 툴팁 — 1열 레이아웃(줄바꿈 금지)으로 금액 넘침 방지 */}
        {hp && !drag && (
          <div
            className="absolute top-1 z-10 pointer-events-none rounded-lg border px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${rawPct}%`,
              transform: tipTransform,
              background: 'var(--cb-surface)',
              borderColor: 'var(--cb-border-strong)',
              minWidth: 168,
            }}
          >
            <div className="text-cb-muted mb-1.5 tabular-nums">{hp.date}</div>
            <div className="space-y-0.5 tabular-nums">
              {type === 'candle' ? (
                <>
                  <TipRow label={t.stock.tech.tOpen} value={formatMoney(hp.open, currency)} />
                  <TipRow label={t.stock.tech.tHigh} value={formatMoney(hp.high, currency)} />
                  <TipRow label={t.stock.tech.tLow} value={formatMoney(hp.low, currency)} />
                  <TipRow label={t.stock.tech.tClose} value={formatMoney(hp.close, currency)} />
                </>
              ) : (
                <TipRow label={t.stock.tech.closeLabel} value={formatMoney(hp.close, currency)} />
              )}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-cb-border space-y-0.5 tabular-nums">
              {MA_KEYS.map((m) =>
                visible[m.key] && hp[m.key] != null ? (
                  <div key={m.key} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-cb-muted whitespace-nowrap">
                      <span className="w-2.5 h-[3px] rounded-sm" style={{ background: m.color }} />
                      {m.w}
                      {t.stock.tech.maUnit}
                    </span>
                    <b className="text-cb-foreground font-semibold whitespace-nowrap">
                      {formatMoney(hp[m.key] as number, currency)}
                    </b>
                  </div>
                ) : null,
              )}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-cb-border space-y-0.5 tabular-nums">
              {hp.rsi != null && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cb-muted whitespace-nowrap">RSI</span>
                  <b className="text-cb-foreground font-semibold">{hp.rsi.toFixed(0)}</b>
                </div>
              )}
              {hp.volume > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cb-muted whitespace-nowrap">{t.stock.tech.tVolume}</span>
                  <b className="text-cb-foreground font-semibold">{hp.volume.toLocaleString()}</b>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 범례 (MA 표시 토글) */}
      <div className="flex flex-wrap gap-2 mt-3.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-cb-border text-cb-muted">
          <span className="w-3.5 h-[3px] rounded-sm" style={{ background: 'var(--cb-foreground)' }} />
          {t.stock.tech.closeLabel}
        </span>
        {MA_KEYS.map((m) => {
          const on = visible[m.key];
          const lastVal = view.length ? view[view.length - 1][m.key] : null;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMa(m.key)}
              aria-pressed={on}
              className={[
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-opacity',
                'border-cb-border text-cb-foreground bg-[var(--cb-input-bg)]',
                on ? '' : 'opacity-40',
              ].join(' ')}
            >
              <span className="w-3.5 h-[3px] rounded-sm" style={{ background: m.color }} />
              {m.w}
              {t.stock.tech.maUnit}
              <span className="text-cb-muted tabular-nums">
                {lastVal == null ? '' : formatMoney(lastVal, currency)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TipRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-cb-muted whitespace-nowrap">{label}</span>
    <b className="text-cb-foreground font-semibold whitespace-nowrap">{value}</b>
  </div>
);

export default PriceMaChart;
