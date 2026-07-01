import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Landmark, Rocket, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { fetchUsCalendar } from '../infrastructure/api/calendarClient';
import type { CalEarning, CalEconomic, CalIpo, UsCalendarWeek } from '../domain/calendar/types';
import type { TranslationSchema } from '../domain/i18n/types';
import type { StockSymbol } from '../domain/market/types';
import nasdaqData from '../data/stockSymbols.nasdaq.json';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';

type T = TranslationSchema;
type EventFilter = 'earnings' | 'ipos' | 'economic';
type Filter = 'all' | EventFilter;

// ── 날짜 유틸 (로컬 타임존, YYYY-MM-DD) ──
const toYMD = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
/** 그 주의 월요일. */
const startOfWeek = (d: Date): Date => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // 월=0
  x.setDate(x.getDate() - dow);
  return x;
};
const parseYMD = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// 값이 있을 때만 호출 — 없는 값은 렌더 자체를 생략(플레이스홀더 '—' 미사용).
const fmtUsd = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
};
const fmtRev = fmtUsd;
const fmtEps = (n: number): string => n.toFixed(2);

// 실적 티커 → 기업명 (NASDAQ 심볼 목록 기반). 매칭 없으면 null → 티커 그대로 노출.
const SYMBOL_MAP = new Map<string, StockSymbol>(
  (nasdaqData as StockSymbol[]).map((s) => [s.code, s]),
);
const companyName = (symbol: string, lang: string): string | null => {
  const s = SYMBOL_MAP.get(symbol);
  if (!s) return null;
  const name = lang === 'ko' ? s.nameKo : s.nameEn || s.nameKo;
  return name || null;
};

const CalendarPage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [data, setData] = useState<UsCalendarWeek | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const latestReq = useRef('');

  const weekStart = startOfWeek(anchor);
  const weekEnd = addDays(weekStart, 4); // 월~금 (주말 제외)
  const from = toYMD(weekStart);
  const to = toYMD(weekEnd);

  const load = useCallback((f: string, t2: string) => {
    const reqKey = `${f}:${t2}`;
    latestReq.current = reqKey;
    fetchUsCalendar(f, t2)
      .then((res) => {
        if (latestReq.current !== reqKey) return; // 오래된 주 응답 무시(주간 연타 race 방지)
        setData(res);
        setError(false);
      })
      .catch(() => {
        if (latestReq.current === reqKey) setError(true);
      });
  }, []);

  useEffect(() => {
    load(from, to);
  }, [from, to, load]);

  // 요청한 주와 로드된 주가 다르면 로딩 중. 오래된 주의 카운트/목록이 섞이지 않도록 현재 주만 사용.
  const currentData = data?.from === from && data.to === to ? data : null;
  const loading = !error && !currentData;

  const todayYMD = toYMD(new Date());
  const days = Array.from({ length: 5 }, (_, i) => toYMD(addDays(weekStart, i)));

  const counts = {
    earnings: currentData?.earnings?.length ?? 0,
    ipos: currentData?.ipos?.length ?? 0,
    economic: currentData?.economic?.length ?? 0,
  };
  const totalCount = counts.earnings + counts.ipos + counts.economic;
  // 필터가 반영된 노출 개수 — 카테고리 0건일 때 빈 안내를 제대로 띄우기 위함.
  const visibleCount = filter === 'all' ? totalCount : counts[filter];

  const rangeLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

  const chips: { id: Filter; label: string; n?: number }[] = [
    { id: 'all', label: t.calendar.filterAll, n: totalCount },
    { id: 'earnings', label: t.calendar.filterEarnings, n: counts.earnings },
    { id: 'ipos', label: t.calendar.filterIpo, n: counts.ipos },
    { id: 'economic', label: t.calendar.filterEconomic, n: counts.economic },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <CalendarDays className="w-7 h-7 text-cb-accent" />
          {t.calendar.title}
        </h2>
        <p className="mt-1.5 text-cb-muted">{t.calendar.subtitle}</p>
      </header>

      {/* 주간 네비게이터 */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setAnchor(addDays(weekStart, -7))}
          aria-label={t.calendar.prevWeek}
          className="p-2 rounded-lg border border-cb-border text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-cb-foreground tabular-nums">{rangeLabel}</span>
          <button
            onClick={() => setAnchor(new Date())}
            className="text-xs font-semibold text-cb-accent hover:underline"
          >
            {t.calendar.thisWeek}
          </button>
        </div>
        <button
          onClick={() => setAnchor(addDays(weekStart, 7))}
          aria-label={t.calendar.nextWeek}
          className="p-2 rounded-lg border border-cb-border text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                active
                  ? 'bg-cb-accent text-cb-on-accent'
                  : 'border border-cb-border text-cb-muted hover:text-cb-foreground hover:border-cb-accent/40',
              ].join(' ')}
            >
              {c.label}
              {typeof c.n === 'number' && <span className="ml-1 tabular-nums opacity-70">{c.n}</span>}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorRetry
          message={t.calendar.error}
          retryLabel={t.calendar.retry}
          onRetry={() => {
            setError(false);
            load(from, to);
          }}
        />
      ) : loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : visibleCount === 0 ? (
        <p className="glass-panel rounded-xl p-6 text-center text-sm text-cb-muted">
          {filter === 'all' ? t.calendar.empty : t.calendar.filteredEmpty}
        </p>
      ) : (
        <div className="space-y-3">
          {days.map((ymd) => {
            const dayEarnings =
              filter === 'all' || filter === 'earnings'
                ? (currentData?.earnings?.filter((e) => e.date === ymd) ?? [])
                : [];
            const dayIpos =
              filter === 'all' || filter === 'ipos'
                ? (currentData?.ipos?.filter((e) => e.date === ymd) ?? [])
                : [];
            const dayEcon =
              filter === 'all' || filter === 'economic'
                ? (currentData?.economic?.filter((e) => e.date === ymd) ?? [])
                : [];
            const empty = dayEarnings.length + dayIpos.length + dayEcon.length === 0;
            const d = parseYMD(ymd);
            const isToday = ymd === todayYMD;
            return (
              <section
                key={ymd}
                aria-current={isToday ? 'date' : undefined}
                aria-label={d.toLocaleDateString(lang, {
                  weekday: 'long',
                  month: 'numeric',
                  day: 'numeric',
                })}
                className={[
                  'glass-panel rounded-xl p-4',
                  isToday ? 'shadow-[0_0_0_1px_var(--cb-accent)]' : '',
                ].join(' ')}
              >
                <div className="flex items-baseline gap-2 mb-2.5">
                  <span
                    className={[
                      'text-sm font-bold',
                      isToday ? 'text-cb-accent' : 'text-cb-foreground',
                    ].join(' ')}
                  >
                    {d.toLocaleDateString(lang, { weekday: 'short' })}
                  </span>
                  <span className="text-xs text-cb-muted tabular-nums">
                    {d.getMonth() + 1}/{d.getDate()}
                  </span>
                </div>

                {empty ? (
                  <p className="text-xs text-cb-muted/60">{t.calendar.noEvents}</p>
                ) : (
                  <div className="space-y-4">
                    {dayEarningsBlock(dayEarnings, t, lang)}
                    {dayIpoBlock(dayIpos, t)}
                    {dayEconomic(dayEcon, t)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-cb-muted/70 px-1">{t.calendar.source}</p>
    </div>
  );
};

// ── 카테고리 블록 ──

const CatLabel = ({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) => (
  <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-1.5 ${color}`}>
    {icon}
    {label}
  </p>
);

const HOUR_KEY: Record<string, keyof T['calendar']> = {
  bmo: 'hourBmo',
  amc: 'hourAmc',
  dmh: 'hourDmh',
};
const IMPACT_KEY: Record<string, keyof T['calendar']> = {
  high: 'impactHigh',
  medium: 'impactMed',
  low: 'impactLow',
};
// 백엔드 경제지표 key → i18n 지표명(현지어). 미매핑 시 영문 event 폴백.
const IND_KEY: Record<string, keyof T['calendar']> = {
  employment: 'indEmployment',
  cpi: 'indCpi',
  pce: 'indPce',
  gdp: 'indGdp',
  ppi: 'indPpi',
  retail: 'indRetail',
  jolts: 'indJolts',
  jobless: 'indJobless',
  housing: 'indHousing',
  indprod: 'indIndprod',
};

/** 라벨+값 한 쌍 — 값 있을 때만 렌더('—' 미사용). */
const Metric = ({ label, value }: { label: string; value: string }) => (
  <span className="text-cb-muted">
    {label} <b className="text-cb-foreground font-semibold">{value}</b>
  </span>
);

const dayEarningsBlock = (list: CalEarning[], t: T, lang: string) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        label={t.calendar.catEarnings}
        color="text-cb-accent"
      />
      <div className="rounded-lg border border-cb-border divide-y divide-cb-border/50">
        {list.map((e, i) => {
          const hourLabel = e.hour && HOUR_KEY[e.hour] ? t.calendar[HOUR_KEY[e.hour]] : '';
          const name = companyName(e.symbol, lang);
          return (
            <div
              key={`${e.symbol}-${i}`}
              className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="min-w-0">
                  {name ? (
                    <>
                      <span className="block truncate text-sm font-bold text-cb-foreground">
                        {name}
                      </span>
                      <span className="block text-[10px] font-semibold text-cb-muted tabular-nums">
                        {e.symbol}
                      </span>
                    </>
                  ) : (
                    <span className="block text-sm font-bold text-cb-foreground">{e.symbol}</span>
                  )}
                </span>
                {hourLabel && (
                  <span className="shrink-0 text-[10px] font-semibold text-cb-muted bg-[var(--cb-input-bg)] px-1.5 py-0.5 rounded">
                    {hourLabel}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-3 text-xs tabular-nums">
                {e.epsEstimate != null && <Metric label={t.calendar.epsEst} value={fmtEps(e.epsEstimate)} />}
                {e.revenueEstimate != null && (
                  <Metric label={t.calendar.revEst} value={fmtRev(e.revenueEstimate)} />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

const dayIpoBlock = (list: CalIpo[], t: T) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<Rocket className="w-3.5 h-3.5" />}
        label={t.calendar.catIpo}
        color="text-indigo-400"
      />
      <div className="rounded-lg border border-cb-border divide-y divide-cb-border/50">
        {list.map((e, i) => (
          <div
            key={`${e.symbol || e.name}-${i}`}
            className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-cb-foreground">{e.name}</span>
              {(e.symbol || e.exchange) && (
                <span className="block text-[10px] font-semibold text-cb-muted">
                  {[e.symbol, e.exchange].filter(Boolean).join(' · ')}
                </span>
              )}
            </span>
            <span className="flex flex-wrap items-center gap-3 text-xs tabular-nums sm:justify-end">
              {e.price && <Metric label={t.calendar.ipoPrice} value={e.price} />}
              {e.totalSharesValue != null && (
                <Metric label={t.calendar.ipoValue} value={fmtUsd(e.totalSharesValue)} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

const dayEconomic = (list: CalEconomic[], t: T) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<Landmark className="w-3.5 h-3.5" />}
        label={t.calendar.catEconomic}
        color="text-amber-500"
      />
      <div className="rounded-lg border border-cb-border divide-y divide-cb-border/50">
        {list.map((e, i) => {
          const name = IND_KEY[e.key] ? t.calendar[IND_KEY[e.key]] : e.event;
          const impactLabel = e.impact && IMPACT_KEY[e.impact] ? t.calendar[IMPACT_KEY[e.impact]] : '';
          return (
            <div
              key={`${e.key}-${i}`}
              className="flex items-center justify-between gap-2 px-3 py-2"
            >
              <span className="text-sm font-semibold text-cb-foreground truncate">{name}</span>
              {impactLabel && (
                <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/12 px-1.5 py-0.5 rounded shrink-0">
                  {impactLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

export default CalendarPage;
