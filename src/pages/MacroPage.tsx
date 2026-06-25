import { useEffect } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { useMacroStore, type MacroRange } from '../application/macro/useMacroStore';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import type { MacroSeriesData } from '../domain/macro/types';
import { changeColorClass, formatChange, formatMacroValue } from '../domain/macro/format';
import MacroPicker from '../components/macro/MacroPicker';
import MacroLineChart from '../components/macro/MacroLineChart';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';

const RANGES: MacroRange[] = ['1y', '3y', '5y', 'all'];

// 실제 레이아웃(요약 카드 3 + 차트 카드)과 동일한 형태의 스켈레톤 — 시프트·빈 박스 방지.
const MacroLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-panel rounded-xl p-4 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      ))}
    </div>
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-7 w-44 rounded-lg" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  </div>
);

const SummaryCards = ({ data }: { data: MacroSeriesData }) => {
  const t = useLanguageStore((s) => s.t);
  const { meta } = data;
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1">{t.macro.latest}</p>
        <p className="text-xl md:text-2xl font-bold text-cb-foreground tabular-nums">
          {formatMacroValue(meta.latestValue)}
        </p>
        <p className="text-[11px] text-cb-muted mt-0.5">{meta.latestDate ?? '–'}</p>
      </div>
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1">{t.macro.yoy}</p>
        <p className={`text-xl md:text-2xl font-bold tabular-nums ${changeColorClass(meta.yoyChange)}`}>
          {formatChange(meta.yoyChange)}
        </p>
      </div>
      <div className="glass-panel rounded-xl p-4">
        <p className="text-xs text-cb-muted mb-1">{t.macro.mom}</p>
        <p className={`text-xl md:text-2xl font-bold tabular-nums ${changeColorClass(meta.momChange)}`}>
          {formatChange(meta.momChange)}
        </p>
      </div>
    </div>
  );
};

const MacroPage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const { selectedId, range, seriesCache, isLoadingSeries, error, init, setRange } =
    useMacroStore();

  useEffect(() => {
    init();
  }, [init]);

  const data = seriesCache[`${selectedId}:${range}`];
  const title = data ? (lang === 'ko' ? data.entry.label : (data.entry.labelEn ?? data.entry.label)) : '';

  return (
    <div className="space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <LineChartIcon className="w-7 h-7 text-cb-accent" />
          {t.macro.title}
        </h2>
        <p className="mt-1.5 text-cb-muted">{t.macro.subtitle}</p>
      </header>

      <MacroPicker />

      {error && (
        <ErrorRetry message={t.macro.error} retryLabel={t.macro.retry} onRetry={() => init()} />
      )}

      {!error && !data && <MacroLoadingSkeleton />}

      {!error && data && (
        <div className={`space-y-4 ${isLoadingSeries ? 'opacity-60 transition-opacity' : ''}`}>
          <SummaryCards data={data} />

          <div className="glass-panel rounded-xl p-5">
            {/* 차트 헤더: 제목 + 단위 + 기간 토글 */}
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
            {t.macro.source}: {data.entry.provider === 'fred' ? 'FRED (St. Louis Fed)' : '한국은행 ECOS'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MacroPage;
