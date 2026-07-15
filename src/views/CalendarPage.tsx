'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Landmark, Rocket, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { fetchCalendar } from '../infrastructure/api/calendarClient';
import type { CalEarning, CalEconomic, CalIpo, CalendarMarket, CalendarWeek } from '../domain/calendar/types';
import type { TranslationSchema } from '../domain/i18n/types';
import { SYMBOL_BY_CODE } from '../data/tradeableSymbols';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';

type T = TranslationSchema;

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
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // 월=0
  return x;
};
const parseYMD = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
};
/** 이번 주 월~금 (initialFrom 우선, 없으면 오늘 기준). */
function weekRange(initialFrom?: string): { from: string; to: string } {
  const mon = startOfWeek(initialFrom ? parseYMD(initialFrom) : new Date());
  return { from: toYMD(mon), to: toYMD(addDays(mon, 4)) };
}

// ── 포맷 (값 있을 때만 렌더) ──
const fmtUsd = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
};
const fmtEps = (n: number): string => n.toFixed(2);
// KR 공모가 등 원화 문자열 — 천단위 구분 + '원'. 파싱 실패 시 원문 그대로.
const fmtKrw = (v: string): string => {
  const n = Number(v.replace(/[^\d.-]/g, ''));
  return v.trim() !== '' && Number.isFinite(n) ? `${n.toLocaleString()}원` : v;
};

// 실적 티커 → 현지어 종목명 (KR·US 통합 카탈로그). 매칭 없으면 null → 코드만 노출.
const companyName = (symbol: string, lang: string): string | null => {
  const s = SYMBOL_BY_CODE.get(symbol.toUpperCase());
  if (!s) return null;
  return (lang === 'ko' ? s.nameKo : s.nameEn || s.nameKo) || null;
};

const HOUR_KEY: Record<string, keyof T['calendar']> = { bmo: 'hourBmo', amc: 'hourAmc', dmh: 'hourDmh' };
const IMPACT_KEY: Record<string, keyof T['calendar']> = {
  high: 'impactHigh',
  medium: 'impactMed',
  low: 'impactLow',
};
// 백엔드 경제지표 key → i18n 지표명(현지어). 미매핑 시 원문 event 폴백.
const IND_KEY: Record<string, keyof T['calendar']> = {
  rate: 'indRate', // KR 한은 금통위
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

const CalendarPage = ({
  initialData = null,
  initialFrom,
}: {
  initialData?: CalendarWeek | null;
  initialFrom?: string;
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  // 주 이동 없음 — 이번 주(월~금) 고정. 서버가 준 initialFrom 으로 서버·클라 렌더 일치.
  const { from, to } = useMemo(() => weekRange(initialFrom), [initialFrom]);

  const [us, setUs] = useState<CalendarWeek | null>(initialData);
  const [kr, setKr] = useState<CalendarWeek | null>(null);
  const [usError, setUsError] = useState(false);
  const [krError, setKrError] = useState(false);
  // 모바일 전용 시장 선택 (데스크톱 md+ 는 2단 동시 노출이라 무시됨).
  const [mobileMarket, setMobileMarket] = useState<CalendarMarket>('KR');
  // 국가별 '오늘'(브라우저 타임존 기준) YYYY-MM-DD. 하이드레이션 불일치 방지 위해 마운트 후 계산.
  const [today, setToday] = useState<Record<CalendarMarket, string> | null>(null);

  const loadUs = useCallback(() => {
    setUsError(false);
    fetchCalendar('US', from, to)
      .then(setUs)
      .catch(() => setUsError(true));
  }, [from, to]);
  const loadKr = useCallback(() => {
    setKrError(false);
    fetchCalendar('KR', from, to)
      .then(setKr)
      .catch(() => setKrError(true));
  }, [from, to]);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    if (!initialData) loadUs(); // 서버 초기 데이터(US)가 있으면 재요청 생략
    loadKr(); // KR 은 항상 클라에서 로드
  }, [initialData, loadUs, loadKr]);

  useEffect(() => {
    // 미국(ET)·한국(KST)의 '오늘'을 브라우저 Intl 로 계산 (DST 자동 반영). en-CA = YYYY-MM-DD.
    const inTz = (tz: string) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    setToday({ US: inTz('America/New_York'), KR: inTz('Asia/Seoul') });
  }, []);

  const ws = parseYMD(from);
  const we = parseYMD(to);
  const rangeLabel = `${ws.getMonth() + 1}/${ws.getDate()} – ${we.getMonth() + 1}/${we.getDate()}`;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <h1 className="flex flex-wrap items-center gap-x-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <CalendarDays className="w-7 h-7 text-cb-accent" />
          {t.calendar.title}
          <span className="text-sm font-semibold text-cb-muted tabular-nums">{rangeLabel}</span>
        </h1>
        <p className="mt-1.5 text-cb-muted">{t.calendar.subtitle}</p>
      </header>

      {/* 모바일 전용 시장 토글 (데스크톱 md+ 는 2단 동시 노출) */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--cb-input-bg)] w-fit md:hidden">
        {(['US', 'KR'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMobileMarket(m)}
            className={[
              'px-4 py-1.5 rounded-md text-sm font-semibold transition-colors',
              mobileMarket === m
                ? 'bg-cb-accent text-cb-on-accent'
                : 'text-cb-muted hover:text-cb-foreground',
            ].join(' ')}
          >
            {m === 'US' ? t.calendar.marketUs : t.calendar.marketKr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className={`${mobileMarket === 'US' ? '' : 'hidden'} md:block`}>
          <MarketColumn
            label={t.calendar.marketUs}
            market="US"
            data={us}
            loading={!us && !usError}
            error={usError}
            onRetry={loadUs}
            today={today?.US ?? null}
            t={t}
            lang={lang}
          />
        </div>
        <div className={`${mobileMarket === 'KR' ? '' : 'hidden'} md:block`}>
          <MarketColumn
            label={t.calendar.marketKr}
            market="KR"
            data={kr}
            loading={!kr && !krError}
            error={krError}
            onRetry={loadKr}
            today={today?.KR ?? null}
            t={t}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
};

// ── 시장 컬럼 (미국 / 국내) ──
const MarketColumn = ({
  label,
  market,
  data,
  loading,
  error,
  onRetry,
  today,
  t,
  lang,
}: {
  label: string;
  market: CalendarMarket;
  data: CalendarWeek | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  today: string | null;
  t: T;
  lang: string;
}) => {
  const earnings = data?.earnings ?? [];
  const ipos = data?.ipos ?? [];
  const economic = data?.economic ?? [];
  const total = earnings.length + ipos.length + economic.length;

  return (
    <section className="glass-panel rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-baseline gap-2 min-w-0 text-sm font-bold text-cb-foreground">
          <span className="shrink-0">{label}</span>
          {today && (
            <span className="truncate text-[11px] font-semibold text-cb-accent tabular-nums">
              {weekdayLabel(today, lang)} {t.calendar.today}
            </span>
          )}
        </h2>
        {!loading && !error && (
          <span className="shrink-0 text-[11px] font-semibold text-cb-muted tabular-nums">
            {total}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorRetry message={t.calendar.error} retryLabel={t.calendar.retry} onRetry={onRetry} />
      ) : total === 0 ? (
        <p className="py-6 text-center text-sm text-cb-muted">{t.calendar.empty}</p>
      ) : (
        <div className="space-y-4">
          <EarningsGroup list={earnings} t={t} lang={lang} today={today} />
          <IpoGroup list={ipos} t={t} lang={lang} market={market} today={today} />
          <EconGroup list={economic} t={t} lang={lang} today={today} />
        </div>
      )}

      <p className="pt-1 text-[11px] text-cb-muted/60">
        {market === 'KR' ? t.calendar.sourceKr : t.calendar.source}
      </p>
    </section>
  );
};

// ── 공통 조각 ──
const CatLabel = ({
  icon,
  label,
  color,
  n,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  n: number;
}) => (
  <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-1.5 ${color}`}>
    {icon}
    {label}
    <span className="text-cb-muted/70 tabular-nums">{n}</span>
  </p>
);

/** 'YYYY-MM-DD' → 현지어 요일 + M/D (예: '화 7/14'). */
const weekdayLabel = (ymd: string, lang: string): string => {
  const d = parseYMD(ymd);
  return `${d.toLocaleDateString(lang, { weekday: 'short' })} ${d.getMonth() + 1}/${d.getDate()}`;
};

/** 날짜 오름차순 정렬 후 같은 날짜끼리 묶기. */
function groupByDate<X extends { date: string }>(list: X[]): { date: string; items: X[] }[] {
  const groups: { date: string; items: X[] }[] = [];
  for (const it of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
    const last = groups[groups.length - 1];
    if (last && last.date === it.date) last.items.push(it);
    else groups.push({ date: it.date, items: [it] });
  }
  return groups;
}

/** 카테고리 목록을 날짜 그룹(헤더 1개 + 하위 항목들)으로 렌더. 날짜는 그룹당 1회만 노출. */
function DateGrouped<X extends { date: string }>({
  list,
  lang,
  today,
  keyOf,
  renderItem,
}: {
  list: X[];
  lang: string;
  today: string | null;
  keyOf: (x: X, i: number) => string;
  renderItem: (x: X) => React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-cb-border overflow-hidden">
      {groupByDate(list).map((g, gi) => (
        <div key={g.date} className={gi > 0 ? 'border-t border-cb-border' : ''}>
          <div
            className={[
              'px-2.5 py-1 text-[11px] font-bold tabular-nums',
              g.date === today
                ? 'bg-cb-accent/15 text-cb-accent'
                : 'bg-[var(--cb-input-bg)] text-cb-muted',
            ].join(' ')}
          >
            {weekdayLabel(g.date, lang)}
          </div>
          <ul className="divide-y divide-cb-border/40">
            {g.items.map((it, i) => (
              <li
                key={keyOf(it, i)}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-2.5 py-1.5"
              >
                {renderItem(it)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const EarningsGroup = ({
  list,
  t,
  lang,
  today,
}: {
  list: CalEarning[];
  t: T;
  lang: string;
  today: string | null;
}) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        label={t.calendar.catEarnings}
        color="text-cb-accent"
        n={list.length}
      />
      <DateGrouped
        list={list}
        lang={lang}
        today={today}
        keyOf={(e, i) => `${e.symbol}-${i}`}
        renderItem={(e) => {
          const name = e.name ?? companyName(e.symbol, lang);
          const hourLabel = e.hour && HOUR_KEY[e.hour] ? t.calendar[HOUR_KEY[e.hour]] : '';
          // 표기: 티커코드(한국어이름) — 매칭 없으면 코드만.
          const nameEl = (
            <span className="truncate">
              <b className="font-semibold text-cb-foreground tabular-nums">{e.symbol}</b>
              {name && <span className="text-cb-muted">({name})</span>}
            </span>
          );
          return (
            <>
              <span className="flex-1 min-w-0 text-sm">
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cb-accent transition-colors"
                  >
                    {nameEl}
                  </a>
                ) : (
                  nameEl
                )}
              </span>
              {hourLabel && (
                <span className="shrink-0 text-[10px] font-semibold text-cb-muted bg-[var(--cb-input-bg)] px-1.5 py-0.5 rounded">
                  {hourLabel}
                </span>
              )}
              {(e.epsEstimate != null || e.revenueEstimate != null) && (
                <span className="flex items-center gap-2 shrink-0 text-xs tabular-nums text-cb-muted">
                  {e.epsEstimate != null && (
                    <span>
                      EPS <b className="text-cb-foreground">{fmtEps(e.epsEstimate)}</b>
                    </span>
                  )}
                  {e.revenueEstimate != null && (
                    <b className="text-cb-foreground">{fmtUsd(e.revenueEstimate)}</b>
                  )}
                </span>
              )}
            </>
          );
        }}
      />
    </div>
  );

const IpoGroup = ({
  list,
  t,
  lang,
  market,
  today,
}: {
  list: CalIpo[];
  t: T;
  lang: string;
  market: CalendarMarket;
  today: string | null;
}) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<Rocket className="w-3.5 h-3.5" />}
        label={t.calendar.catIpo}
        color="text-indigo-400"
        n={list.length}
      />
      <DateGrouped
        list={list}
        lang={lang}
        today={today}
        keyOf={(e, i) => `${e.symbol || e.name}-${i}`}
        renderItem={(e) => (
          <>
            <span className="flex-1 min-w-0 truncate text-sm">
              <b className="font-semibold text-cb-foreground">{e.name}</b>
              {(e.symbol || e.exchange) && (
                <span className="ml-1 text-[10px] text-cb-muted">
                  {[e.symbol, e.exchange].filter(Boolean).join(', ')}
                </span>
              )}
            </span>
            {e.price && (
              <span className="shrink-0 text-xs font-semibold text-cb-foreground tabular-nums">
                {market === 'KR' ? fmtKrw(e.price) : e.price}
              </span>
            )}
            {e.totalSharesValue != null && (
              <span className="shrink-0 text-xs text-cb-muted tabular-nums">
                {fmtUsd(e.totalSharesValue)}
              </span>
            )}
          </>
        )}
      />
    </div>
  );

const EconGroup = ({
  list,
  t,
  lang,
  today,
}: {
  list: CalEconomic[];
  t: T;
  lang: string;
  today: string | null;
}) =>
  list.length === 0 ? null : (
    <div>
      <CatLabel
        icon={<Landmark className="w-3.5 h-3.5" />}
        label={t.calendar.catEconomic}
        color="text-amber-500"
        n={list.length}
      />
      <DateGrouped
        list={list}
        lang={lang}
        today={today}
        keyOf={(e, i) => `${e.key}-${i}`}
        renderItem={(e) => {
          const name = IND_KEY[e.key] ? t.calendar[IND_KEY[e.key]] : e.event;
          const impactLabel = e.impact && IMPACT_KEY[e.impact] ? t.calendar[IMPACT_KEY[e.impact]] : '';
          return (
            <>
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-cb-foreground">
                {name}
              </span>
              {impactLabel && (
                <span className="shrink-0 text-[10px] font-semibold text-amber-500 bg-amber-500/12 px-1.5 py-0.5 rounded">
                  {impactLabel}
                </span>
              )}
            </>
          );
        }}
      />
    </div>
  );

export default CalendarPage;
