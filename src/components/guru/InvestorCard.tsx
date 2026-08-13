import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { bioOf, initialsOf, personOf } from '../../domain/guru/investors';
import { formatUsd13F } from '../../domain/guru/format';
import { splitInvestorName, toQuarterLabel, type GuruOverviewItem } from '../../domain/guru/types';

/** 거장 1명 = 카드 1장. 클릭하면 개별 포트폴리오 상세로 이동. */
const InvestorCard = ({ item }: { item: GuruOverviewItem }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const { firm, person: rawPerson } = splitInvestorName(item.name);
  const person = personOf(item.key, lang, rawPerson);
  const bio = bioOf(item.key, lang);

  // 상세 라우트는 백엔드 키 기준 — 키가 없는 적재분(직접 CIK)은 카드가 링크가 아니어야 한다.
  const href = item.key ? `/gurus/${item.key}` : undefined;

  const body = (
    <>
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cb-accent/15 text-sm font-bold text-cb-accent"
          aria-hidden
        >
          {initialsOf(rawPerson)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-cb-foreground">{person}</p>
          {firm !== person && <p className="truncate text-xs text-cb-muted">{firm}</p>}
        </div>
        {href && (
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-cb-muted transition-colors group-hover:text-cb-accent"
            aria-hidden
          />
        )}
      </div>

      {bio && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-cb-muted">{bio}</p>}

      <dl className="mt-3 flex items-baseline gap-3 border-t border-cb-border pt-3">
        <div className="min-w-0">
          <dt className="text-[11px] text-cb-muted">{t.gurus.cardAum}</dt>
          <dd className="truncate text-lg font-bold text-cb-accent">
            {formatUsd13F(item.totalValue)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-cb-muted">{t.gurus.positions}</dt>
          <dd className="truncate text-lg font-bold text-cb-foreground tabular-nums">
            {item.positionCount}
          </dd>
        </div>
      </dl>

      {item.topHolding && (
        <p className="mt-2 truncate text-xs text-cb-muted">
          {t.gurus.cardTop} ·{' '}
          <span className="font-semibold text-cb-foreground">
            {item.topHolding.ticker ?? item.topHolding.nameOfIssuer}
          </span>{' '}
          <span className="tabular-nums">{item.topHolding.weight}%</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {/* 대표 분기와 다른 분기면 어느 분기 데이터인지 명시 — 카드마다 시점이 다를 수 있다. */}
        {(item.quartersBehind ?? 0) > 0 && (
          <span
            className={`rounded px-1.5 py-px text-[10px] font-bold ${
              item.isStale
                ? 'bg-cb-negative/15 text-cb-negative'
                : 'bg-[var(--cb-hover)] text-cb-muted'
            }`}
          >
            {item.isStale ? `${t.gurus.staleBadge} · ` : ''}
            {toQuarterLabel(item.reportDate)}
          </span>
        )}
        {item.newCount > 0 && (
          <span className="rounded bg-cb-positive/15 px-1.5 py-px text-[10px] font-bold text-cb-positive">
            {t.gurus.cardNew} {item.newCount}
          </span>
        )}
        {item.exitCount > 0 && (
          <span className="rounded bg-cb-negative/15 px-1.5 py-px text-[10px] font-bold text-cb-negative">
            {t.gurus.cardExit} {item.exitCount}
          </span>
        )}
      </div>
    </>
  );

  if (!href) {
    return <div className="glass-panel rounded-xl p-4">{body}</div>;
  }

  return (
    <Link
      href={href}
      className="glass-panel group block rounded-xl p-4 transition-colors hover:border-cb-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cb-accent"
    >
      {body}
    </Link>
  );
};

export default InvestorCard;
