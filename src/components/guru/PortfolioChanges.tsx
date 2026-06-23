import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sparkles, TrendingUp, TrendingDown, PackageX, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { GuruPortfolio } from '../../domain/guru/types';
import { formatIssuerName } from '../../domain/guru/format';

/** 접힘 시 그룹당 노출 칩 수 (초과분은 전체보기 토글). */
const CHIPS_COLLAPSED = 12;

interface ChipItem {
  key: string;
  ticker: string;
  delta?: string;
}

interface ChangeGroup {
  key: string;
  label: string;
  icon: ReactNode;
  iconColor: string;
  chipClass: string;
  items: ChipItem[];
}

const ChangeGroupBlock = ({ group }: { group: ChangeGroup }) => {
  const t = useLanguageStore((s) => s.t);
  const [expanded, setExpanded] = useState(false);

  const overflow = group.items.length > CHIPS_COLLAPSED;
  const shown = expanded ? group.items : group.items.slice(0, CHIPS_COLLAPSED);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={group.iconColor}>{group.icon}</span>
        <span className="text-sm font-semibold text-cb-foreground">{group.label}</span>
        <span className="text-xs text-cb-muted tabular-nums">{group.items.length}</span>
      </div>

      {group.items.length === 0 ? (
        <p className="text-xs text-cb-muted">{t.gurus.changesEmpty}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((it) => (
              <span
                key={it.key}
                className={['inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold', group.chipClass].join(' ')}
              >
                {it.ticker}
                {it.delta && <span className="font-medium opacity-80 tabular-nums">{it.delta}</span>}
              </span>
            ))}
          </div>
          {overflow && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cb-muted hover:text-cb-accent transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> {t.gurus.showLess}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> {t.gurus.showAll} ({group.items.length})
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

/**
 * 이번 분기 변동 — 티커 기준 신규매수/비중확대/비중축소/전량매도를 한눈에.
 * 데이터는 holdings[].change(직전 분기 비교) + portfolio.exits(전량 매도).
 * 그룹별 티커가 길면(>CHIPS_COLLAPSED) 전체보기 토글로 접는다.
 */
const PortfolioChanges = ({ portfolio }: { portfolio: GuruPortfolio }) => {
  const t = useLanguageStore((s) => s.t);

  const tickerOf = (h: { ticker?: string; nameOfIssuer: string }): string =>
    h.ticker ?? formatIssuerName(h.nameOfIssuer);

  const deltaPct = (pct: number | undefined, withSign: boolean): string | undefined =>
    pct === undefined ? undefined : `${withSign && pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;

  const byType = (type: 'new' | 'increased' | 'decreased') =>
    portfolio.holdings.filter((h) => h.change?.type === type);

  const groups: ChangeGroup[] = [
    {
      key: 'new',
      label: t.gurus.changeNew,
      icon: <Sparkles className="w-4 h-4" />,
      iconColor: 'text-cb-accent',
      chipClass: 'bg-cb-accent/15 text-cb-accent',
      items: byType('new').map((h) => ({ key: `${h.cusip}:${h.putCall ?? ''}`, ticker: tickerOf(h) })),
    },
    {
      key: 'increased',
      label: t.gurus.changeIncreased,
      icon: <TrendingUp className="w-4 h-4" />,
      iconColor: 'text-cb-positive',
      chipClass: 'bg-cb-positive/15 text-cb-positive',
      items: byType('increased').map((h) => ({
        key: `${h.cusip}:${h.putCall ?? ''}`,
        ticker: tickerOf(h),
        delta: deltaPct(h.change?.sharesDeltaPct, true),
      })),
    },
    {
      key: 'decreased',
      label: t.gurus.changeDecreased,
      icon: <TrendingDown className="w-4 h-4" />,
      iconColor: 'text-cb-negative',
      chipClass: 'bg-cb-negative/15 text-cb-negative',
      items: byType('decreased').map((h) => ({
        key: `${h.cusip}:${h.putCall ?? ''}`,
        ticker: tickerOf(h),
        delta: deltaPct(h.change?.sharesDeltaPct, false),
      })),
    },
    {
      key: 'exited',
      label: t.gurus.changesExited,
      icon: <PackageX className="w-4 h-4" />,
      iconColor: 'text-cb-negative',
      chipClass: 'bg-cb-negative/10 text-cb-negative line-through',
      items: (portfolio.exits ?? []).map((e) => ({
        key: `${e.cusip}:${e.putCall ?? ''}`,
        ticker: e.ticker ?? formatIssuerName(e.nameOfIssuer),
      })),
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5">
      <h3 className="text-base font-bold text-cb-foreground mb-4">{t.gurus.changesTitle}</h3>
      <div className="space-y-4">
        {groups.map((g) => (
          <ChangeGroupBlock key={g.key} group={g} />
        ))}
      </div>
    </div>
  );
};

export default PortfolioChanges;
