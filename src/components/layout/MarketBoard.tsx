'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronRight, List, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { PATH_OF } from '../../application/routing/pages';
import TickerLogo from '../ui/TickerLogo';
import type { BoardConfig, BoardEconomicItem, BoardItem } from '../../domain/calendar/board';

/** 모바일에서 스택으로 노출할 최대 건수 — 홈 첫 화면에서 전광판이 가져가도 되는 높이 기준. */
const MOBILE_MAX = 3;

/**
 * 이 건수부터 자동 흐름을 켠다. 한 주 중요 발표는 보통 1~3건이라, 적을 때 흐르게 두면
 * 넓은 빈 자리를 글자가 가로지르며 양끝에서 잘리기만 한다 — 그때는 고정이 더 잘 읽힌다.
 */
const FLOW_MIN_ITEMS = 3;

/** 'YYYY-MM-DD' → 요일+날짜 '수 8/12'. 문자열 기반이라 서버·클라 결과가 같다. */
const whenLabel = (ymd: string): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  const day = ['일', '월', '화', '수', '목', '금', '토'][new Date(y, m - 1, d).getDay()];
  return `${day} ${m}/${d}`;
};

/** 오늘(KST) 대비 D-day 표기. 오늘이면 '오늘', 지난 발표면 null. */
const ddayLabel = (ymd: string, today: string): string | null => {
  if (ymd === today) {
    return '오늘';
  }
  if (ymd < today) {
    return null;
  }
  const [ty, tm, td] = today.split('-').map(Number);
  const [y, m, d] = ymd.split('-').map(Number);
  const diff = Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000,
  );
  return `D-${diff}`;
};

/**
 * 전광판 한 칸의 표기명. 실적에 '실적'을 붙이는 이유: 한 줄에 지표와 섞여 있어
 * 티커만 있으면 그게 무슨 일정인지 알 수 없다(미국 종목은 대개 이름이 없어 티커로 나온다).
 */
const titleOf = (item: BoardItem): string =>
  item.kind === 'economic' ? item.insight.title : `${item.name ?? item.ticker} 실적`;

/**
 * 전광판 한 칸의 껍데기 — 지표는 그 자리에서 해설을 펼치고, 실적은 증시 일정으로 보낸다.
 *
 * 세 군데(데스크톱 티커·모바일 첫 줄·모바일 스택)가 안쪽 마크업만 다르고 클릭 동작은 같아
 * 껍데기만 여기로 모은다. 실적에 해설 상세를 달지 않는 이유는
 * `domain/calendar/board.ts` 의 BoardEarningsItem 주석 참고.
 */
const TickShell = ({
  item,
  openId,
  onSelect,
  className,
  duplicate = false,
  children,
}: {
  item: BoardItem;
  openId: string | null;
  onSelect: (id: string) => void;
  className: string;
  /** 복제 트랙(aria-hidden)의 요소는 탭 순회에서 뺀다. */
  duplicate?: boolean;
  children: React.ReactNode;
}) =>
  item.kind === 'earnings' ? (
    <Link
      href={PATH_OF.calendar}
      tabIndex={duplicate ? -1 : undefined}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      tabIndex={duplicate ? -1 : undefined}
      aria-expanded={openId === item.id}
      className={className}
    >
      {children}
    </button>
  );

/**
 * 칸 앞의 표식 — 실적은 종목 로고, 지표는 달력 아이콘.
 *
 * 지표에도 같은 크기의 표식을 두는 이유: 목록에서 로고 있는 줄과 없는 줄이 섞이면 제목 시작점이
 * 어긋나 열이 무너진다. 아이콘 모양 자체가 '기업 실적 / 경제지표' 구분도 겸한다.
 * 로고가 없는 티커는 TickerLogo 가 이니셜 배지로 대체한다.
 */
const ItemLogo = ({ item, logos }: { item: BoardItem; logos?: Record<string, string> }) =>
  item.kind === 'earnings' ? (
    <TickerLogo symbol={item.ticker} src={logos?.[item.ticker.toUpperCase()]} size="sm" />
  ) : (
    <span
      aria-hidden
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-amber-500/12 text-amber-600 dark:text-amber-400"
    >
      <CalendarDays className="h-3.5 w-3.5" />
    </span>
  );

/** 보유 거장 수 배지 — 증시 일정의 ★N 과 같은 표기를 쓴다. */
const GuruBadge = ({ count }: { count: number }) => (
  <span
    title={`거장 ${count}명 보유`}
    className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums bg-amber-500/15 text-amber-600 dark:text-amber-400"
  >
    ★{count}
  </span>
);

/**
 * 홈 최상단 전광판 — 금주 미국 경제지표 발표와 거장 보유 종목 실적을 흘려보낸다.
 * 지표는 누르면 쉬운 해설을 펼치고, 실적은 증시 일정으로 보낸다.
 *
 * 노출 여부(어떤 주에 뜨는가)는 `src/config/boardRules.ts` 가 정해 서버에서 판정하고,
 * 이 컴포넌트는 받은 데이터를 그리기만 한다. 홈이 아닌 경로에서는 스스로 렌더를 접는다
 * (레이아웃 셸에 있어 모든 라우트를 지나므로).
 */
const MarketBoard = ({ config }: { config: BoardConfig }) => {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  // 흐르는 줄은 지나가버려 원하는 항목을 붙잡기 어렵다 — 목록으로 한 번에 펼쳐 보는 통로.
  const [listOpen, setListOpen] = useState(false);
  // '오늘'(KST)은 마운트 후 계산 — 서버 렌더 시각과 어긋나 하이드레이션이 깨지는 것을 막는다.
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    );
  }, []);

  if (pathname !== '/') {
    return null;
  }

  // 해설 상세가 있는 건 경제지표뿐 — 실적 칸은 애초에 onSelect 를 부르지 않는다.
  const open =
    config.items.find(
      (it): it is BoardEconomicItem => it.kind === 'economic' && it.id === openId,
    ) ?? null;
  const flowing = config.items.length >= FLOW_MIN_ITEMS;
  // 모바일은 흐르지 않고 스택 — 아직 지나지 않은 발표부터 채운다(전부 지났으면 그대로 보여준다).
  const upcoming = today ? config.items.filter((it) => it.date >= today) : config.items;
  const mobileItems = (upcoming.length > 0 ? upcoming : config.items).slice(0, MOBILE_MAX);
  // 아이템 0건이면 resolveBoard 가 null 을 주므로 여기까지 오지 않는다.
  const [lead, ...rest] = mobileItems;

  const toggle = (id: string): void => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      aria-label="이번 주 시장 일정"
      className="w-full border-b border-cb-border bg-cb-surface"
    >
      <div className="shell-container">
        <div className="flex items-stretch min-h-[58px]">
          <div className="flex items-center gap-2 shrink-0 pr-3 md:pr-4 md:border-r md:border-cb-border">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
            />
            <span className="text-[12.5px] font-bold text-cb-foreground whitespace-nowrap">
              {config.label}
            </span>
            <span className="hidden md:inline text-[10.5px] font-semibold text-cb-muted tabular-nums">
              {config.weekLabel}
            </span>
          </div>

          {/* 데스크톱 — 건수가 많으면 흐르고(원본+복제 두 그룹), 적으면 고정 */}
          {flowing ? (
            <div className="board-ticker hidden md:block flex-1 min-w-0">
              <div className="board-ticker__track">
                <ul className="flex items-center list-none m-0 p-0">
                  {config.items.map((it) => (
                    <li key={it.id}>
                      <Tick item={it} today={today} openId={openId} onSelect={toggle} logos={config.logos} />
                    </li>
                  ))}
                </ul>
                <ul aria-hidden className="flex items-center list-none m-0 p-0">
                  {config.items.map((it) => (
                    <li key={`dup-${it.id}`}>
                      <Tick
                        item={it}
                        today={today}
                        openId={openId}
                        onSelect={toggle}
                        logos={config.logos}
                        duplicate
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <ul className="hidden md:flex flex-1 min-w-0 items-center list-none m-0 p-0 overflow-x-auto">
              {config.items.map((it) => (
                <li key={it.id}>
                  <Tick item={it} today={today} openId={openId} onSelect={toggle} logos={config.logos} />
                </li>
              ))}
            </ul>
          )}

          {/* 모바일 — 가장 임박한 1건만 한 줄로 (나머지는 아래 스택) */}
          <TickShell
            item={lead}
            openId={openId}
            onSelect={toggle}
            className="md:hidden flex flex-1 min-w-0 items-center gap-2 text-left"
          >
            <ItemLogo item={lead} logos={config.logos} />
            <span className="truncate text-[13.5px] font-semibold text-cb-foreground">
              {titleOf(lead)}
            </span>
            {lead.kind === 'earnings' && <GuruBadge count={lead.guruCount} />}
            <DdayBadge date={lead.date} today={today} />
          </TickShell>

          <div className="flex shrink-0 items-center gap-1 self-center pl-2 md:pl-4">
            {/* 흐르는 줄에서 놓친 항목을 목록으로 — 모바일에서도 스택(최대 3건) 밖의 나머지를 볼 통로. */}
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              aria-expanded={listOpen}
              aria-controls="market-board-list"
              className={[
                'flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors',
                listOpen
                  ? 'bg-[var(--cb-hover)] text-cb-foreground'
                  : 'text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
              ].join(' ')}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{listOpen ? '접기' : `목록 ${config.items.length}`}</span>
            </button>

            {/* 국내 일정·실적·공모주는 전광판에 싣지 않는다 — 빼는 게 아니라 이 링크로 옮긴 것. */}
            <Link
              href={PATH_OF.calendar}
              className="hidden md:flex items-center gap-0.5 pl-2 text-xs font-semibold text-cb-muted hover:text-cb-foreground transition-colors"
            >
              증시 일정 전체
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 목록 — 흐름·스택과 달리 자르지 않고 이번 주 전부를 날짜순 그대로 보여준다. */}
      {listOpen && (
        <div id="market-board-list" className="border-t border-cb-border">
          <div className="shell-container">
            <ul className="list-none m-0 p-0">
              {config.items.map((it) => {
                const isPast = today != null && it.date < today;
                return (
                  <li key={`list-${it.id}`} className="border-t border-cb-border first:border-t-0">
                    <TickShell
                      item={it}
                      openId={openId}
                      onSelect={toggle}
                      className={[
                        'flex w-full items-center gap-2.5 px-1 py-2.5 text-left transition-colors',
                        'hover:bg-[var(--cb-hover)]',
                        openId === it.id ? 'bg-[var(--cb-hover)]' : '',
                        isPast ? 'opacity-45' : '',
                      ].join(' ')}
                    >
                      <span className="shrink-0 w-[104px] text-[11.5px] text-cb-muted tabular-nums">
                        {whenLabel(it.date)} · {it.time}
                      </span>
                      <ItemLogo item={it} logos={config.logos} />
                      <span className="flex-1 min-w-0 truncate text-[13.5px] font-semibold text-cb-foreground">
                        {titleOf(it)}
                      </span>
                      {it.kind === 'earnings' && <GuruBadge count={it.guruCount} />}
                      <DdayBadge date={it.date} today={today} />
                      {it.kind === 'earnings' && (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-cb-muted" />
                      )}
                    </TickShell>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 모바일 스택 — 흐르는 글자는 좁은 화면에서 읽히지 않아 상위 건수만 세로로.
          목록을 펼치면 같은 항목이 두 번 나오므로 접는다. */}
      {rest.length > 0 && !listOpen && (
        <ul className="md:hidden list-none m-0 p-0 border-t border-cb-border">
          {rest.map((it) => (
            <li key={it.id} className="border-t border-cb-border first:border-t-0">
              <TickShell
                item={it}
                openId={openId}
                onSelect={toggle}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
              >
                <ItemLogo item={it} logos={config.logos} />
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-cb-foreground">
                    {titleOf(it)}
                  </span>
                  <span className="block text-[11px] text-cb-muted tabular-nums">
                    {whenLabel(it.date)} · {it.time}
                  </span>
                </span>
                {it.kind === 'earnings' && <GuruBadge count={it.guruCount} />}
                <DdayBadge date={it.date} today={today} />
              </TickShell>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="border-t border-cb-border">
          <div className="shell-container py-4 md:py-5">
            <Detail item={open} onClose={() => setOpenId(null)} />
          </div>
        </div>
      )}
    </section>
  );
};

/** D-day 배지 — '오늘'은 액센트 반전, 지난 발표는 표기 없음. today 미확정(SSR)일 땐 자리만 비운다. */
const DdayBadge = ({ date, today }: { date: string; today: string | null }) => {
  const label = today && date ? ddayLabel(date, today) : null;
  if (!label) {
    return null;
  }
  const isToday = label === '오늘';
  return (
    <span
      className={[
        'shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
        isToday
          ? 'bg-cb-accent text-cb-on-accent'
          : 'bg-[var(--cb-input-bg)] text-cb-muted',
      ].join(' ')}
    >
      {label}
    </span>
  );
};

/** 티커 한 장. 복제 트랙(aria-hidden)의 버튼은 탭 순회에서 뺀다. */
const Tick = ({
  item,
  today,
  openId,
  onSelect,
  logos,
  duplicate = false,
}: {
  item: BoardItem;
  today: string | null;
  openId: string | null;
  onSelect: (id: string) => void;
  logos?: Record<string, string>;
  duplicate?: boolean;
}) => {
  // 지나간 발표도 주 단위 노출이라 목록에 남는다 — 증시 일정 페이지와 같은 규칙으로 흐리게.
  const isPast = today != null && item.date < today;
  return (
    <TickShell
      item={item}
      openId={openId}
      onSelect={onSelect}
      duplicate={duplicate}
      className={[
        'flex items-center gap-2.5 whitespace-nowrap px-4 py-3.5 transition-colors',
        'border-r border-cb-border hover:bg-[var(--cb-hover)]',
        openId === item.id ? 'bg-[var(--cb-hover)]' : '',
        isPast ? 'opacity-45' : '',
      ].join(' ')}
    >
      <span className="text-[11.5px] text-cb-muted tabular-nums">
        {whenLabel(item.date)} · {item.time}
      </span>
      <ItemLogo item={item} logos={logos} />
      <span className="text-[14px] font-semibold text-cb-foreground">{titleOf(item)}</span>
      {item.kind === 'earnings' && <GuruBadge count={item.guruCount} />}
      <DdayBadge date={item.date} today={today} />
    </TickShell>
  );
};

/** 상세 — 한 줄 요약 + 미국/국내/내 종목 3칸 + 초보자 팁. 지표가 달라도 읽는 순서는 고정. */
const Detail = ({ item, onClose }: { item: BoardEconomicItem; onClose: () => void }) => {
  const { insight } = item;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11.5px] text-cb-muted tabular-nums">
            {whenLabel(item.date)} {item.time} · 한국시간
          </p>
          <h2 className="mt-1 text-lg md:text-xl font-extrabold tracking-tight text-cb-foreground">
            {insight.title}
          </h2>
          <p className="mt-1.5 max-w-[62ch] text-sm text-cb-foreground leading-relaxed">
            {insight.summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="상세 닫기"
          className="shrink-0 grid h-8 w-8 place-items-center rounded-lg border border-cb-border text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 지표 자체 설명 — 요약이 "이 날 무슨 일이 벌어지나"라면 여기는 "그 숫자가 뭔가". */}
      <div className="rounded-xl border border-cb-border bg-[var(--cb-input-bg)] px-4 py-3">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-cb-muted">
          이게 뭔가요
        </span>
        <p className="mt-1 max-w-[78ch] text-[13.5px] leading-relaxed text-cb-foreground">
          {insight.what}
        </p>
      </div>

      {/* 결과 방향별 파급 — 지표마다 라벨이 다르다(높다/낮다 · 올린다/내린다 · 많이/적게). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-cb-border bg-cb-border">
        <SwingBlock dir="up" label={insight.swing.upLabel} body={insight.swing.up} />
        <SwingBlock dir="down" label={insight.swing.downLabel} body={insight.swing.down} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-cb-border bg-cb-border">
        <Block label="미국 증시" body={insight.us} />
        <Block label="국내 증시" body={insight.kr} />
      </div>

      <p className="flex items-baseline gap-2.5 rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-cb-foreground">
        <b className="shrink-0 text-[10.5px] font-extrabold tracking-wide text-amber-500">
          초보자에게
        </b>
        <span>{insight.tip}</span>
      </p>
    </div>
  );
};

/**
 * 결과 방향 한 칸. 화살표는 결과가 어느 쪽으로 나왔는지만 가리키고 색은 입히지 않는다 —
 * 상승/하락 색을 쓰면 "높으면 좋은 것"으로 읽히는데, 물가는 높은 쪽이 증시엔 부담이라 반대다.
 */
const SwingBlock = ({
  dir,
  label,
  body,
}: {
  dir: 'up' | 'down';
  label: string;
  body: string;
}) => (
  <div className="flex flex-col gap-1.5 bg-cb-surface p-3.5">
    <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-cb-muted">
      {dir === 'up' ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
    <p className="text-[13.5px] leading-relaxed text-cb-foreground">{body}</p>
  </div>
);

const Block = ({ label, body }: { label: string; body: string }) => (
  <div className="flex flex-col gap-1.5 bg-cb-surface p-3.5">
    <span className="text-[10.5px] font-bold uppercase tracking-wide text-cb-muted">{label}</span>
    <p className="text-[13.5px] leading-relaxed text-cb-foreground">{body}</p>
  </div>
);

export default MarketBoard;
