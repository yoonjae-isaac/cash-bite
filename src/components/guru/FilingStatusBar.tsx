'use client';

import { CalendarClock } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { toQuarterLabel, type GuruFilingStatus } from '../../domain/guru/types';

/**
 * 13F 공시 진행 현황.
 *
 * 13F 는 분기말+45일까지 제출하면 되므로 마감 전에는 거장마다 반영 분기가 다르다.
 * 화면 상단이 "기준 2026 Q1" 하나만 보여주면 전원이 그 분기인 것처럼 읽히기 때문에,
 * 몇 명이 반영됐고 몇 명이 남았는지를 같이 노출한다.
 */
const FilingStatusBar = ({ filing }: { filing: GuruFilingStatus }) => {
  const t = useLanguageStore((s) => s.t);

  const pct =
    filing.totalInvestors > 0 ? Math.round((filing.asOfCount / filing.totalInvestors) * 100) : 0;
  // 대표 분기보다 최신 분기가 따로 있으면 = 다음 분기 공시가 들어오기 시작한 상태.
  const incoming = filing.latestQuarter !== filing.asOf ? filing.latestCount : 0;

  return (
    <div className="glass-panel rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cb-accent">
          <CalendarClock className="h-3.5 w-3.5" />
          {toQuarterLabel(filing.asOf)}
        </span>
        <span className="text-sm font-semibold text-cb-foreground tabular-nums">
          {filing.asOfCount}/{filing.totalInvestors}
          <span className="ml-1 font-normal text-cb-muted">{t.gurus.filingReflected}</span>
        </span>
        {incoming > 0 && (
          <span className="text-xs text-cb-muted">
            · {toQuarterLabel(filing.latestQuarter)} {incoming}
            {t.gurus.peopleUnit} {t.gurus.filingIncoming}
          </span>
        )}
        {filing.staleCount > 0 && (
          <span className="text-xs text-cb-muted">
            · {t.gurus.filingStale} {filing.staleCount}
            {t.gurus.peopleUnit}
          </span>
        )}
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-cb-border/60">
        <div className="h-full rounded-full bg-cb-accent" style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-cb-muted">{t.gurus.filingNote}</p>
    </div>
  );
};

export default FilingStatusBar;
