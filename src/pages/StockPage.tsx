import { useCallback, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { fetchFinancials } from '../infrastructure/api/marketClient';
import TickerAutocomplete from '../components/stock/TickerAutocomplete';
import type { Financials, StatementPeriod } from '../domain/market/types';
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

const PERIODS: StatementPeriod[] = ['annual', 'quarterly'];

/** 표 한 줄: 항목명 + 기간별 셀(최신순). */
interface TableRow {
  label: string;
  values: string[];
}

const StatementTable = ({
  title,
  periods,
  rows,
  emptyLabel,
  periodColumn,
}: {
  title: string;
  periods: string[];
  rows: TableRow[];
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
                <th key={p} className="text-right font-semibold text-cb-foreground py-2 px-3 whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-cb-border/50 last:border-0">
                <td className="text-left text-cb-muted py-2.5 pr-4 whitespace-nowrap sticky left-0 bg-cb-surface">
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className="text-right text-cb-foreground py-2.5 px-3 tabular-nums whitespace-nowrap"
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const StockLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="glass-panel rounded-xl p-4 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} className="glass-panel rounded-xl p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

const ValuationCards = ({ data }: { data: Financials }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const v = data.valuation;
  const c = data.currency;

  const cards: { label: string; value: string; hint?: string }[] = [
    { label: t.stock.price, value: formatMoney(v.price, c) },
    { label: t.stock.marketCap, value: formatCompact(v.marketCap, lang) },
    { label: t.stock.per, value: formatRatio(v.per), hint: t.glossary.per },
    { label: t.stock.forwardPer, value: formatRatio(v.forwardPer) },
    { label: t.stock.pbr, value: formatRatio(v.pbr), hint: t.glossary.pbr },
    { label: t.stock.psr, value: formatRatio(v.psr) },
    { label: t.stock.peg, value: formatRatio(v.peg) },
    { label: t.stock.eps, value: formatMoney(v.eps, c) },
    { label: t.stock.bps, value: formatMoney(v.bps, c) },
    { label: t.stock.dividendYield, value: formatPercent(v.dividendYield) },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="glass-panel rounded-xl p-4">
            <p className="text-xs text-cb-muted mb-1 inline-flex items-center gap-1">
              {card.label}
              {card.hint && <InfoHint label={card.label} content={card.hint} />}
            </p>
            <p className="text-lg md:text-xl font-bold text-cb-foreground tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>
      {v.derived && <p className="mt-2 text-xs text-cb-muted px-1">* {t.stock.derivedNote}</p>}
    </div>
  );
};

const StatementsView = ({ data }: { data: Financials }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const { period } = data;

  const incomePeriods = data.income.map((r) => formatPeriodLabel(r.date, period));
  const balancePeriods = data.balance.map((r) => formatPeriodLabel(r.date, period));
  const cashflowPeriods = data.cashflow.map((r) => formatPeriodLabel(r.date, period));

  return (
    <div className="space-y-4">
      <StatementTable
        title={t.stock.incomeTitle}
        periods={incomePeriods}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        rows={[
          { label: t.stock.revenue, values: data.income.map((r) => formatCompact(r.revenue, lang)) },
          {
            label: t.stock.operatingIncome,
            values: data.income.map((r) => formatCompact(r.operatingIncome, lang)),
          },
          { label: t.stock.netIncome, values: data.income.map((r) => formatCompact(r.netIncome, lang)) },
        ]}
      />
      <StatementTable
        title={t.stock.balanceTitle}
        periods={balancePeriods}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        rows={[
          { label: t.stock.totalAssets, values: data.balance.map((r) => formatCompact(r.totalAssets, lang)) },
          {
            label: t.stock.totalLiabilities,
            values: data.balance.map((r) => formatCompact(r.totalLiabilities, lang)),
          },
          { label: t.stock.equity, values: data.balance.map((r) => formatCompact(r.equity, lang)) },
        ]}
      />
      <StatementTable
        title={t.stock.cashflowTitle}
        periods={cashflowPeriods}
        periodColumn={t.stock.periodColumn}
        emptyLabel={t.stock.noTableData}
        rows={[
          { label: t.stock.cfOperating, values: data.cashflow.map((r) => formatCompact(r.operating, lang)) },
          { label: t.stock.cfInvesting, values: data.cashflow.map((r) => formatCompact(r.investing, lang)) },
          {
            label: t.stock.cfFinancing,
            values: data.cashflow.map((r) => formatCompact(r.financing, lang)),
          },
          {
            label: t.stock.freeCashFlow,
            values: data.cashflow.map((r) => formatCompact(r.freeCashFlow, lang)),
          },
        ]}
      />
    </div>
  );
};

const StockPage = () => {
  const t = useLanguageStore((s) => s.t);

  const [query, setQuery] = useState(''); // 첫 진입은 빈 값 — 검색 시에만 조회
  const [period, setPeriod] = useState<StatementPeriod>('annual');
  const [data, setData] = useState<Financials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 비동기 경로에서만 setState — 동기 setState(loading=true)는 이벤트 핸들러에서 처리.
  const load = useCallback((q: string, p: StatementPeriod) => {
    fetchFinancials(q, p)
      .then((res) => {
        setData(res);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (query) load(query, period);
  }, [query, period, load]);

  const runSearch = (ticker: string) => {
    const q = ticker.trim();
    if (!q) return;
    setLoading(true);
    setError(false);
    if (q === query) load(q, period);
    else setQuery(q);
  };

  const changePeriod = (p: StatementPeriod) => {
    if (p === period) return;
    setLoading(true);
    setPeriod(p);
  };

  const retry = () => {
    setLoading(true);
    setError(false);
    load(query, period);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <BarChart3 className="w-7 h-7 text-cb-accent" />
          {t.stock.title}
        </h2>
        <p className="mt-1.5 text-cb-muted">{t.stock.subtitle}</p>
      </header>

      {/* 검색(자동완성) */}
      <TickerAutocomplete
        onSearch={runSearch}
        placeholder={t.stock.searchPlaceholder}
        searchLabel={t.stock.search}
      />

      <p className="text-xs text-cb-muted px-1">{t.stock.examples}</p>

      {error && <ErrorRetry message={t.stock.error} retryLabel={t.stock.retry} onRetry={retry} />}

      {!error && loading && !data && <StockLoadingSkeleton />}

      {!error && !loading && !data && <EmptyState message={t.stock.empty} />}

      {!error && data && (
        <div className={`space-y-6 ${loading ? 'opacity-60 transition-opacity' : ''}`}>
          {/* 연간/분기 토글 — 티커 타이틀 위 */}
          <div className="flex justify-end">
            <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--cb-input-bg)]">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => changePeriod(p)}
                  className={[
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                    period === p
                      ? 'bg-cb-accent text-cb-on-accent'
                      : 'text-cb-muted hover:text-cb-foreground',
                  ].join(' ')}
                >
                  {p === 'annual' ? t.stock.annual : t.stock.quarterly}
                </button>
              ))}
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-cb-muted uppercase tracking-wide flex items-center gap-2">
              {data.ticker}
              <span className="text-cb-muted/70 font-medium normal-case">{t.stock.valuationTitle}</span>
            </h3>
            <ValuationCards data={data} />
          </section>
          <StatementsView data={data} />
        </div>
      )}
    </div>
  );
};

export default StockPage;
