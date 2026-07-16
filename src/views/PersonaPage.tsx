'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Trash2, Info, ChevronDown, Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { usePortfolioEvalStore } from '../store/usePortfolioEvalStore';
import { fetchPersonas, evaluatePortfolio } from '../infrastructure/api/personaClient';
import { fetchFinancials, fetchFx } from '../infrastructure/api/marketClient';
import type { EvalHolding, EvalPosition, PersonaSummary } from '../domain/persona/types';
import { computeBalance } from '../domain/persona/balance';
import type { TranslationSchema } from '../domain/i18n/types';
import { TRADEABLE_SYMBOLS } from '../data/tradeableSymbols';
import TickerAutocomplete from '../components/stock/TickerAutocomplete';
import PortfolioSummaryPanel from '../components/persona/PortfolioSummaryPanel';
import StockReviewCard from '../components/persona/StockReviewCard';
import Skeleton from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';

type T = TranslationSchema;

const NAME_BY_CODE = new Map(TRADEABLE_SYMBOLS.map((s) => [s.code.toUpperCase(), s.nameKo]));

const fmtNum = (n: number): string => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmtPct = (n: number): string => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const groupValue = (list: EvalPosition[]): number =>
  list.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
const groupReturn = (list: EvalPosition[]): number => {
  const v = groupValue(list);
  const c = list.reduce((s, p) => s + p.quantity * p.avgPrice, 0);
  return c > 0 ? ((v - c) / c) * 100 : 0;
};

type Phase = 'input' | 'guru' | 'result';

const PersonaPage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  const positions = usePortfolioEvalStore((s) => s.positions);
  const selectedKey = usePortfolioEvalStore((s) => s.selectedKey);
  const evaluations = usePortfolioEvalStore((s) => s.evaluations);
  const addPosition = usePortfolioEvalStore((s) => s.addPosition);
  const updatePosition = usePortfolioEvalStore((s) => s.updatePosition);
  const removePosition = usePortfolioEvalStore((s) => s.removePosition);
  const setSelectedKey = usePortfolioEvalStore((s) => s.setSelectedKey);
  const addEvaluation = usePortfolioEvalStore((s) => s.addEvaluation);
  const clearEvaluations = usePortfolioEvalStore((s) => s.clearEvaluations);

  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personasError, setPersonasError] = useState(false);
  const [addFetching, setAddFetching] = useState(false);
  const [addError, setAddError] = useState(false);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(false);
  const [phase, setPhase] = useState<Phase>('input');
  const [usdKrw, setUsdKrw] = useState<number | null>(null);

  const loadPersonas = useCallback(() => {
    fetchPersonas()
      .then((list) => {
        setPersonas(list);
        setPersonasError(false);
        if (list.length > 0 && !list.some((p) => p.key === usePortfolioEvalStore.getState().selectedKey)) {
          setSelectedKey(list[0].key);
        }
      })
      .catch(() => setPersonasError(true));
  }, [setSelectedKey]);

  useEffect(() => {
    loadPersonas();
    fetchFx()
      .then((r) => setUsdKrw(r.usdKrw))
      .catch(() => setUsdKrw(null));
  }, [loadPersonas]);

  const selected = personas.find((p) => p.key === selectedKey);
  const krPositions = positions.filter((p) => p.currency === 'KRW');
  const usPositions = positions.filter((p) => p.currency !== 'KRW');
  const allValid =
    positions.length > 0 &&
    positions.every((p) => p.quantity > 0 && p.avgPrice > 0 && p.currentPrice > 0);

  // 티커 추가 — 선택 시 현재가·통화 자동 조회. 실패해도 행은 추가(직접 입력).
  const onAddTicker = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (!upper || addFetching) return;
    if (positions.some((p) => p.ticker.toUpperCase() === upper)) {
      setAutocompleteKey((k) => k + 1);
      return;
    }
    setAddError(false);
    setAddFetching(true);
    const name = NAME_BY_CODE.get(upper) ?? upper;
    fetchFinancials(code, 'annual')
      .then((f) => {
        const price = f.valuation.price ?? 0;
        addPosition({
          id: crypto.randomUUID(),
          ticker: upper,
          name,
          currency: f.currency || 'USD',
          quantity: 1,
          avgPrice: price,
          currentPrice: price,
        });
      })
      .catch(() => {
        addPosition({
          id: crypto.randomUUID(),
          ticker: upper,
          name,
          currency: upper.match(/^\d{6}$/) ? 'KRW' : 'USD',
          quantity: 1,
          avgPrice: 0,
          currentPrice: 0,
        });
        setAddError(true);
      })
      .finally(() => {
        setAddFetching(false);
        setAutocompleteKey((k) => k + 1);
      });
  };

  const runEvaluate = () => {
    if (!selected || !allValid || evaluating) return;
    setEvalError(false);
    setEvaluating(true);
    const holdings: EvalHolding[] = positions.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      currency: p.currency,
      quantity: p.quantity,
      avgPrice: p.avgPrice,
      currentPrice: p.currentPrice,
    }));
    evaluatePortfolio(selected.key, holdings, lang)
      .then((res) => {
        addEvaluation({
          id: crypto.randomUUID(),
          key: res.key,
          displayName: res.displayName,
          verdict: res.verdict,
          checkpoints: res.checkpoints,
          holdings: res.holdings,
          usedHoldings: res.usedHoldings,
          ...(res.reportDate ? { reportDate: res.reportDate } : {}),
          tickers: positions.map((p) => p.ticker),
          at: Date.now(),
        });
        setPhase('result');
      })
      .catch(() => setEvalError(true))
      .finally(() => setEvaluating(false));
  };

  if (personasError) {
    return (
      <div className="space-y-6">
        <PageHeader t={t} />
        <ErrorRetry message={t.persona.error} retryLabel={t.persona.retry} onRetry={loadPersonas} />
      </div>
    );
  }

  // 스텝 이동 가능 여부 — 입력:항상 / 거장:유효포지션 / 결과:평가기록 존재
  const reachable = (p: Phase): boolean =>
    p === 'input' || (p === 'guru' ? allValid : evaluations.length > 0);
  const goPhase = (p: Phase) => {
    if (reachable(p)) setPhase(p);
  };

  return (
    <div className="space-y-6">
      <PageHeader t={t} />

      {/* 면책 배너 */}
      <div className="flex items-start gap-2 rounded-xl border border-cb-border bg-cb-surface/60 px-3.5 py-2.5 text-xs text-cb-muted">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-cb-muted" />
        <p className="leading-relaxed">{t.persona.disclaimer}</p>
      </div>

      <StepIndicator phase={phase} reachable={reachable} onStep={goPhase} t={t} />

      {/* ─── PHASE 1: 종목 입력 (국장/미장) ─── */}
      {phase === 'input' && (
        <div className="space-y-5">
          <section>
            <p className="text-sm font-medium text-cb-muted mb-2 ml-1">{t.persona.addTitle}</p>
            <div className="flex items-center gap-2">
              <TickerAutocomplete
                key={autocompleteKey}
                onSearch={onAddTicker}
                placeholder={t.persona.searchPlaceholder}
                searchLabel={t.persona.searchLabel}
              />
              {addFetching && (
                <Sparkles className="w-4 h-4 text-cb-accent animate-pulse shrink-0" aria-hidden />
              )}
            </div>
            {addError && <p className="mt-1.5 text-xs text-cb-muted px-1">{t.persona.fetchError}</p>}
          </section>

          {/* 좌: 국장 / 우: 미장 — 빈 컬럼도 영역 유지(모바일은 세로 스택) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <MarketSection
              label={t.persona.groupKr}
              currency="KRW"
              list={krPositions}
              t={t}
              onUpdate={updatePosition}
              onRemove={removePosition}
            />
            <MarketSection
              label={t.persona.groupUs}
              currency="USD"
              list={usPositions}
              t={t}
              onUpdate={updatePosition}
              onRemove={removePosition}
            />
          </div>

          <div className="flex flex-col items-stretch gap-2 pt-1">
            <button
              onClick={() => goPhase('guru')}
              disabled={!allValid}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cb-accent text-cb-on-accent px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-40 hover:opacity-90"
            >
              {t.persona.next}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!allValid && (
              <p className="text-xs text-cb-muted text-center">{t.persona.needValues}</p>
            )}
          </div>
        </div>
      )}

      {/* ─── PHASE 2: 거장 선택 + 평가 ─── */}
      {phase === 'guru' && (
        <div className="space-y-5">
          {/* 평가할 포트폴리오 recap */}
          <section className="glass-panel rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-cb-foreground">{t.persona.recapTitle}</p>
            {[
              { label: t.persona.groupKr, currency: 'KRW', list: krPositions },
              { label: t.persona.groupUs, currency: 'USD', list: usPositions },
            ]
              .filter((g) => g.list.length > 0)
              .map((g) => (
                <div key={g.currency} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-cb-muted">
                    <b className="text-cb-foreground">{g.label}</b>{' '}
                    {g.list.map((p) => p.name).join(', ')}
                  </span>
                  <span className="text-cb-muted whitespace-nowrap tabular-nums">
                    {g.currency} {fmtNum(groupValue(g.list))}
                  </span>
                </div>
              ))}
          </section>

          <section aria-label={t.persona.pickerLabel}>
            <p className="text-sm font-medium text-cb-muted mb-2 ml-1">{t.persona.pickerLabel}</p>
            {personas.length === 0 ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : (
              <>
                <div className="relative sm:hidden">
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    aria-label={t.persona.pickerLabel}
                    className="w-full appearance-none bg-cb-surface border border-cb-border rounded-lg px-3 py-2.5 pr-9 text-sm font-semibold text-cb-foreground focus:outline-none focus:border-cb-accent/50"
                  >
                    {personas.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.displayName}, {p.firm}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-cb-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-2">
                  {personas.map((p) => {
                    const active = p.key === selectedKey;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setSelectedKey(p.key)}
                        aria-pressed={active}
                        className={[
                          'flex flex-col items-start text-left rounded-xl border px-3 py-2.5 transition-all',
                          active
                            ? 'border-cb-accent bg-cb-accent/10 shadow-[0_0_0_1px_var(--cb-accent)]'
                            : 'border-cb-border hover:border-cb-accent/40 hover:bg-[var(--cb-hover)]',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'text-sm font-bold leading-tight',
                            active ? 'text-cb-accent' : 'text-cb-foreground',
                          ].join(' ')}
                        >
                          {p.displayName}
                        </span>
                        <span className="text-[11px] text-cb-muted leading-tight mt-0.5">
                          {p.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {evalError && (
            <ErrorRetry message={t.persona.error} retryLabel={t.persona.retry} onRetry={runEvaluate} />
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => goPhase('input')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cb-border text-cb-foreground px-4 py-3 text-sm font-semibold hover:bg-[var(--cb-hover)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.persona.back}
            </button>
            <button
              onClick={runEvaluate}
              disabled={!allValid || evaluating || !selected}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cb-accent text-cb-on-accent px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-40 hover:opacity-90"
            >
              {evaluating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  {t.persona.evaluating}
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  {t.persona.evaluate}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── PHASE 3: 평가 결과 · 기록 ─── */}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goPhase('input')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cb-border text-cb-foreground px-3 py-2 text-xs font-semibold hover:bg-[var(--cb-hover)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.persona.editPortfolio}
            </button>
            <button
              onClick={() => goPhase('guru')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cb-border text-cb-foreground px-3 py-2 text-xs font-semibold hover:bg-[var(--cb-hover)] transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              {t.persona.reEvaluate}
            </button>
            {evaluations.length > 0 && (
              <button
                onClick={clearEvaluations}
                className="ml-auto text-xs text-cb-muted hover:text-cb-negative transition-colors"
              >
                {t.persona.clearHistory}
              </button>
            )}
          </div>

          {(() => {
            const latest = evaluations[0];
            if (!latest) {
              return null;
            }
            const balance = computeBalance(positions, usdKrw);
            const reviewByTicker = new Map(
              latest.holdings.map((h) => [h.ticker.toUpperCase(), h]),
            );
            return (
              <>
                <PortfolioSummaryPanel
                  balance={balance}
                  verdict={latest.verdict}
                  checkpoints={latest.checkpoints}
                  displayName={latest.displayName}
                  usedHoldings={latest.usedHoldings}
                  reportDate={latest.reportDate}
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-cb-muted">
                    {t.persona.reviewTitle}
                  </span>
                  <span className="h-px flex-1 bg-cb-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {positions.map((pos) => (
                    <StockReviewCard
                      key={pos.id}
                      position={pos}
                      weight={
                        balance.weights.find((w) => w.ticker === pos.ticker)?.weight ?? null
                      }
                      review={reviewByTicker.get(pos.ticker.toUpperCase())}
                    />
                  ))}
                </div>

                <p className="text-xs text-cb-muted leading-relaxed pt-1">{t.persona.notReply}</p>
              </>
            );
          })()}

          {/* 지난 평가 기록 (최신 제외) — 총평 스니펫 */}
          {evaluations.length > 1 && (
            <section className="pt-2 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-cb-muted">
                {t.persona.historyTitle}
              </p>
              {evaluations.slice(1).map((ev) => (
                <div key={ev.id} className="rounded-xl border border-cb-border bg-cb-surface/60 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-cb-foreground truncate">
                      {ev.displayName}{' '}
                      <span className="font-normal text-cb-muted">{ev.tickers.join(', ')}</span>
                    </span>
                    <span className="text-[10px] text-cb-muted shrink-0">
                      {new Date(ev.at).toLocaleString(lang)}
                    </span>
                  </div>
                  <p className="text-xs text-cb-muted leading-relaxed line-clamp-2">{ev.verdict}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

/** 3단계 진행 표시 — 완료/도달 가능한 단계는 클릭 이동. */
const StepIndicator = ({
  phase,
  reachable,
  onStep,
  t,
}: {
  phase: Phase;
  reachable: (p: Phase) => boolean;
  onStep: (p: Phase) => void;
  t: T;
}) => {
  const steps: { id: Phase; label: string }[] = [
    { id: 'input', label: t.persona.step1 },
    { id: 'guru', label: t.persona.step2 },
    { id: 'result', label: t.persona.step3 },
  ];
  const currentIdx = steps.findIndex((s) => s.id === phase);
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const canGo = reachable(step.id);
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStep(step.id)}
              disabled={!canGo}
              className={[
                'flex items-center gap-2 shrink-0 transition-colors',
                canGo ? 'cursor-pointer' : 'cursor-not-allowed',
              ].join(' ')}
            >
              <span
                className={[
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border',
                  active
                    ? 'bg-cb-accent text-cb-on-accent border-cb-accent'
                    : done
                      ? 'bg-cb-accent/15 text-cb-accent border-cb-accent/30'
                      : 'bg-transparent text-cb-muted border-cb-border',
                ].join(' ')}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span
                className={[
                  'text-xs font-semibold whitespace-nowrap',
                  active ? 'text-cb-foreground' : 'text-cb-muted',
                ].join(' ')}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={[
                  'h-px flex-1 mx-2',
                  i < currentIdx ? 'bg-cb-accent/40' : 'bg-cb-border',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/** 국장/미장 한 그룹 — 헤더(소계·수익률) + 종목 카드. 비어 있으면 렌더 안 함. */
const MarketSection = ({
  label,
  currency,
  list,
  t,
  onUpdate,
  onRemove,
}: {
  label: string;
  currency: string;
  list: EvalPosition[];
  t: T;
  onUpdate: (id: string, patch: Partial<EvalPosition>) => void;
  onRemove: (id: string) => void;
}) => {
  const gv = groupValue(list);
  const gr = groupReturn(list);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-1 min-h-[1.5rem]">
        <span className="text-sm font-bold text-cb-foreground">
          {label}
          <span className="ml-2 text-xs font-medium text-cb-muted">
            {currency} {list.length}
            {t.persona.positionsUnit}
          </span>
        </span>
        {list.length > 0 && (
          <span className="text-xs text-cb-muted tabular-nums">
            {t.persona.subtotal} {currency} {fmtNum(gv)}{' '}
            <b className={gr >= 0 ? 'text-cb-positive' : 'text-cb-negative'}>{fmtPct(gr)}</b>
          </span>
        )}
      </div>
      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-cb-border p-6 text-center text-xs text-cb-muted">
          {t.persona.emptyGroup}
        </div>
      )}
      {list.map((p) => {
        const value = p.quantity * p.currentPrice;
        const returnPct = p.avgPrice > 0 ? ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100 : 0;
        const weight = gv > 0 ? (value / gv) * 100 : 0;
        return (
          <div key={p.id} className="glass-panel rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-sm font-bold text-cb-foreground">{p.name}</span>
                <span className="ml-2 text-xs text-cb-muted tabular-nums">{p.ticker}</span>
              </div>
              <button
                onClick={() => onRemove(p.id)}
                aria-label={t.persona.remove}
                className="p-1.5 rounded-lg text-cb-muted hover:text-cb-negative hover:bg-[var(--cb-hover)] transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              <NumField
                label={t.persona.colQty}
                value={p.quantity}
                onChange={(v) => onUpdate(p.id, { quantity: v })}
              />
              <NumField
                label={t.persona.colAvg}
                value={p.avgPrice}
                onChange={(v) => onUpdate(p.id, { avgPrice: v })}
              />
              <NumField
                label={t.persona.colCurrent}
                value={p.currentPrice}
                onChange={(v) => onUpdate(p.id, { currentPrice: v })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs">
              <span className="text-cb-muted">
                {t.persona.colReturn}{' '}
                <b className={`tabular-nums ${returnPct >= 0 ? 'text-cb-positive' : 'text-cb-negative'}`}>
                  {fmtPct(returnPct)}
                </b>
              </span>
              <span className="text-cb-muted">
                {t.persona.colWeight}{' '}
                <b className="text-cb-foreground tabular-nums">{weight.toFixed(0)}%</b>
              </span>
              <span className="text-cb-muted">
                {t.persona.totalValue}{' '}
                <b className="text-cb-foreground tabular-nums">
                  {p.currency} {fmtNum(value)}
                </b>
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
};

/** 라벨 붙은 숫자 입력. 0 은 빈칸으로 표시해 편집을 쉽게. */
const NumField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <label className="block">
    <span className="block text-[10px] text-cb-muted mb-0.5">{label}</span>
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={value > 0 ? value : ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-cb-surface border border-cb-border rounded-lg px-2.5 py-1.5 text-sm text-cb-foreground tabular-nums focus:outline-none focus:border-cb-accent/50"
    />
  </label>
);

const PageHeader = ({ t }: { t: T }) => (
  <header>
    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
      {t.persona.title}
    </h1>
    <p className="mt-1.5 text-cb-muted">{t.persona.subtitle}</p>
  </header>
);

export default PersonaPage;
