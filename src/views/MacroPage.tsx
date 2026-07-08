'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { useMacroStore, type MacroRange } from '../application/macro/useMacroStore';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import type { MacroOverviewRow, MacroSeriesData, RateOutlook } from '../domain/macro/types';
import { changeColorClass, formatChange, formatMacroValue } from '../domain/macro/format';
import { fetchMacroOverview, fetchRateOutlook } from '../infrastructure/api/macroClient';
import RateOutlookCard from '../components/macro/RateOutlookCard';
import MacroOverviewGrid from '../components/macro/MacroOverviewGrid';
import MacroLineChart from '../components/macro/MacroLineChart';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';
import InfoHint from '../components/ui/InfoHint';

const RANGES: MacroRange[] = ['1y', '3y', '5y', 'all'];

const SummaryCards = ({ data }: { data: MacroSeriesData }) => {
  const t = useLanguageStore((s) => s.t);
  const { meta } = data;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1">{t.macro.latest}</p>
        <p className="text-xl md:text-2xl font-bold text-cb-foreground tabular-nums">
          {formatMacroValue(meta.latestValue)}
        </p>
        <p className="text-[11px] text-cb-muted mt-0.5">{meta.latestDate ?? ''}</p>
      </div>
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1 inline-flex items-center gap-1">
          {t.macro.yoy}
          <InfoHint label={t.macro.yoy} content={t.glossary.yoy} />
        </p>
        <p className={`text-xl md:text-2xl font-bold tabular-nums ${changeColorClass(meta.yoyChange)}`}>
          {formatChange(meta.yoyChange)}
        </p>
      </div>
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1 inline-flex items-center gap-1">
          {t.macro.mom}
          <InfoHint label={t.macro.mom} content={t.glossary.mom} />
        </p>
        <p className={`text-xl md:text-2xl font-bold tabular-nums ${changeColorClass(meta.momChange)}`}>
          {formatChange(meta.momChange)}
        </p>
      </div>
    </div>
  );
};

const MacroPage = ({
  initialOverview,
  initialOutlook,
}: {
  initialOverview?: MacroOverviewRow[];
  initialOutlook?: RateOutlook | null;
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const { selectedId, range, seriesCache, isLoadingSeries, error, init, selectSeries, setRange } =
    useMacroStore();

  // 서버가 내려준 overview·outlook 으로 초기화 → SSR 콘텐츠(첫 렌더부터 표시).
  const [overview, setOverview] = useState<MacroOverviewRow[]>(initialOverview ?? []);
  const [overviewError, setOverviewError] = useState(false);
  const [outlook, setOutlook] = useState<RateOutlook | null>(initialOutlook ?? null);
  const [outlookLoading, setOutlookLoading] = useState(!initialOutlook);
  const detailRef = useRef<HTMLDivElement>(null);

  const loadOverview = useCallback(() => {
    setOverviewError(false);
    fetchMacroOverview()
      .then(setOverview)
      .catch(() => setOverviewError(true));
  }, []);

  // 시리즈 상세(차트)는 항상 클라 스토어에서 로드.
  useEffect(() => {
    init();
  }, [init]);

  // overview·outlook 은 서버가 값을 줬으면 재요청 생략, 없으면(로컬·장애) 클라 폴백 fetch.
  useEffect(() => {
    if (initialOverview && initialOverview.length > 0) return;
    loadOverview();
  }, [initialOverview, loadOverview]);

  useEffect(() => {
    if (initialOutlook) return;
    fetchRateOutlook()
      .then(setOutlook)
      .catch(() => setOutlook(null))
      .finally(() => setOutlookLoading(false));
  }, [initialOutlook]);

  const onSelect = (id: string) => {
    void selectSeries(id);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const data = seriesCache[`${selectedId}:${range}`];
  const title = data ? (lang === 'ko' ? data.entry.label : (data.entry.labelEn ?? data.entry.label)) : '';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <LineChartIcon className="w-7 h-7 text-cb-accent" />
          {t.macro.title}
        </h1>
        <p className="mt-1.5 text-cb-muted">{t.macro.subtitle}</p>
      </header>

      {/* 금리 방향 인디케이터 */}
      <section>
        <h3 className="text-[15px] font-bold text-cb-foreground mb-2.5">{t.macro.rateTitle}</h3>
        <RateOutlookCard outlook={outlook} loading={outlookLoading} />
      </section>

      {/* 거시지표 한눈에 */}
      <section>
        <h3 className="text-[15px] font-bold text-cb-foreground mb-2.5">{t.macro.overviewTitle}</h3>
        {overviewError ? (
          <ErrorRetry message={t.macro.error} retryLabel={t.macro.retry} onRetry={loadOverview} />
        ) : overview.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] rounded-xl" />
            ))}
          </div>
        ) : (
          <MacroOverviewGrid rows={overview} selectedId={selectedId} onSelect={onSelect} />
        )}
      </section>

      {/* 지표 상세 */}
      <section ref={detailRef} className="scroll-mt-4">
        <h3 className="text-[15px] font-bold text-cb-foreground mb-2.5">{t.macro.detailTitle}</h3>
        {error && (
          <ErrorRetry message={t.macro.error} retryLabel={t.macro.retry} onRetry={() => init()} />
        )}
        {!error && !data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[88px] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[320px] w-full rounded-xl" />
          </div>
        )}
        {!error && data && (
          <div className={`space-y-4 ${isLoadingSeries ? 'opacity-60 transition-opacity' : ''}`}>
            <SummaryCards data={data} />
            <div className="glass-panel rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-cb-foreground">{title}</h3>
                  <p className="text-[11px] text-cb-muted">{data.entry.unit}</p>
                </div>
                <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--cb-input-bg)]">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={[
                        'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
                        range === r
                          ? 'bg-cb-accent text-cb-on-accent'
                          : 'text-cb-muted hover:text-cb-foreground',
                      ].join(' ')}
                    >
                      {t.macro[`range${r === 'all' ? 'All' : r}` as 'range1y']}
                    </button>
                  ))}
                </div>
              </div>
              {data.observations.filter((o) => o.value !== null).length < 2 ? (
                <div className="h-[280px] flex items-center justify-center text-cb-muted text-sm">
                  {t.macro.noData}
                </div>
              ) : (
                <MacroLineChart observations={data.observations} frequency={data.entry.frequency} />
              )}
            </div>
            <p className="text-xs text-cb-muted px-1">
              {t.macro.source}: {data.entry.provider === 'fred' ? 'FRED (St. Louis Fed)' : t.macro.sourceEcos}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MacroPage;
