import { useState, useMemo, useEffect, useRef } from 'react';
import { Layers, TrendingDown, TrendingUp, ArrowRight, RotateCcw } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { useCurrencyStore } from '../application/currency/useCurrencyStore';
import type { SupportedCurrency } from '../domain/exchange/types';
import { CURRENCY_SYMBOLS } from '../domain/exchange/constants';
import CurrencyInput from '../shared/components/CurrencyInput';
import CurrencySelector from '../shared/components/CurrencySelector';
import { trackEvent } from '../infrastructure/analytics/ga';

type InputMode = 'qty' | 'amount';

const labelCls = 'block text-sm font-medium text-cb-muted mb-1.5 ml-1';

function fmtNum(n: number, currency: SupportedCurrency, decimals = 2): string {
  const isWhole = currency !== 'USD';
  const d = isWhole ? 0 : decimals;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

const AveragingPage = () => {
  const t = useLanguageStore((s) => s.t);
  const { currency } = useCurrencyStore();
  const sym = CURRENCY_SYMBOLS[currency];

  const [holdingQty, setHoldingQty] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [addValue, setAddValue] = useState('');
  const [mode, setMode] = useState<InputMode>('qty');

  const handleReset = () => {
    setHoldingQty('');
    setAvgPrice('');
    setCurrentPrice('');
    setAddValue('');
  };

  const handleModeSwitch = (m: InputMode) => {
    setMode(m);
    setAddValue('');
  };

  const result = useMemo(() => {
    const qty = parseFloat(holdingQty);
    const avg = parseFloat(avgPrice);
    const curr = parseFloat(currentPrice);
    const rawAdd = parseFloat(addValue);

    if (!qty || !avg || !curr || !rawAdd) return null;
    if (qty <= 0 || avg <= 0 || curr <= 0 || rawAdd <= 0) return null;

    let addQty: number;
    let addAmount: number;

    if (mode === 'qty') {
      addQty = rawAdd;
      addAmount = rawAdd * curr;
    } else {
      addAmount = rawAdd;
      addQty = rawAdd / curr;
    }

    const newAvg = (qty * avg + addQty * curr) / (qty + addQty);
    const beforeReturn = ((curr - avg) / avg) * 100;
    const afterReturn = ((curr - newAvg) / newAvg) * 100;
    const returnDelta = afterReturn - beforeReturn;
    const totalQty = qty + addQty;
    const totalInvestment = qty * avg + addAmount;
    const isAveragingDown = curr < avg;

    return {
      newAvg,
      beforeReturn,
      afterReturn,
      returnDelta,
      addQty,
      addAmount,
      totalQty,
      totalInvestment,
      isAveragingDown,
    };
  }, [holdingQty, avgPrice, currentPrice, addValue, mode]);

  const hasTrackedRef = useRef(false);
  useEffect(() => {
    if (result && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackEvent('averaging_calculated', {
        type: result.isAveragingDown ? 'down' : 'up',
        mode,
        currency,
      });
    } else if (!result) {
      hasTrackedRef.current = false;
    }
  }, [result, mode, currency]);

  const hasInput = holdingQty || avgPrice || currentPrice || addValue;
  const addQtyIsInteger = result ? result.addQty % 1 === 0 : true;
  const totalQtyIsInteger = result ? result.totalQty % 1 === 0 : true;

  const inputCls = 'w-full theme-field border rounded-lg py-3 px-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-violet-400/15 text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-cb-foreground">{t.averaging.title}</h2>
        </div>
        <p className="text-cb-muted ml-11">{t.averaging.subtitle}</p>
      </div>

      {/* Currency selector bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-cb-muted">기준 통화</p>
        <CurrencySelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Left: Inputs ── */}
        <div className="flex flex-col gap-4">
          {/* Current holding */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-cb-muted">
              {t.averaging.currentHolding}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.averaging.holdingQty}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cb-muted text-sm font-semibold pointer-events-none">#</span>
                  <input
                    type="number"
                    min="0"
                    value={holdingQty}
                    onChange={(e) => setHoldingQty(e.target.value)}
                    placeholder={t.averaging.holdingQtyPlaceholder}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.averaging.avgBuyPrice}</label>
                <CurrencyInput
                  value={avgPrice}
                  onChange={setAvgPrice}
                  currency={currency}
                  placeholder={t.averaging.avgBuyPricePlaceholder}
                />
              </div>
            </div>
          </div>

          {/* Additional buy */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-widest text-cb-muted">
                {t.averaging.additionalBuy}
              </p>
              <div className="flex rounded-lg border border-cb-border overflow-hidden text-xs font-semibold shrink-0">
                <button
                  onClick={() => handleModeSwitch('qty')}
                  className={[
                    'px-3 py-1.5 transition-colors',
                    mode === 'qty'
                      ? 'bg-violet-400/20 text-violet-400'
                      : 'text-cb-muted hover:text-cb-foreground',
                  ].join(' ')}
                >
                  {t.averaging.addByQty}
                </button>
                <button
                  onClick={() => handleModeSwitch('amount')}
                  className={[
                    'px-3 py-1.5 transition-colors border-l border-cb-border',
                    mode === 'amount'
                      ? 'bg-violet-400/20 text-violet-400'
                      : 'text-cb-muted hover:text-cb-foreground',
                  ].join(' ')}
                >
                  {t.averaging.addByAmount}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.averaging.currentPrice}</label>
                <CurrencyInput
                  value={currentPrice}
                  onChange={setCurrentPrice}
                  currency={currency}
                  placeholder={t.averaging.currentPricePlaceholder}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {mode === 'qty' ? t.averaging.addQty : t.averaging.addAmount}
                </label>
                {mode === 'qty' ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cb-muted text-sm font-semibold pointer-events-none">#</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={addValue}
                      onChange={(e) => setAddValue(e.target.value)}
                      placeholder={t.averaging.addQtyPlaceholder}
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                ) : (
                  <CurrencyInput
                    value={addValue}
                    onChange={setAddValue}
                    currency={currency}
                    placeholder={t.averaging.addAmountPlaceholder}
                  />
                )}
              </div>
            </div>

            {/* Derived value display */}
            {result && (
              <div className="flex items-center gap-1.5 text-xs text-cb-muted bg-cb-surface/50 rounded-lg px-3 py-2 border border-cb-border/50">
                {mode === 'qty' ? (
                  <>
                    <span>{t.averaging.addAmount}:</span>
                    <span className="text-cb-foreground font-semibold font-mono">
                      {sym}{fmtNum(result.addAmount, currency)}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{t.averaging.addQty}:</span>
                    <span className="text-cb-foreground font-semibold font-mono">
                      {fmtNum(result.addQty, 'USD', addQtyIsInteger ? 0 : 4)}
                    </span>
                    <span>{t.averaging.qtyUnit}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reset */}
          {hasInput && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-cb-muted hover:text-cb-foreground transition-colors self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.averaging.reset}
            </button>
          )}
        </div>

        {/* ── Right: Results ── */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* 물타기 / 불타기 badge */}
              <div>
                {result.isAveragingDown ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/15 text-sky-400 text-xs font-bold border border-sky-400/25">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {t.averaging.avgDown}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cb-positive/15 text-cb-positive text-xs font-bold border border-cb-positive/25">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t.averaging.avgUp}
                  </span>
                )}
              </div>

              {/* New avg price — hero card */}
              <div className="glass-panel p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-cb-muted mb-2">
                  {t.averaging.newAvgPrice}
                </p>
                <p className="text-4xl font-black text-cb-foreground font-mono">
                  {sym}{fmtNum(result.newAvg, currency)}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-cb-muted">
                  <span className="font-mono">{sym}{fmtNum(parseFloat(avgPrice), currency)}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span
                    className={`font-mono font-semibold ${
                      result.isAveragingDown ? 'text-sky-400' : 'text-cb-positive'
                    }`}
                  >
                    {sym}{fmtNum(result.newAvg, currency)}
                  </span>
                </div>
              </div>

              {/* Return change */}
              <div className="glass-panel p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-cb-muted mb-3">
                  {t.averaging.returnChange}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xl font-black font-mono ${
                      result.beforeReturn >= 0 ? 'text-cb-positive' : 'text-cb-negative'
                    }`}
                  >
                    {fmtPct(result.beforeReturn)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cb-muted shrink-0" />
                  <span
                    className={`text-xl font-black font-mono ${
                      result.afterReturn >= 0 ? 'text-cb-positive' : 'text-cb-negative'
                    }`}
                  >
                    {fmtPct(result.afterReturn)}
                  </span>
                  <span
                    className={`ml-auto text-sm font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                      result.returnDelta >= 0
                        ? 'bg-cb-positive/15 text-cb-positive'
                        : 'bg-cb-negative/15 text-cb-negative'
                    }`}
                  >
                    {result.returnDelta >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(result.returnDelta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%p
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="glass-panel p-5 grid grid-cols-3 gap-3">
                {[
                  {
                    label: t.averaging.totalQty,
                    value: fmtNum(result.totalQty, 'USD', totalQtyIsInteger ? 0 : 4),
                  },
                  {
                    label: t.averaging.addInvestment,
                    value: `${sym}${fmtNum(result.addAmount, currency)}`,
                  },
                  {
                    label: t.averaging.totalInvestment,
                    value: `${sym}${fmtNum(result.totalInvestment, currency)}`,
                  },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-medium text-cb-muted leading-tight">{s.label}</p>
                    <p className="text-sm font-bold text-cb-foreground font-mono">{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-violet-400/10 flex items-center justify-center">
                <Layers className="w-7 h-7 text-violet-400/40" />
              </div>
              <p className="text-sm text-cb-muted max-w-[180px]">{t.averaging.emptyHint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-violet-400/25 bg-violet-400/6 text-sm text-cb-muted">
        <span>{t.averaging.tip}</span>
      </div>
    </div>
  );
};

export default AveragingPage;
