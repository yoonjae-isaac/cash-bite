'use client';

import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { personOf } from '../../domain/guru/investors';
import { formatUsd13F } from '../../domain/guru/format';
import { fetchGuruSymbolHolders } from '../../infrastructure/api/guruClient';
import {
  splitInvestorName,
  toQuarterLabel,
  type GuruChangeType,
  type GuruSymbolHolders,
} from '../../domain/guru/types';
import Skeleton from '../ui/Skeleton';

/**
 * 종목 페이지의 13F 크로스 섹션 — "이 종목을 담은 거장".
 * 국내 종목이나 미매핑 티커는 보유자가 0이며, 그 경우 섹션 자체를 렌더하지 않는다.
 */
const StockGuruHolders = ({ ticker }: { ticker: string }) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const [data, setData] = useState<GuruSymbolHolders | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchGuruSymbolHolders(ticker)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => {
        if (alive) setData(null); // 부가 섹션 — 실패 시 조용히 감춘다
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ticker]);

  if (loading && !data) {
    return <Skeleton className="h-32 rounded-xl" />;
  }
  // 보유 거장도 없고 이번 분기 매도 이력도 없으면 노이즈라 섹션을 숨긴다.
  if (!data || (data.holderCount === 0 && data.exitedNames.length === 0)) {
    return null;
  }

  const badge = (type?: GuruChangeType): { label: string; cls: string } | null => {
    switch (type) {
      case 'new':
        return { label: t.gurus.changeNew, cls: 'text-cb-positive bg-cb-positive/15' };
      case 'increased':
        return { label: t.gurus.changeIncreased, cls: 'text-cb-positive bg-cb-positive/15' };
      case 'decreased':
        return { label: t.gurus.changeDecreased, cls: 'text-cb-negative bg-cb-negative/15' };
      default:
        return null;
    }
  };

  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Crown className="h-4 w-4 text-cb-accent" aria-hidden />
        <h3 className="text-base font-bold text-cb-foreground">{t.gurus.symbolTitle}</h3>
        <span className="rounded-full bg-cb-accent/15 px-2 py-0.5 text-xs font-bold text-cb-accent tabular-nums">
          {data.holderCount}/{data.totalInvestors}
        </span>
      </div>
      <p className="mb-4 text-xs text-cb-muted">
        {t.gurus.symbolDesc} · {t.gurus.asOfLabel} {toQuarterLabel(data.asOf)}
        {data.totalValue > 0 && <> · {formatUsd13F(data.totalValue)}</>}
      </p>

      {data.holderCount === 0 ? (
        <p className="text-sm text-cb-muted">{t.gurus.symbolEmpty}</p>
      ) : (
        <ul className="space-y-2">
          {data.holders.map((h) => {
            const { person: rawPerson } = splitInvestorName(h.investorName);
            const person = personOf(h.investorKey, lang, rawPerson);
            const b = badge(h.changeType);
            const row = (
              <>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-cb-foreground">
                  {person}
                </span>
                {b && (
                  <span className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold ${b.cls}`}>
                    {b.label}
                  </span>
                )}
                <span
                  className="shrink-0 text-sm font-bold text-cb-accent tabular-nums"
                  title={t.gurus.symbolWeight}
                >
                  {h.weight}%
                </span>
                <span className="hidden shrink-0 text-xs text-cb-muted tabular-nums sm:inline">
                  {formatUsd13F(h.value)}
                </span>
              </>
            );
            return (
              <li key={h.investorName}>
                {h.investorKey ? (
                  <Link
                    href={`/gurus/${h.investorKey}`}
                    className="theme-row flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors theme-hover"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1.5">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {data.exitedNames.length > 0 && (
        <p className="mt-3 border-t border-cb-border pt-3 text-xs text-cb-muted">
          <span className="font-semibold text-cb-negative">{t.gurus.symbolExited}</span> ·{' '}
          {data.exitedNames.join(', ')}
        </p>
      )}
    </section>
  );
};

export default StockGuruHolders;
