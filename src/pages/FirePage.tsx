import { useState, useMemo } from 'react';
import { Target, Percent, RotateCcw, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { useCurrencyStore } from '../application/currency/useCurrencyStore';
import type { SupportedCurrency } from '../domain/exchange/types';
import CurrencyInput from '../shared/components/CurrencyInput';
import CurrencySelector from '../shared/components/CurrencySelector';

type FireResult = {
  fireNumber: number;
  totalMonths: number;
  progress: number;
  alreadyFire: boolean;
  milestones: { label: string; asset: number; year: number }[];
};

function calcFire(
  monthlyExpense: number,
  currentAsset: number,
  monthlySaving: number,
  annualReturn: number
): FireResult {
  const fireNumber = (monthlyExpense * 12) / 0.04;
  const progress = fireNumber > 0 ? Math.min(100, (currentAsset / fireNumber) * 100) : 0;

  if (currentAsset >= fireNumber) {
    return { fireNumber, totalMonths: 0, progress: 100, alreadyFire: true, milestones: [] };
  }

  const r = annualReturn / 100 / 12;
  let asset = currentAsset;
  let months = 0;
  const MAX = 600;

  const pcts = [0.25, 0.5, 0.75, 1.0];
  const targets = pcts.map((p) => ({ p, target: fireNumber * p, month: 0, done: false }));

  while (asset < fireNumber && months < MAX) {
    asset = r > 0 ? asset * (1 + r) + monthlySaving : asset + monthlySaving;
    months++;
    targets.forEach((t) => {
      if (!t.done && asset >= t.target) {
        t.month = months;
        t.done = true;
      }
    });
  }

  const milestones = targets.map((t) => ({
    label: `${(t.p * 100).toFixed(0)}%`,
    asset: t.target,
    year: Math.round((t.month / 12) * 10) / 10,
  }));

  return { fireNumber, totalMonths: months, progress, alreadyFire: false, milestones };
}

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  KRW: '₩',
  JPY: '¥',
};

function makeFormatter(currency: SupportedCurrency) {
  const sym = CURRENCY_SYMBOLS[currency];
  return (n: number) => {
    if (n >= 1_000_000_000_000) return `${sym}${(n / 1_000_000_000_000).toFixed(2)}T`;
    if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(1)}K`;
    return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };
}

const labelCls = 'block text-sm font-medium text-cb-muted mb-1.5 ml-1';

const RADIUS = 72;
const CIRC = 2 * Math.PI * RADIUS;

const ProgressRing = ({ pct }: { pct: number }) => {
  const dash = (pct / 100) * CIRC;
  return (
    <svg viewBox="0 0 180 180" className="w-44 h-44" aria-hidden>
      <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={14} />
      <circle
        cx="90"
        cy="90"
        r={RADIUS}
        fill="none"
        stroke="#ffbf00"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRC}`}
        strokeDashoffset={CIRC / 4}
        transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="90" y="84" textAnchor="middle" fontSize={26} fontWeight="800" fill="#ffbf00" fontFamily="monospace">
        {pct.toFixed(1)}%
      </text>
      <text x="90" y="104" textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.5}>
        달성률
      </text>
    </svg>
  );
};

const FirePage = () => {
  const t = useLanguageStore((s) => s.t);
  const { currency } = useCurrencyStore();
  const fmt = makeFormatter(currency);

  const [expense, setExpense] = useState('3000');
  const [asset, setAsset] = useState('100000');
  const [saving, setSaving] = useState('2000');
  const [ret, setRet] = useState('7');
  const [submitted, setSubmitted] = useState(false);

  const handleCalc = () => setSubmitted(true);
  const handleReset = () => {
    setExpense('3000');
    setAsset('100000');
    setSaving('2000');
    setRet('7');
    setSubmitted(false);
  };

  const result: FireResult | null = useMemo(() => {
    if (!submitted) return null;
    const ev = Math.max(0, parseFloat(expense) || 0);
    const av = Math.max(0, parseFloat(asset) || 0);
    const sv = Math.max(0, parseFloat(saving) || 0);
    const rv = Math.max(0, parseFloat(ret) || 0);
    return calcFire(ev, av, sv, rv);
  }, [submitted, expense, asset, saving, ret]);

  const displayYears = result
    ? result.totalMonths >= 600
      ? '50+'
      : `${Math.floor(result.totalMonths / 12)}${t.fire.yearUnit} ${result.totalMonths % 12}${t.fire.monthUnit}`
    : null;

  const inputCls = 'w-full theme-field border rounded-lg py-3 px-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-orange-400/15 text-orange-400">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-cb-foreground">{t.fire.title}</h2>
        </div>
        <p className="text-cb-muted ml-11">{t.fire.subtitle}</p>
      </div>

      {/* Input */}
      <div className="glass-panel p-6">
        {/* Currency selector */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cb-muted">기준 통화</p>
          <CurrencySelector />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className={labelCls}>{t.fire.monthlyExpense}</label>
            <CurrencyInput
              value={expense}
              onChange={(v) => { setExpense(v); setSubmitted(false); }}
              currency={currency}
              placeholder={t.fire.monthlyExpensePlaceholder}
            />
          </div>
          <div>
            <label className={labelCls}>{t.fire.currentAsset}</label>
            <CurrencyInput
              value={asset}
              onChange={(v) => { setAsset(v); setSubmitted(false); }}
              currency={currency}
              placeholder={t.fire.currentAssetPlaceholder}
            />
          </div>
          <div>
            <label className={labelCls}>{t.fire.monthlySaving}</label>
            <CurrencyInput
              value={saving}
              onChange={(v) => { setSaving(v); setSubmitted(false); }}
              currency={currency}
              placeholder={t.fire.monthlySavingPlaceholder}
            />
          </div>
          <div>
            <label className={labelCls}>{t.fire.annualReturn}</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted" />
              <input
                type="number" min="0" max="100" step="0.1" value={ret}
                onChange={(e) => { setRet(e.target.value); setSubmitted(false); }}
                placeholder={t.fire.annualReturnPlaceholder}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCalc}
            className="flex-1 flex items-center justify-center gap-2 bg-cb-accent text-cb-on-accent font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-500/25 hover:bg-cb-accent-hover hover:scale-[1.01] active:scale-95 transition-all"
          >
            <Target className="w-4 h-4" />
            {t.fire.calculate}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-foreground/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {t.fire.reset}
          </button>
        </div>
      </div>

      {/* Results */}
      {submitted && result && (
        <>
          {result.alreadyFire ? (
            <div className="glass-panel p-8 text-center border-cb-positive/40 bg-cb-positive/5">
              <CheckCircle2 className="w-14 h-14 text-cb-positive mx-auto mb-4" />
              <p className="text-xl font-bold text-cb-positive">{t.fire.alreadyFire}</p>
              <p className="text-cb-muted mt-2">{t.fire.rule4Desc}</p>
              <p className="text-2xl font-black text-cb-foreground font-mono mt-3">{fmt(result.fireNumber)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ring */}
              <div className="glass-panel p-6 flex flex-col items-center justify-center gap-2">
                <ProgressRing pct={result.progress} />
                <p className="text-sm text-cb-muted text-center mt-1">{t.fire.progress}</p>
              </div>

              {/* Key metrics */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-5 border-cb-accent/40 bg-gradient-to-br from-cb-accent/10 to-transparent">
                  <div className="text-xs font-semibold uppercase tracking-wide text-cb-accent mb-2">{t.fire.fireNumber}</div>
                  <div className="text-2xl font-black text-cb-accent font-mono">{fmt(result.fireNumber)}</div>
                  <div className="text-xs text-cb-muted mt-1">{t.fire.rule4Desc}</div>
                </div>
                <div className="glass-panel p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-cb-muted mb-2">{t.fire.yearsToFire}</div>
                  <div className="text-2xl font-black text-cb-foreground font-mono">{displayYears}</div>
                  <div className="text-xs text-cb-muted mt-1">
                    {result.totalMonths >= 600 ? '투자 기간 50년 초과' : `총 ${result.totalMonths}개월`}
                  </div>
                </div>

                {/* Milestones */}
                <div className="sm:col-span-2 glass-panel p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-cb-positive" />
                    <span className="text-sm font-bold text-cb-foreground">마일스톤</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {result.milestones.map((m) => (
                      <div key={m.label} className="text-center p-3 rounded-lg bg-[var(--cb-row-bg)]">
                        <div className="text-xs font-bold text-cb-accent mb-1">{m.label}</div>
                        <div className="text-sm font-bold text-cb-foreground font-mono">{fmt(m.asset)}</div>
                        <div className="text-[10px] text-cb-muted mt-0.5">
                          {m.year > 0 ? `≈ ${m.year}${t.fire.yearUnit}` : '달성'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-cb-accent/25 bg-cb-accent/6 text-sm text-cb-muted">
            <span>{t.fire.tip}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FirePage;
