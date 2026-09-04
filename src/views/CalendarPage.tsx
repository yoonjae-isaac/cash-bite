'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Crown, Landmark, Rocket, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { fetchCalendar } from '../infrastructure/api/calendarClient';
import { fetchGuruHeldSymbols } from '../infrastructure/api/guruClient';
import { fetchStockLogos } from '../infrastructure/api/logoClient';
import TickerLogo from '../components/ui/TickerLogo';
import type { CalEarning, CalEconomic, CalIpo, CalendarMarket, CalendarWeek } from '../domain/calendar/types';
import type { TranslationSchema } from '../domain/i18n/types';
import { SYMBOL_BY_CODE } from '../data/tradeableSymbols';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';

type T = TranslationSchema;
type CalendarCategory = 'all' | 'earnings' | 'ipos' | 'economic';

const LOGO_FETCH_LIMIT = 40; // 백엔드 배치 상한과 맞춘다

// ── 날짜 유틸 (로컬 타임존, YYYY-MM-DD) ──
// 주간 범위(월~금)는 백엔드가 산출 — 프론트는 응답 from/to 만 사용(타임존/롤오버 단일 기준).
const parseYMD = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
};

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
  fomc: 'indFomc', // US 연준 FOMC (정적 큐레이션)
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
}: {
  initialData?: CalendarWeek | null;
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  const [us, setUs] = useState<CalendarWeek | null>(initialData);
  const [kr, setKr] = useState<CalendarWeek | null>(null);
  const [usError, setUsError] = useState(false);
  const [krError, setKrError] = useState(false);
  // 시장 선택 — 한 번에 한 시장만 본다. 2단 동시 노출은 한 컬럼이 좁아 정보가 눌렸다.
  // 기본값 US: 서버가 미리 채워 보내는 initialData 가 US 라 첫 화면이 곧바로 채워지고,
  // 이 서비스의 축(13F·거장 보유 ★)이 미국 종목이라 국내로 열면 정작 볼 게 없다.
  const [market, setMarket] = useState<CalendarMarket>('US');
  // 종목 로고 — 미국 실적만 (국내는 숫자 코드라 로고 제공처에 매칭되지 않는다).
  const [logos, setLogos] = useState<Record<string, string>>({});
  // '오늘'(KST 기준) YYYY-MM-DD. 하이드레이션 불일치 방지 위해 마운트 후 계산.
  const [today, setToday] = useState<Record<CalendarMarket, string> | null>(null);
  // 카테고리 내부 탭 — 실적/IPO/경제 따로 보기 (양쪽 시장 동시 필터).
  const [category, setCategory] = useState<CalendarCategory>('all');
  // 거장(13F) 보유 종목만 보기 — 실적 항목에만 적용. 맵은 마운트 후 1회 로드.
  const [guruOnly, setGuruOnly] = useState(false);
  const [guruSymbols, setGuruSymbols] = useState<Record<string, number> | null>(null);

  // 주간 범위는 백엔드가 산출(현재 영업주, KST) — 응답 from/to 를 그대로 사용. US·KR 동일 주간.
  const loadUs = useCallback(() => {
    setUsError(false);
    fetchCalendar('US')
      .then(setUs)
      .catch(() => setUsError(true));
  }, []);
  const loadKr = useCallback(() => {
    setKrError(false);
    fetchCalendar('KR')
      .then(setKr)
      .catch(() => setKrError(true));
  }, []);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    if (!initialData) loadUs(); // 서버 초기 데이터(US)가 있으면 재요청 생략
    loadKr(); // KR 은 항상 클라에서 로드
    // 거장 보유 티커 맵 — 부가 기능이라 실패하면 필터 자체를 노출하지 않는다.
    fetchGuruHeldSymbols()
      .then((res) => setGuruSymbols(res.symbols))
      .catch(() => setGuruSymbols(null));
  }, [initialData, loadUs, loadKr]);

  // 미국 실적 로고 — 화면에 실제로 나오는 앞쪽 종목만. 백엔드가 종목당 30일 캐시한다.
  useEffect(() => {
    const symbols = (us?.earnings ?? []).slice(0, LOGO_FETCH_LIMIT).map((e) => e.symbol);
    if (symbols.length === 0) return;
    let alive = true;
    fetchStockLogos(symbols)
      .then((m) => {
        if (alive) setLogos((prev) => ({ ...prev, ...m }));
      })
      .catch(() => {
        /* 로고는 보조 표식 — 실패하면 이니셜 배지로 대체된다 */
      });
    return () => {
      alive = false;
    };
  }, [us]);

  useEffect(() => {
    // '오늘'은 시장의 현지 날짜로 잡는다.
    // 미국 일정을 KST 로 판정하면 한국 낮 시간에 미국의 그날 장이 아직 열리지도 않았는데
    // 이미 지난 일정으로 밀려난다(KST 가 ET 보다 13~14시간 앞선다). tz 를 명시해 계산하므로
    // 브라우저 타임존과도 무관하다.
    const dateIn = (timeZone: string): string =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    setToday({ US: dateIn('America/New_York'), KR: dateIn('Asia/Seoul') });
  }, []);

  // 라벨용 주간 범위 — 로드된 응답(US 우선, 없으면 KR/초기데이터)의 from/to.
  const range = us ?? kr ?? initialData;
  const rangeLabel = range
    ? `${parseYMD(range.from).getMonth() + 1}/${parseYMD(range.from).getDate()} – ${parseYMD(range.to).getMonth() + 1}/${parseYMD(range.to).getDate()}`
    : '';

  // 거장 보유 필터가 켜졌을 때 실적 목록을 좁히는 함수 — 티커 대문자 기준.
  // 맵이 없거나 필터가 꺼져 있으면 원본을 그대로 통과시킨다.
  const filterEarnings = useCallback(
    (list: CalEarning[]): CalEarning[] =>
      guruOnly && guruSymbols
        ? list.filter((e) => guruSymbols[e.symbol.toUpperCase()] !== undefined)
        : list,
    [guruOnly, guruSymbols],
  );

  // 탭 카운트 = 미국+국내 합계 (거장 필터 반영).
  const catTotals = {
    earnings: filterEarnings(us?.earnings ?? []).length + filterEarnings(kr?.earnings ?? []).length,
    ipos: (us?.ipos.length ?? 0) + (kr?.ipos.length ?? 0),
    economic: (us?.economic.length ?? 0) + (kr?.economic.length ?? 0),
  };
  const tabs: { id: CalendarCategory; label: string; n: number }[] = [
    { id: 'all', label: t.calendar.filterAll, n: catTotals.earnings + catTotals.ipos + catTotals.economic },
    { id: 'earnings', label: t.calendar.filterEarnings, n: catTotals.earnings },
    { id: 'ipos', label: t.calendar.filterIpo, n: catTotals.ipos },
    { id: 'economic', label: t.calendar.filterEconomic, n: catTotals.economic },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex flex-wrap items-center gap-x-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          {t.calendar.title}
          <span className="text-sm font-semibold text-cb-muted tabular-nums">{rangeLabel}</span>
        </h1>
        <p className="mt-1.5 text-cb-muted">{t.calendar.subtitle}</p>
      </header>

      {/* 카테고리 내부 탭 (전체 / 실적 / IPO / 경제) — 양쪽 시장 동시 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              category === c.id
                ? 'bg-cb-accent text-cb-on-accent'
                : 'border border-cb-border text-cb-muted hover:border-cb-accent/40 hover:text-cb-foreground',
            ].join(' ')}
          >
            {c.label}
            <span className="ml-1 tabular-nums opacity-70">{c.n}</span>
          </button>
        ))}

        {/* 거장 보유 종목만 — 13F 맵을 못 받았으면 노출하지 않는다 */}
        {guruSymbols && (category === 'all' || category === 'earnings') && (
          <button
            onClick={() => setGuruOnly((v) => !v)}
            aria-pressed={guruOnly}
            title={t.calendar.guruFilterHint}
            className={[
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors',
              guruOnly
                ? 'bg-cb-accent text-cb-on-accent'
                : 'border border-cb-border text-cb-muted hover:border-cb-accent/40 hover:text-cb-foreground',
            ].join(' ')}
          >
            <Crown className="h-3.5 w-3.5" />
            {t.calendar.guruOnly}
          </button>
        )}
      </div>

      {/* 시장 토글 — 한 번에 한 시장. 전체 폭을 써야 종목명·수치가 눌리지 않는다. */}
      <div className="flex w-fit gap-1 rounded-xl bg-[var(--cb-input-bg)] p-1">
        {(['US', 'KR'] as const).map((m) => {
          const count = (m === 'US' ? us : kr);
          const n = count
            ? filterEarnings(count.earnings).length + count.ipos.length + count.economic.length
            : null;
          return (
            <button
              key={m}
              onClick={() => setMarket(m)}
              aria-pressed={market === m}
              className={[
                'rounded-lg px-5 py-2 text-sm font-bold transition-colors',
                market === m
                  ? 'bg-cb-accent text-cb-on-accent'
                  : 'text-cb-muted hover:text-cb-foreground',
              ].join(' ')}
            >
              {m === 'US' ? t.calendar.marketUs : t.calendar.marketKr}
              {n !== null && (
                <span className="ml-1.5 text-xs font-semibold opacity-70 tabular-nums">{n}</span>
              )}
            </button>
          );
        })}
      </div>

      {market === 'US' ? (
        <MarketColumn
          label={t.calendar.marketUs}
          market="US"
          data={us}
          loading={!us && !usError}
          error={usError}
          onRetry={loadUs}
          today={today?.US ?? null}
          category={category}
          filterEarnings={filterEarnings}
          guruSymbols={guruSymbols}
          logos={logos}
          t={t}
          lang={lang}
        />
      ) : (
        <MarketColumn
          label={t.calendar.marketKr}
          market="KR"
          data={kr}
          loading={!kr && !krError}
          error={krError}
          onRetry={loadKr}
          today={today?.KR ?? null}
          category={category}
          filterEarnings={filterEarnings}
          guruSymbols={guruSymbols}
          logos={logos}
          t={t}
          lang={lang}
        />
      )}
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
  category,
  filterEarnings,
  guruSymbols,
  logos,
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
  category: CalendarCategory;
  filterEarnings: (list: CalEarning[]) => CalEarning[];
  guruSymbols: Record<string, number> | null;
  logos: Record<string, string>;
  t: T;
  lang: string;
}) => {
  const [showPast, setShowPast] = useState(false);

  // 거장이 보유한 종목을 앞으로 — 하루에 수십 건이 나오는 날 무엇부터 볼지 정해준다.
  // 날짜 그룹핑(groupByDate)의 정렬이 안정 정렬이라, 여기서 잡은 순서가 같은 날짜 안에서 유지된다.
  const guruRank = (e: CalEarning): number => guruSymbols?.[e.symbol.toUpperCase()] ?? 0;
  const earnings = filterEarnings(data?.earnings ?? [])
    .slice()
    .sort((a, b) => guruRank(b) - guruRank(a));
  const ipos = data?.ipos ?? [];
  const economic = data?.economic ?? [];
  const showEarn = category === 'all' || category === 'earnings';
  const showIpo = category === 'all' || category === 'ipos';
  const showEcon = category === 'all' || category === 'economic';

  // 오늘·이후를 위로, 이미 끝난 일정은 아래 접이식 영역으로 분리한다.
  // today 미확정(SSR)이면 전부 '다가올'로 둬 서버·클라 렌더가 어긋나지 않게 한다.
  const isPast = <X extends { date: string }>(x: X): boolean => today != null && x.date < today;
  const upcoming = {
    earnings: earnings.filter((e) => !isPast(e)),
    ipos: ipos.filter((e) => !isPast(e)),
    economic: economic.filter((e) => !isPast(e)),
  };
  const past = {
    earnings: earnings.filter(isPast),
    ipos: ipos.filter(isPast),
    economic: economic.filter(isPast),
  };
  const countOf = (g: typeof upcoming): number =>
    (showEarn ? g.earnings.length : 0) + (showIpo ? g.ipos.length : 0) + (showEcon ? g.economic.length : 0);
  const upcomingCount = countOf(upcoming);
  const pastCount = countOf(past);
  const visibleCount = upcomingCount + pastCount;

  const groups = (g: typeof upcoming): React.ReactNode => (
    <div className="space-y-4">
      {showEarn && (
        <EarningsGroup
          list={g.earnings}
          t={t}
          lang={lang}
          today={today}
          guruSymbols={guruSymbols}
          logos={logos}
        />
      )}
      {showIpo && <IpoGroup list={g.ipos} t={t} lang={lang} market={market} today={today} />}
      {showEcon && <EconGroup list={g.economic} t={t} lang={lang} today={today} />}
    </div>
  );

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
            {visibleCount}
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
      ) : visibleCount === 0 ? (
        <p className="py-6 text-center text-sm text-cb-muted">
          {category === 'all' ? t.calendar.empty : t.calendar.filteredEmpty}
        </p>
      ) : (
        <div className="space-y-4">
          {upcomingCount > 0 ? (
            groups(upcoming)
          ) : (
            <p className="py-6 text-center text-sm text-cb-muted">{t.calendar.noUpcoming}</p>
          )}

          {pastCount > 0 && (
            <div className="border-t border-cb-border pt-4">
              <button
                type="button"
                onClick={() => setShowPast((v) => !v)}
                aria-expanded={showPast}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cb-muted transition-colors hover:text-cb-foreground"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showPast ? 'rotate-180' : ''}`}
                  aria-hidden
                />
                {t.calendar.pastEvents}
                <span className="tabular-nums">{pastCount}</span>
              </button>
              {showPast && <div className="mt-3 opacity-60">{groups(past)}</div>}
            </div>
          )}
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
  <p className={`mb-2 flex items-center gap-1.5 text-sm font-bold tracking-tight ${color}`}>
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
      {groupByDate(list).map((g, gi) => {
        // 오늘만 테두리로 강조. 지난 일정은 호출부에서 별도 영역으로 분리하므로 여기선 다루지 않는다.
        const isToday = today != null && g.date === today;
        return (
          <div
            key={g.date}
            className={[
              gi > 0 ? 'border-t border-cb-border' : '',
              isToday ? 'ring-2 ring-inset ring-cb-accent' : '',
            ].join(' ')}
          >
            <div
              className={[
                'flex items-baseline gap-2 px-4 py-2 text-sm font-bold tabular-nums',
                isToday
                  ? 'bg-cb-accent/15 text-cb-accent'
                  : 'bg-[var(--cb-input-bg)] text-cb-muted',
              ].join(' ')}
            >
              {weekdayLabel(g.date, lang)}
              <span className="text-xs font-semibold opacity-70">{g.items.length}</span>
            </div>
            <ul className="divide-y divide-cb-border/40">
              {g.items.map((it, i) => (
                <li
                  key={keyOf(it, i)}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 theme-row"
                >
                  {renderItem(it)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

const EarningsGroup = ({
  list,
  t,
  lang,
  today,
  guruSymbols,
  logos,
}: {
  list: CalEarning[];
  t: T;
  lang: string;
  today: string | null;
  guruSymbols: Record<string, number> | null;
  logos: Record<string, string>;
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
          const guruCount = guruSymbols?.[e.symbol.toUpperCase()];
          // 국내는 종목코드(005930)가 아니라 회사명이 식별자다 — 숫자로 시작하면 이름을 앞세운다.
          const isNumericCode = /^\d/.test(e.symbol);
          const primary = isNumericCode && name ? name : e.symbol;
          const secondary = isNumericCode && name ? e.symbol : name;

          const nameEl = (
            <span className="flex min-w-0 items-center gap-2.5">
              <TickerLogo symbol={primary} src={logos[e.symbol.toUpperCase()]} />
              <span className="min-w-0">
                <b className="flex items-center gap-1.5 text-base font-bold leading-tight text-cb-foreground">
                  <span className="truncate">{primary}</span>
                  {guruCount !== undefined && (
                    <span
                      title={`${guruCount}${t.calendar.guruHeldBadge}`}
                      className="shrink-0 rounded bg-cb-accent/15 px-1.5 py-px text-[10px] font-bold text-cb-accent"
                    >
                      ★{guruCount}
                    </span>
                  )}
                </b>
                {secondary && (
                  <span className="block truncate text-xs leading-tight text-cb-muted tabular-nums">
                    {secondary}
                  </span>
                )}
              </span>
            </span>
          );
          return (
            <>
              <span className="min-w-0 flex-1">
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-cb-accent"
                  >
                    {nameEl}
                  </a>
                ) : (
                  nameEl
                )}
              </span>
              {hourLabel && (
                <span className="shrink-0 rounded-md bg-[var(--cb-input-bg)] px-2 py-1 text-[11px] font-semibold text-cb-muted">
                  {hourLabel}
                </span>
              )}
              {(e.epsEstimate != null || e.revenueEstimate != null) && (
                <span className="flex shrink-0 items-center gap-3 text-right tabular-nums">
                  {e.epsEstimate != null && (
                    <span className="text-xs text-cb-muted">
                      EPS{' '}
                      <b className="text-sm text-cb-foreground">{fmtEps(e.epsEstimate)}</b>
                    </span>
                  )}
                  {e.revenueEstimate != null && (
                    <b className="text-sm text-cb-foreground">{fmtUsd(e.revenueEstimate)}</b>
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
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <TickerLogo symbol={e.symbol || e.name} />
              <span className="min-w-0">
                <b className="block truncate text-base font-bold leading-tight text-cb-foreground">
                  {e.name}
                </b>
                {(e.symbol || e.exchange) && (
                  <span className="block truncate text-xs leading-tight text-cb-muted">
                    {[e.symbol, e.exchange].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
            </span>
            {e.price && (
              <span className="shrink-0 text-sm font-bold text-cb-foreground tabular-nums">
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
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-amber-500/12 text-amber-500"
                  aria-hidden
                >
                  <Landmark className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-base font-bold text-cb-foreground">{name}</span>
              </span>
              {impactLabel && (
                <span className="shrink-0 rounded-md bg-amber-500/12 px-2 py-1 text-[11px] font-semibold text-amber-500">
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
