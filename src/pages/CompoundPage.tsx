import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Percent, RotateCcw } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { useCurrencyStore } from '../application/currency/useCurrencyStore';
import type { SupportedCurrency } from '../domain/exchange/types';
import CurrencyInput from '../shared/components/CurrencyInput';
import CurrencySelector from '../shared/components/CurrencySelector';

type YearRow = {
  year: number;
  total: number;
  contributed: number;
  gain: number;
};

function calcCompound(
  initial: number,
  monthly: number,
  annualRate: number,
  years: number
): YearRow[] {
  const r = annualRate / 100 / 12;
  return Array.from({ length: years }, (_, idx) => {
    const n = (idx + 1) * 12;
    const total =
      r === 0
        ? initial + monthly * n
        : initial * Math.pow(1 + r, n) + (monthly * (Math.pow(1 + r, n) - 1)) / r;
    const contributed = initial + monthly * n;
    return { year: idx + 1, total, contributed, gain: total - contributed };
  });
}

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  KRW: '₩',
  JPY: '¥',
};

function makeFormatter(currency: SupportedCurrency) {
  const sym = CURRENCY_SYMBOLS[currency];
  const isWhole = currency !== 'USD';
  return (n: number) => {
    if (n >= 1_000_000_000_000) return `${sym}${(n / 1_000_000_000_000).toFixed(2)}T`;
    if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(1)}K`;
    return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: isWhole ? 0 : 0 })}`;
  };
}

const labelCls = 'block text-sm font-medium text-cb-muted mb-1.5 ml-1';

const CompoundPage = () => {
  const t = useLanguageStore((s) => s.t);
  const { currency } = useCurrencyStore();
  const fmt = makeFormatter(currency);

  const [initial, setInitial] = useState('10000');
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('20');
  const [submitted, setSubmitted] = useState(false);

  const handleCalc = () => setSubmitted(true);
  const handleReset = () => {
    setInitial('10000');
    setMonthly('500');
    setRate('7');
    setYears('20');
    setSubmitted(false);
  };

  const results: YearRow[] = useMemo(() => {
    if (!submitted) return [];
    const iv = Math.max(0, parseFloat(initial) || 0);
    const mv = Math.max(0, parseFloat(monthly) || 0);
    const rv = Math.max(0, parseFloat(rate) || 0);
    const yv = Math.min(50, Math.max(1, Math.round(parseFloat(years) || 1)));
    return calcCompound(iv, mv, rv, yv);
  }, [submitted, initial, monthly, rate, years]);

  const last = results[results.length - 1];
  const gainPct = last && last.contributed > 0 ? ((last.gain / last.contributed) * 100).toFixed(1) : '0';

  const MAX_BARS = 30;
  const chartData = results.length > MAX_BARS
    ? results.filter((_, i) => i % Math.ceil(results.length / MAX_BARS) === 0 || i === results.length - 1)
    : results;

  const maxTotal = chartData.reduce((m, r) => Math.max(m, r.total), 0);

  const CHART_W = 580;
  const CHART_H = 180;
  const PAD_L = 52;
  const PAD_B = 30;
  const PAD_TOP = 14;
  const innerW = CHART_W - PAD_L - 10;
  const innerH = CHART_H - PAD_B - PAD_TOP;
  const barW = Math.max(4, innerW / chartData.length - 3);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const inputCls = 'w-full theme-field border rounded-lg py-3 px-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-cb-positive/15 text-cb-positive">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-cb-foreground">{t.compound.title}</h2>
        </div>
        <p className="text-cb-muted ml-11">{t.compound.subtitle}</p>
      </div>

      {/* Input panel */}
      <div className="glass-panel p-6">
        {/* Currency selector */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cb-muted">기준 통화</p>
          <CurrencySelector />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className={labelCls}>{t.compound.initial}</label>
            <CurrencyInput
              value={initial}
              onChange={(v) => { setInitial(v); setSubmitted(false); }}
              currency={currency}
              placeholder={t.compound.initialPlaceholder}
            />
          </div>
          <div>
            <label className={labelCls}>{t.compound.monthly}</label>
            <CurrencyInput
              value={monthly}
              onChange={(v) => { setMonthly(v); setSubmitted(false); }}
              currency={currency}
              placeholder={t.compound.monthlyPlaceholder}
            />
          </div>
          <div>
            <label className={labelCls}>{t.compound.rate}</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted" />
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rate}
                onChange={(e) => { setRate(e.target.value); setSubmitted(false); }}
                placeholder={t.compound.ratePlaceholder}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.compound.years}</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted" />
              <input
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => { setYears(e.target.value); setSubmitted(false); }}
                placeholder={t.compound.yearsPlaceholder}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCalc}
            className="flex-1 flex items-center justify-center gap-2 bg-cb-accent text-cb-on-accent font-bold py-3 px-6 rounded-lg shadow-lg shadow-black/20 hover:bg-cb-accent-hover hover:scale-[1.01] active:scale-95 transition-all"
          >
            <Calculator className="w-4 h-4" />
            {t.compound.calculate}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-foreground/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {t.compound.reset}
          </button>
        </div>
      </div>

      {/* Results */}
      {submitted && last && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t.compound.finalAmount, value: fmt(last.total), accent: true },
              { label: t.compound.totalContributed, value: fmt(last.contributed), accent: false },
              { label: t.compound.totalGain, value: fmt(last.gain), accent: false },
              { label: t.compound.gainPercent, value: `${gainPct}%`, accent: false },
            ].map((card, i) => (
              <div
                key={i}
                className={`glass-panel p-4 ${
                  card.accent ? 'border-cb-accent/40 bg-gradient-to-br from-cb-accent/10 to-transparent' : ''
                }`}
              >
                <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${card.accent ? 'text-cb-accent' : 'text-cb-muted'}`}>
                  {card.label}
                </div>
                <div className={`text-xl font-black font-mono ${card.accent ? 'text-cb-accent' : 'text-cb-foreground'}`}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="glass-panel p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-cb-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cb-positive" />
                {t.compound.chartTitle}
              </h3>
              <div className="flex items-center gap-4 text-xs text-cb-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cb-muted/40 inline-block" />
                  {t.compound.contributed}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cb-positive inline-block" />
                  {t.compound.gain}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full"
                style={{ minWidth: 320 }}
                aria-hidden
              >
                {yTicks.map((pct) => {
                  const y = PAD_TOP + innerH * (1 - pct);
                  return (
                    <g key={pct}>
                      <line x1={PAD_L} y1={y} x2={CHART_W - 10} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                      {pct > 0 && (
                        <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.4}>
                          {fmt(maxTotal * pct)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {chartData.map((row, i) => {
                  const x = PAD_L + i * (innerW / chartData.length) + (innerW / chartData.length - barW) / 2;
                  const contribH = maxTotal > 0 ? (row.contributed / maxTotal) * innerH : 0;
                  const gainH = maxTotal > 0 ? (row.gain / maxTotal) * innerH : 0;
                  const baseY = PAD_TOP + innerH;

                  return (
                    <g key={row.year}>
                      <rect
                        x={x}
                        y={baseY - contribH}
                        width={barW}
                        height={contribH}
                        fill="currentColor"
                        fillOpacity={0.25}
                        rx={2}
                      />
                      {gainH > 0 && (
                        <rect
                          x={x}
                          y={baseY - contribH - gainH}
                          width={barW}
                          height={gainH}
                          fill="#43a047"
                          fillOpacity={0.85}
                          rx={2}
                        />
                      )}
                      {(i === 0 || (row.year % 5 === 0) || i === chartData.length - 1) && (
                        <text
                          x={x + barW / 2}
                          y={CHART_H - 8}
                          textAnchor="middle"
                          fontSize={9}
                          fill="currentColor"
                          fillOpacity={0.45}
                        >
                          {row.year}{t.compound.yearUnit}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-cb-accent/25 bg-cb-accent/6 text-sm text-cb-muted">
            <span className="shrink-0">{t.compound.tip}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CompoundPage;
