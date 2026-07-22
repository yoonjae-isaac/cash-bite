import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import InfoHint from '../ui/InfoHint';
import { formatMoney } from '../../domain/market/format';
import type { TechnicalResult } from '../../domain/market/types';

// viewBox 좌표계 — 컨테이너 폭에 맞춰 균일 스케일.
const VB_W = 1000;
const VB_H = 360;
const M = { t: 14, r: 16, b: 24, l: 58 };
const PW = VB_W - M.l - M.r;
const PH = VB_H - M.t - M.b;
const MIN_DRAG = 20; // 이 미만 드래그는 확대로 보지 않음 (viewBox 단위)
// 서브차트(거래량·RSI) — 가격 차트와 X축 정렬 위해 같은 VB_W·좌우 마진 사용. 상단 라벨/하단 여백.
const VOL_H = 110;
const RSI_H = 120;
const SUB_TOP = 16;
const SUB_BOT = 8;

type MaKey = 'ma5' | 'ma20' | 'ma60' | 'ma120';
const MA_KEYS: { key: MaKey; w: number; color: string }[] = [
  { key: 'ma5', w: 5, color: 'var(--cb-ma5)' },
  { key: 'ma20', w: 20, color: 'var(--cb-ma20)' },
  { key: 'ma60', w: 60, color: 'var(--cb-ma60)' },
  { key: 'ma120', w: 120, color: 'var(--cb-ma120)' },
];

type Mode = 'beginner' | 'advanced';
// 초보 모드 = 핵심만(캔들 + 20일선). 나머지 이평선·RSI는 '자세히'에서.
const BEGINNER_VIS: Record<MaKey, boolean> = { ma5: false, ma20: true, ma60: false, ma120: false };

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
  const [mode, setMode] = useState<Mode>('beginner');
  const [visible, setVisible] = useState<Record<MaKey, boolean>>({
    ma5: true,
    ma20: true,
    ma60: true,
    ma120: true,
  });
  const [hover, setHover] = useState<number | null>(null);
  const [zoom, setZoom] = useState<[number, number] | null>(null); // series 절대 인덱스
  const [drag, setDrag] = useState<{ startX: number; curX: number } | null>(null);
  // 자세히 모드 오버레이 토글 — 볼린저 / 지지·저항 / 라운드넘버
  const [overlay, setOverlay] = useState({ bb: false, sr: true, round: false });

  const { series, currency } = data;
  const total = series.length;
  const from = zoom ? zoom[0] : 0;
  const to = zoom ? zoom[1] : total - 1;
  const view = useMemo(() => series.slice(from, to + 1), [series, from, to]);
  const n = view.length;

  // 표시 이평선 — 초보 모드는 20일선만, 자세히 모드는 사용자 토글을 따름.
  const effVisible = mode === 'beginner' ? BEGINNER_VIS : visible;

  // 거래량 20일 이동평균 (series 전체 기준 → view 로 인덱싱).
  const volMa = useMemo(() => {
    const w = 20;
    const out: (number | null)[] = new Array<number | null>(series.length).fill(null);
    let sum = 0;
    for (let i = 0; i < series.length; i++) {
      sum += series[i].volume;
      if (i >= w) sum -= series[i - w].volume;
      if (i >= w - 1) out[i] = sum / w;
    }
    return out;
  }, [series]);

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
      if (!effVisible[m.key]) continue;
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
  }, [view, type, effVisible, n]);

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

  // 서브차트 Y 스케일
  const maxVol = useMemo(() => Math.max(1, ...view.map((p) => p.volume)), [view]);
  const yVol = (v: number) => VOL_H - SUB_BOT - (v / maxVol) * (VOL_H - SUB_BOT - SUB_TOP);
  const yRsi = (r: number) => SUB_TOP + (1 - r / 100) * (RSI_H - SUB_BOT - SUB_TOP);

  // 자세히 마커 — 골든/데드 크로스(ma5×ma20) 위치 + 고점권 대량 윗꼬리 봉
  const markers = useMemo(() => {
    let cross: { i: number; kind: 'golden' | 'dead' } | null = null;
    for (let i = 1; i < n; i++) {
      const a0 = view[i - 1].ma5;
      const b0 = view[i - 1].ma20;
      const a1 = view[i].ma5;
      const b1 = view[i].ma20;
      if (a0 == null || b0 == null || a1 == null || b1 == null) continue;
      const d0 = a0 - b0;
      const d1 = a1 - b1;
      if (d0 <= 0 && d1 > 0) cross = { i, kind: 'golden' };
      else if (d0 >= 0 && d1 < 0) cross = { i, kind: 'dead' };
    }
    const avgVol = n ? view.reduce((s, p) => s + p.volume, 0) / n : 0;
    const recentHigh = n ? Math.max(...view.map((p) => p.high)) : 0;
    let wick: number | null = null;
    for (let i = 0; i < n; i++) {
      const p = view[i];
      const range = p.high - p.low;
      const upper = p.high - Math.max(p.open, p.close);
      if (range > 0 && avgVol > 0 && p.volume > avgVol * 1.8 && upper > range * 0.6 && p.high >= recentHigh * 0.97) {
        wick = i;
      }
    }
    return { cross, wick };
  }, [view, n]);

  // 라운드넘버(심리적 가격대) — 도메인 내 딱 떨어지는 가격 몇 개
  const roundLevels = useMemo(() => {
    const unit = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.max(1, (max + min) / 2)))));
    const out: number[] = [];
    for (let v = Math.ceil(min / unit) * unit; v <= max; v += unit) out.push(v);
    return out.slice(0, 4);
  }, [min, max]);

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
  const showCrosshair = hp != null && !drag;

  const seg = (active: boolean) =>
    [
      'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
      active ? 'bg-cb-accent text-cb-on-accent' : 'text-cb-muted hover:text-cb-foreground',
    ].join(' ');

  return (
    <div>
      {/* 상단 컨트롤: 초보/자세히 · 확대 · 캔들/라인 */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--cb-input-bg)] shrink-0">
            <button type="button" onClick={() => setMode('beginner')} className={seg(mode === 'beginner')}>
              {t.stock.tech.modeBeginner}
            </button>
            <button type="button" onClick={() => setMode('advanced')} className={seg(mode === 'advanced')}>
              {t.stock.tech.modeAdvanced}
            </button>
          </div>
          {zoom && (
            <button
              type="button"
              onClick={() => setZoom(null)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-cb-border text-[11px] text-cb-muted hover:text-cb-foreground hover:border-cb-accent/40 font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t.stock.tech.zoomReset}
            </button>
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

          {/* 자세히 오버레이 (캔들 뒤) — 지지/저항 띠 · 라운드넘버 · 볼린저밴드 */}
          {mode === 'advanced' &&
            overlay.sr &&
            (data.levels ?? [])
              .filter((l) => l.price >= min && l.price <= max)
              .slice(0, 4)
              .map((l, idx) => {
                const half = l.price * 0.008;
                const col = l.kind === 'resistance' ? 'var(--cb-negative)' : 'var(--cb-positive)';
                return (
                  <g key={`sr${idx}`}>
                    <rect
                      x={M.l}
                      y={Math.min(Y(l.price + half), Y(l.price - half))}
                      width={PW}
                      height={Math.abs(Y(l.price - half) - Y(l.price + half))}
                      style={{ fill: col }}
                      opacity={0.12}
                    />
                    <text x={M.l + 4} y={Y(l.price) - 2} style={{ fill: col, fontSize: 10, fontWeight: 700 }}>
                      {l.kind === 'resistance' ? t.stock.tech.resistance : t.stock.tech.support}
                    </text>
                  </g>
                );
              })}
          {mode === 'advanced' &&
            overlay.round &&
            roundLevels.map((v, idx) => (
              <line
                key={`rn${idx}`}
                x1={M.l}
                x2={M.l + PW}
                y1={Y(v)}
                y2={Y(v)}
                style={{ stroke: 'var(--cb-border-strong)' }}
                strokeWidth={1}
                strokeDasharray="1 5"
              />
            ))}
          {mode === 'advanced' &&
            overlay.bb &&
            (() => {
              const up: string[] = [];
              const lo: string[] = [];
              const mid: string[] = [];
              view.forEach((p, i) => {
                if (p.bbUpper != null) up.push(`${X(i).toFixed(1)},${Y(p.bbUpper).toFixed(1)}`);
                if (p.bbLower != null) lo.push(`${X(i).toFixed(1)},${Y(p.bbLower).toFixed(1)}`);
                if (p.bbMid != null) mid.push(`${X(i).toFixed(1)},${Y(p.bbMid).toFixed(1)}`);
              });
              if (up.length < 2 || lo.length < 2) return null;
              return (
                <g>
                  <path
                    d={`M${up.join(' L')} L${[...lo].reverse().join(' L')} Z`}
                    style={{ fill: 'var(--cb-point)' }}
                    opacity={0.08}
                  />
                  <polyline points={up.join(' ')} fill="none" style={{ stroke: 'var(--cb-point)' }} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                  <polyline points={lo.join(' ')} fill="none" style={{ stroke: 'var(--cb-point)' }} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                  <polyline points={mid.join(' ')} fill="none" style={{ stroke: 'var(--cb-point)' }} strokeWidth={1} opacity={0.4} />
                </g>
              );
            })()}

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
            effVisible[m.key] ? (
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
          {showCrosshair && (
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
              {type === 'line' && hp && (
                <circle cx={hoverX} cy={Y(hp.close)} r={3} style={{ fill: 'var(--cb-foreground)' }} />
              )}
              {hp &&
                MA_KEYS.map((m) =>
                  effVisible[m.key] && hp[m.key] != null ? (
                    <circle key={m.key} cx={hoverX} cy={Y(hp[m.key] as number)} r={3} style={{ fill: m.color }} />
                  ) : null,
                )}
            </>
          )}

          {/* 자세히 마커 — 골든/데드 크로스 · 고점권 대량 윗꼬리 (최상단) */}
          {mode === 'advanced' && markers.cross && (
            <circle
              cx={X(markers.cross.i)}
              cy={
                view[markers.cross.i].ma20 != null
                  ? Y(view[markers.cross.i].ma20 as number)
                  : Y(view[markers.cross.i].close)
              }
              r={4.5}
              fill="none"
              style={{ stroke: markers.cross.kind === 'golden' ? 'var(--cb-ma20)' : 'var(--cb-negative)' }}
              strokeWidth={2}
            >
              <title>{markers.cross.kind === 'golden' ? t.stock.tech.crossGolden : t.stock.tech.crossDead}</title>
            </circle>
          )}
          {mode === 'advanced' && markers.wick != null && (
            <text
              x={X(markers.wick)}
              y={Y(view[markers.wick].high) - 6}
              textAnchor="middle"
              style={{ fill: 'var(--cb-ma60)', fontSize: 12 }}
            >
              ⚠<title>{t.stock.tech.volWick}</title>
            </text>
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
                effVisible[m.key] && hp[m.key] != null ? (
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

      {/* 거래량 서브차트 (상시) — 상승/하락 색 막대 + 20일 평균선 */}
      <svg
        viewBox={`0 0 ${VB_W} ${VOL_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto block mt-1.5 select-none"
        role="img"
        aria-label={t.stock.tech.tVolume}
      >
        <text x={M.l} y={12} style={{ fill: 'var(--cb-muted)', fontSize: 11 }}>
          {t.stock.tech.tVolume}
        </text>
        {view.map((p, i) => {
          const up = p.close >= p.open;
          const y = yVol(p.volume);
          return (
            <rect
              key={i}
              x={X(i) - cw / 2}
              y={y}
              width={cw}
              height={Math.max(0.5, VOL_H - SUB_BOT - y)}
              style={{ fill: up ? 'var(--cb-positive)' : 'var(--cb-negative)' }}
              opacity={0.5}
            />
          );
        })}
        <polyline
          points={view
            .map((_p, i) => {
              const v = volMa[from + i];
              return v == null ? '' : `${X(i).toFixed(1)},${yVol(v).toFixed(1)}`;
            })
            .filter(Boolean)
            .join(' ')}
          fill="none"
          style={{ stroke: 'var(--cb-ma60)' }}
          strokeWidth={1.2}
          opacity={0.9}
        />
        {showCrosshair && (
          <line
            x1={hoverX}
            x2={hoverX}
            y1={0}
            y2={VOL_H}
            style={{ stroke: 'var(--cb-muted)' }}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {/* RSI 서브차트 (자세히 모드) — 70/30 존 + 50 중심선 */}
      {mode === 'advanced' && (
        <svg
          viewBox={`0 0 ${VB_W} ${RSI_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block mt-1.5 select-none"
          role="img"
          aria-label="RSI"
        >
          <text x={M.l} y={12} style={{ fill: 'var(--cb-muted)', fontSize: 11 }}>
            RSI (14)
          </text>
          {/* 과매수/과매도 존 */}
          <rect x={M.l} y={yRsi(100)} width={PW} height={yRsi(70) - yRsi(100)} style={{ fill: 'var(--cb-hover)' }} />
          <rect x={M.l} y={yRsi(30)} width={PW} height={yRsi(0) - yRsi(30)} style={{ fill: 'var(--cb-hover)' }} />
          {[70, 50, 30].map((g) => (
            <g key={g}>
              <line
                x1={M.l}
                x2={M.l + PW}
                y1={yRsi(g)}
                y2={yRsi(g)}
                style={{ stroke: 'var(--cb-border-subtle)' }}
                strokeWidth={1}
                strokeDasharray={g === 50 ? '1 3' : '3 3'}
              />
              <text x={M.l - 8} y={yRsi(g) + 3.5} textAnchor="end" style={{ fill: 'var(--cb-muted)', fontSize: 10 }}>
                {g}
              </text>
            </g>
          ))}
          <polyline
            points={view
              .map((p, i) => (p.rsi == null ? '' : `${X(i).toFixed(1)},${yRsi(p.rsi).toFixed(1)}`))
              .filter(Boolean)
              .join(' ')}
            fill="none"
            style={{ stroke: 'var(--cb-point)' }}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {showCrosshair && (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={0}
              y2={RSI_H}
              style={{ stroke: 'var(--cb-muted)' }}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
        </svg>
      )}

      {/* 범례(자세히) 또는 초보 안내 */}
      {mode === 'advanced' ? (
        <div className="flex flex-wrap gap-2 mt-3.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-cb-border text-cb-muted">
            <span className="w-3.5 h-[3px] rounded-sm" style={{ background: 'var(--cb-foreground)' }} />
            {t.stock.tech.closeLabel}
          </span>
          <span className="inline-flex items-center self-center pl-0.5">
            <InfoHint label={t.stock.tech.chartTitle} content={t.stock.tech.maHint} />
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
          {(
            [
              { k: 'bb' as const, label: t.stock.tech.bbToggle, color: 'var(--cb-point)' },
              { k: 'sr' as const, label: t.stock.tech.srToggle, color: 'var(--cb-negative)' },
              { k: 'round' as const, label: t.stock.tech.roundToggle, color: 'var(--cb-border-strong)' },
            ]
          ).map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setOverlay((v) => ({ ...v, [o.k]: !v[o.k] }))}
              aria-pressed={overlay[o.k]}
              className={[
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-opacity',
                'border-cb-border text-cb-foreground bg-[var(--cb-input-bg)]',
                overlay[o.k] ? '' : 'opacity-40',
              ].join(' ')}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: o.color }} />
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11.5px] text-cb-muted flex items-center gap-1.5 leading-relaxed">
          {t.stock.tech.beginnerHint}
          <InfoHint label={t.stock.tech.chartTitle} content={t.stock.tech.maHint} />
        </p>
      )}
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
