import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { fetchFinancials, fetchTechnical, fetchStockAnalysis } from '../infrastructure/api/marketClient';
import TickerAutocomplete from '../components/stock/TickerAutocomplete';
import PriceMaChart from '../components/stock/PriceMaChart';
import TechnicalSignals from '../components/stock/TechnicalSignals';
import AiAnalysisPanel, { AiLoading } from '../components/stock/AiAnalysisPanel';
import type {
  Financials,
  StatementPeriod,
  StockAnalysis,
  TechRange,
  TechnicalResult,
} from '../domain/market/types';
import {
  formatCompact,
  formatMoney,
  formatPercent,
  formatPeriodLabel,
  formatRatio,
} from '../domain/market/format';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';
import EmptyState from '../components/ui/EmptyState';
import InfoHint from '../components/ui/InfoHint';

type Tab = 'technical' | 'fundamental';
const PERIODS: StatementPeriod[] = ['annual', 'quarterly'];
const RANGES: TechRange[] = ['3M', '6M', '1Y'];

// ── 공용 세그먼트 컨트롤 ──
const Seg = <T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}) => (
  <div className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--cb-input-bg)]">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={[
          'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
          value === o ? 'bg-cb-accent text-cb-on-accent' : 'text-cb-muted hover:text-cb-foreground',
        ].join(' ')}
      >
        {labels?.[o] ?? o}
      </button>
    ))}
  </div>
);

// ── 추이 스파크라인 ──
const Sparkline = ({ values }: { values: number[] }) => {
  const w = 120;
  const h = 40;
  const min = Math.min(...values, 0);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const x = (i: number) => (i / (values.length - 1 || 1)) * w;
  const y = (v: number) => h - 3 - ((v - min) / rng) * (h - 6);
  const up = values[values.length - 1] >= values[0];
  const col = up ? 'var(--cb-positive)' : 'var(--cb-negative)';
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${x(0)},${h} ${line} ${x(values.length - 1)},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none" aria-hidden>
      <polygon points={area} style={{ fill: col }} opacity={0.12} />
      <polyline
        points={line}
        fill="none"
        style={{ stroke: col }}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// ── 밸류에이션 (그룹핑) ──
const ValCell = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bg-[var(--cb-input-bg)] border border-cb-border rounded-xl p-3">
    <p className="text-[11.5px] text-cb-muted mb-1 inline-flex items-center gap-1">
      {label}
      {hint && <InfoHint label={label} content={hint} />}
    </p>
    <p className="text-lg font-bold text-cb-foreground tabular-nums">{value}</p>
  </div>
);

const ValuationView = ({ data }: { data: Financials }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const v = data.valuation;
  const c = data.currency;

  return (
    <section className="glass-panel rounded-xl p-5 space-y-4">
      <h3 className="text-[15px] font-bold text-cb-foreground">{t.stock.valuationTitle}</h3>

      {/* 가격 · 규모 */}
      <div className="grid grid-cols-2 gap-3">
        <ValCell label={t.stock.price} value={formatMoney(v.price, c)} hint={t.glossary.price} />
        <ValCell label={t.stock.marketCap} value={formatCompact(v.marketCap, lang)} hint={t.glossary.marketCap} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-cb-muted uppercase tracking-wide mb-2.5">
            {t.stock.valGroupValuation}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <ValCell label={t.stock.per} value={formatRatio(v.per)} hint={t.glossary.per} />
            <ValCell label={t.stock.forwardPer} value={formatRatio(v.forwardPer)} hint={t.glossary.forwardPer} />
            <ValCell label={t.stock.pbr} value={formatRatio(v.pbr)} hint={t.glossary.pbr} />
            <ValCell label={t.stock.psr} value={formatRatio(v.psr)} hint={t.glossary.psr} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-cb-muted uppercase tracking-wide mb-2.5">
            {t.stock.valGroupProfit}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <ValCell label={t.stock.eps} value={formatMoney(v.eps, c)} hint={t.glossary.eps} />
            <ValCell label={t.stock.bps} value={formatMoney(v.bps, c)} hint={t.glossary.bps} />
            <ValCell label={t.stock.peg} value={formatRatio(v.peg)} hint={t.glossary.peg} />
            <ValCell
              label={t.stock.dividendYield}
              value={formatPercent(v.dividendYield)}
              hint={t.glossary.dividendYield}
            />
          </div>
        </div>
      </div>

      {v.derived && <p className="text-xs text-cb-muted">* {t.stock.derivedNote}</p>}
    </section>
  );
};

// ── 핵심 지표 추이 ──
const TrendView = ({ data }: { data: Financials }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const chrono = [...data.income].reverse(); // 백엔드는 최신순 → 시간순으로

  const metrics = [
    { label: t.stock.revenue, key: 'revenue' as const, hint: t.glossary.revenue },
    { label: t.stock.operatingIncome, key: 'operatingIncome' as const, hint: t.glossary.operatingIncome },
    { label: t.stock.netIncome, key: 'netIncome' as const, hint: t.glossary.netIncome },
  ];

  const cards = metrics
    .map((m) => ({ ...m, values: chrono.map((r) => r[m.key]).filter((x): x is number => x != null) }))
    .filter((m) => m.values.length >= 2);

  if (cards.length === 0) return null;

  return (
    <section className="glass-panel rounded-xl p-5">
      <h3 className="text-[15px] font-bold text-cb-foreground mb-4">{t.stock.trendTitle}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {cards.map((m) => {
          const first = m.values[0];
          const last = m.values[m.values.length - 1];
          const growth = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
          const up = growth >= 0;
          return (
            <div key={m.key} className="border border-cb-border rounded-2xl p-4 bg-[var(--cb-input-bg)]">
              <p className="text-xs text-cb-muted inline-flex items-center gap-1">
                {m.label}
                <InfoHint label={m.label} content={m.hint} />
              </p>
              <p className="text-lg font-bold text-cb-foreground tabular-nums">
                {formatCompact(last, lang)}
              </p>
              <p
                className="text-[11.5px] font-semibold tabular-nums mb-2"
                style={{ color: up ? 'var(--cb-positive)' : 'var(--cb-negative)' }}
              >
                {up ? '▲' : '▼'} {Math.abs(growth).toFixed(0)}%
              </p>
              <Sparkline values={m.values} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ── 재무제표 (미니바) ──
interface BarRow {
  label: string;
  hint?: string;
  values: (number | undefined)[];
}
const StatementTable = ({
  title,
  periods,
  rows,
  lang,
  emptyLabel,
  periodColumn,
}: {
  title: string;
  periods: string[];
  rows: BarRow[];
  lang: 'ko' | 'en' | 'ja';
  emptyLabel: string;
  periodColumn: string;
}) => (
  <div className="glass-panel rounded-xl p-5">
    <h3 className="text-base font-bold text-cb-foreground mb-4">{title}</h3>
    {periods.length === 0 ? (
      <p className="text-sm text-cb-muted py-6 text-center">{emptyLabel}</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-cb-border">
              <th className="text-left font-semibold text-cb-muted py-2 pr-4 sticky left-0 bg-cb-surface">
                {periodColumn}
              </th>
              {periods.map((p) => (
                <th
                  key={p}
                  className="text-right font-semibold text-cb-foreground py-2 px-3 whitespace-nowrap"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const maxAbs = Math.max(1, ...row.values.map((v) => (v == null ? 0 : Math.abs(v))));
              return (
                <tr key={row.label} className="border-b border-cb-border/50 last:border-0">
                  <th className="text-left font-medium text-cb-muted py-2.5 pr-4 whitespace-nowrap sticky left-0 bg-cb-surface">
                    <span className="inline-flex items-center gap-1">
                      {row.label}
                      {row.hint && <InfoHint label={row.label} content={row.hint} />}
                    </span>
                  </th>
                  {row.values.map((val, i) => (
                    <td key={i} className="py-2.5 px-3 tabular-nums whitespace-nowrap">
                      <span className="flex flex-col items-end gap-1">
                        <span className="text-cb-foreground">{formatCompact(val, lang)}</span>
                        {val != null && (
                          <span
                            className="h-[3px] rounded-sm"
                            style={{
                              width: `${(Math.abs(val) / maxAbs) * 100}%`,
                              minWidth: 2,
                              background: val < 0 ? 'var(--cb-negative)' : 'var(--cb-point)',
                              opacity: 0.55,
                            }}
                          />
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const StatementsView = ({ data }: { data: Financials }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const { period } = data;

  return (
    <div className="space-y-4">
      <StatementTable
        title={t.stock.incomeTitle}
        lang={lang}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        periods={data.income.map((r) => formatPeriodLabel(r.date, period))}
        rows={[
          { label: t.stock.revenue, hint: t.glossary.revenue, values: data.income.map((r) => r.revenue) },
          {
            label: t.stock.operatingIncome,
            hint: t.glossary.operatingIncome,
            values: data.income.map((r) => r.operatingIncome),
          },
          { label: t.stock.netIncome, hint: t.glossary.netIncome, values: data.income.map((r) => r.netIncome) },
        ]}
      />
      <StatementTable
        title={t.stock.balanceTitle}
        lang={lang}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        periods={data.balance.map((r) => formatPeriodLabel(r.date, period))}
        rows={[
          { label: t.stock.totalAssets, hint: t.glossary.totalAssets, values: data.balance.map((r) => r.totalAssets) },
          {
            label: t.stock.totalLiabilities,
            hint: t.glossary.totalLiabilities,
            values: data.balance.map((r) => r.totalLiabilities),
          },
          { label: t.stock.equity, hint: t.glossary.equity, values: data.balance.map((r) => r.equity) },
        ]}
      />
      <StatementTable
        title={t.stock.cashflowTitle}
        lang={lang}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        periods={data.cashflow.map((r) => formatPeriodLabel(r.date, period))}
        rows={[
          { label: t.stock.cfOperating, hint: t.glossary.cfOperating, values: data.cashflow.map((r) => r.operating) },
          { label: t.stock.cfInvesting, hint: t.glossary.cfInvesting, values: data.cashflow.map((r) => r.investing) },
          { label: t.stock.cfFinancing, hint: t.glossary.cfFinancing, values: data.cashflow.map((r) => r.financing) },
          {
            label: t.stock.freeCashFlow,
            hint: t.glossary.freeCashFlow,
            values: data.cashflow.map((r) => r.freeCashFlow),
          },
        ]}
      />
    </div>
  );
};

const CardSkeleton = () => (
  <div className="glass-panel rounded-xl p-5 space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

/** 고점/저점 대비 등락 칩 — 값 부호로 색(상승 초록·하락 빨강). */
const DeltaChip = ({ label, hint, value }: { label: string; hint: string; value: number }) => {
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cb-border text-xs">
      <span className="inline-flex items-center gap-1 text-cb-muted">
        {label}
        <InfoHint label={label} content={hint} />
      </span>
      <b className="tabular-nums" style={{ color: up ? 'var(--cb-positive)' : 'var(--cb-negative)' }}>
        {up ? '+' : ''}
        {value.toFixed(1)}%
      </b>
    </span>
  );
};

const StockPage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('technical');
  const [range, setRange] = useState<TechRange>('1Y');
  const [period, setPeriod] = useState<StatementPeriod>('annual');

  const [tech, setTech] = useState<TechnicalResult | null>(null);
  const [techLoading, setTechLoading] = useState(false);
  const [techError, setTechError] = useState(false);

  const [fin, setFin] = useState<Financials | null>(null);
  const [finLoading, setFinLoading] = useState(false);
  const [finError, setFinError] = useState(false);

  // AI 분석 — 버튼 클릭 시 온디맨드 (기술+펀더멘탈 취합, LLM)
  const [aiOpen, setAiOpen] = useState(false);
  const [ai, setAi] = useState<StockAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // 비동기 경로에서만 setState — 로딩=true 는 이벤트 핸들러에서.
  const loadTech = useCallback((q: string, r: TechRange) => {
    fetchTechnical(q, r)
      .then((res) => {
        setTech(res);
        setTechError(false);
      })
      .catch(() => setTechError(true))
      .finally(() => setTechLoading(false));
  }, []);

  const loadFin = useCallback((q: string, p: StatementPeriod) => {
    fetchFinancials(q, p)
      .then((res) => {
        setFin(res);
        setFinError(false);
      })
      .catch(() => setFinError(true))
      .finally(() => setFinLoading(false));
  }, []);

  const loadAi = useCallback((q: string, locale: string) => {
    fetchStockAnalysis(q, locale)
      .then((res) => {
        setAi(res);
        setAiError(false);
      })
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, []);

  useEffect(() => {
    if (query) loadTech(query, range);
  }, [query, range, loadTech]);

  useEffect(() => {
    if (query) loadFin(query, period);
  }, [query, period, loadFin]);

  const runSearch = (ticker: string) => {
    const q = ticker.trim();
    if (!q) return;
    setTechLoading(true);
    setFinLoading(true);
    setTechError(false);
    setFinError(false);
    // 새 종목 검색 시 이전 AI 분석 초기화 (닫고 비움)
    setAiOpen(false);
    setAi(null);
    setAiError(false);
    setAiLoading(false);
    if (q === query) {
      loadTech(q, range);
      loadFin(q, period);
    } else {
      setQuery(q);
    }
  };

  const toggleAi = () => {
    if (aiOpen) {
      setAiOpen(false);
      return;
    }
    setAiOpen(true);
    if (!ai && !aiLoading) {
      setAiLoading(true);
      setAiError(false);
      loadAi(query, lang);
    }
  };
  const retryAi = () => {
    setAiError(false);
    setAiLoading(true);
    loadAi(query, lang);
  };

  const changeRange = (r: TechRange) => {
    if (r === range) return;
    setTechLoading(true);
    setRange(r);
  };
  const changePeriod = (p: StatementPeriod) => {
    if (p === period) return;
    setFinLoading(true);
    setPeriod(p);
  };

  // 헤더 현재가/등락 — 차트(일봉) 우선, 없으면 밸류에이션.
  const priceInfo = (() => {
    if (tech && tech.series.length >= 2) {
      const s = tech.series;
      const last = s[s.length - 1].close;
      const prev = s[s.length - 2].close;
      return { price: last, change: last - prev, pct: ((last - prev) / prev) * 100, currency: tech.currency };
    }
    if (fin?.valuation.price != null) {
      return { price: fin.valuation.price, change: null, pct: null, currency: fin.currency };
    }
    return null;
  })();

  // 이격도(현재가 ÷ 이동평균 × 100) + 구간 고점/저점 대비 — 차트 series 로 계산(백엔드 무관).
  const techLast = tech && tech.series.length ? tech.series[tech.series.length - 1] : null;
  const disparity = (ma: number | null): number | null =>
    techLast && ma != null && ma !== 0 ? (techLast.close / ma) * 100 : null;
  const disparity20 = techLast ? disparity(techLast.ma20) : null;
  const disparity60 = techLast ? disparity(techLast.ma60) : null;

  const rangeStats = (() => {
    if (!tech || tech.series.length === 0) return null;
    const s = tech.series;
    const peak = Math.max(...s.map((p) => p.high));
    const trough = Math.min(...s.map((p) => p.low));
    const last = s[s.length - 1].close;
    return {
      fromHigh: peak ? (last / peak - 1) * 100 : 0,
      fromLow: trough ? (last / trough - 1) * 100 : 0,
    };
  })();

  const hasData = tech || fin;
  const showEmpty = !query || (!hasData && !techLoading && !finLoading && !techError && !finError);

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={[
        'relative px-1 py-2.5 text-sm font-semibold transition-colors',
        tab === id ? 'text-cb-foreground' : 'text-cb-muted hover:text-cb-foreground',
        tab === id
          ? "after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-cb-accent after:content-['']"
          : '',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <BarChart3 className="w-7 h-7 text-cb-accent" />
          {t.stock.title}
        </h2>
        <p className="mt-1.5 text-cb-muted">{t.stock.subtitle}</p>
        <p className="mt-1 text-xs text-cb-muted">{t.stock.examples}</p>
      </header>

      <TickerAutocomplete
        onSearch={runSearch}
        placeholder={t.stock.searchPlaceholder}
        searchLabel={t.stock.search}
      />

      {showEmpty && <EmptyState message={t.stock.empty} />}

      {query && !showEmpty && (
        <div className="space-y-5">
          {/* 종목 아이덴티티 + 현재가 */}
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-cb-foreground tracking-tight">
              {tech?.ticker ?? fin?.ticker ?? query.toUpperCase()}
            </h3>
            {priceInfo && (
              <div className="text-right">
                <div className="text-2xl font-extrabold text-cb-foreground tabular-nums leading-none">
                  {formatMoney(priceInfo.price, priceInfo.currency)}
                </div>
                {priceInfo.change != null && priceInfo.pct != null && (
                  <div
                    className="text-[13px] font-semibold tabular-nums mt-1"
                    style={{ color: priceInfo.change >= 0 ? 'var(--cb-positive)' : 'var(--cb-negative)' }}
                  >
                    {priceInfo.change >= 0 ? '+' : ''}
                    {formatMoney(priceInfo.change, priceInfo.currency)} ({priceInfo.change >= 0 ? '+' : ''}
                    {priceInfo.pct.toFixed(2)}%)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 구간 고점/저점 대비 */}
          {rangeStats && (
            <div className="flex flex-wrap gap-2">
              <DeltaChip label={t.stock.tech.fromHigh} hint={t.glossary.fromHigh} value={rangeStats.fromHigh} />
              <DeltaChip label={t.stock.tech.fromLow} hint={t.glossary.fromLow} value={rangeStats.fromLow} />
            </div>
          )}

          {/* AI 종합 분석 — 버튼 + 인라인 확장 카드 (기술 + 펀더멘탈) */}
          <div>
            <button
              type="button"
              onClick={toggleAi}
              aria-expanded={aiOpen}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cb-accent text-cb-on-accent font-bold text-sm hover:bg-cb-accent-hover transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t.stock.ai.button}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${aiOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {aiOpen && (
              <div className="mt-3 glass-panel rounded-xl p-5">
                <h3 className="flex items-center gap-2 text-[15px] font-bold text-cb-foreground mb-4">
                  <Sparkles className="w-4 h-4 text-cb-point" />
                  {t.stock.ai.title}
                </h3>
                {aiError ? (
                  <ErrorRetry message={t.stock.ai.error} retryLabel={t.stock.retry} onRetry={retryAi} />
                ) : !ai ? (
                  <AiLoading />
                ) : (
                  <AiAnalysisPanel data={ai} />
                )}
              </div>
            )}
          </div>

          {/* 탭 */}
          <div className="flex gap-6 border-b border-cb-border" role="tablist" aria-label={t.stock.title}>
            {tabBtn('technical', t.stock.tabTechnical)}
            {tabBtn('fundamental', t.stock.tabFundamental)}
          </div>

          {/* ── 기술적 분석 ── */}
          {tab === 'technical' && (
            <div className="space-y-4">
              <section className="glass-panel rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-cb-foreground inline-flex items-center gap-1.5">
                      {t.stock.tech.chartTitle}
                      <InfoHint label={t.stock.tech.chartTitle} content={t.glossary.movingAverage} />
                    </h3>
                    <p className="text-xs text-cb-muted mt-0.5">{t.stock.tech.chartSub}</p>
                  </div>
                  <Seg options={RANGES} value={range} onChange={changeRange} />
                </div>

                {techError ? (
                  <ErrorRetry
                    message={t.stock.error}
                    retryLabel={t.stock.retry}
                    onRetry={() => {
                      setTechError(false);
                      setTechLoading(true);
                      loadTech(query, range);
                    }}
                  />
                ) : !tech ? (
                  <Skeleton className="h-72 w-full rounded-lg" />
                ) : (
                  <div className={techLoading ? 'opacity-60 transition-opacity' : ''}>
                    <PriceMaChart key={range} data={tech} />
                  </div>
                )}
              </section>

              {tech && (
                <section className="glass-panel rounded-xl p-5">
                  <div className="mb-4">
                    <h3 className="text-[15px] font-bold text-cb-foreground">{t.stock.tech.signalsTitle}</h3>
                    <p className="text-xs text-cb-muted mt-0.5">{t.stock.tech.signalsSub}</p>
                  </div>
                  <TechnicalSignals
                    signals={tech.signals}
                    disparity20={disparity20}
                    disparity60={disparity60}
                  />
                </section>
              )}
            </div>
          )}

          {/* ── 펀더멘탈 분석 ── */}
          {tab === 'fundamental' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Seg
                  options={PERIODS}
                  value={period}
                  onChange={changePeriod}
                  labels={{ annual: t.stock.annual, quarterly: t.stock.quarterly }}
                />
              </div>

              {finError ? (
                <ErrorRetry
                  message={t.stock.error}
                  retryLabel={t.stock.retry}
                  onRetry={() => {
                    setFinError(false);
                    setFinLoading(true);
                    loadFin(query, period);
                  }}
                />
              ) : !fin ? (
                <div className="space-y-4">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : (
                <div className={`space-y-4 ${finLoading ? 'opacity-60 transition-opacity' : ''}`}>
                  <ValuationView data={fin} />
                  <TrendView data={fin} />
                  <StatementsView data={fin} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockPage;
