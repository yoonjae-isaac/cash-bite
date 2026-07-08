'use client';

import { useState } from 'react';
import { getTool, pick, L, type Loc, type Viz } from '../../domain/tools/catalog';
import { fmtNumber } from '../../domain/tools/calc';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { useCurrencyStore } from '../../application/currency/useCurrencyStore';
import type { SupportedCurrency } from '../../domain/exchange/types';

const CURRENCY_SYMBOL: Record<SupportedCurrency, string> = { KRW: '₩', USD: '$', JPY: '¥' };
const CURRENCIES: SupportedCurrency[] = ['KRW', 'USD', 'JPY'];

function toneColor(tone: string): string {
  switch (tone) {
    case 'point':
      return 'var(--cb-point)';
    case 'positive':
      return 'var(--cb-positive)';
    case 'negative':
      return 'var(--cb-negative)';
    default:
      return 'var(--cb-muted)';
  }
}

/**
 * 제네릭 계산기 — slug 로 catalog(inputs + compute)를 조회해 렌더.
 * 입력 ↔ 결과 패널 분리 + 히어로 결과 + 미니 시각화(stack/ladder) + 보조 타일.
 * 금액 단위('currency')는 useCurrencyStore(₩/$/¥) 로 표시(값 환산 없음, 라벨만). 텍스트는 useLanguageStore 언어.
 */
export default function Calculator({ slug }: { slug: string }) {
  const tool = getTool(slug);
  const lang = useLanguageStore((s) => s.language);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const input of tool?.inputs ?? []) {
      init[input.key] = String(input.defaultValue);
    }
    return init;
  });

  if (!tool) {
    return null;
  }

  const unitText = (u: Loc | 'currency' | undefined): string => {
    if (!u) {
      return '';
    }
    return u === 'currency' ? CURRENCY_SYMBOL[currency] : pick(u, lang);
  };

  const numeric: Record<string, number> = {};
  for (const input of tool.inputs) {
    const parsed = parseFloat(values[input.key]);
    numeric[input.key] = Number.isFinite(parsed) ? parsed : 0;
  }
  const { results, viz } = tool.compute(numeric);
  const hero = results.find((r) => r.emphasize) ?? results[0];
  const tiles = results.filter((r) => r !== hero);
  const usesCurrency =
    tool.inputs.some((i) => i.unit === 'currency') || results.some((r) => r.unit === 'currency');

  const setVal = (key: string, val: string) => setValues((s) => ({ ...s, [key]: val }));

  return (
    <div className="glass-panel p-5 md:p-6">
      {usesCurrency && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-cb-muted">{pick(L('통화', 'Currency', '通貨'), lang)}</span>
          <div className="inline-flex rounded-lg border border-cb-border overflow-hidden">
            {CURRENCIES.map((c) => {
              const active = c === currency;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={active}
                  className={[
                    'px-2.5 py-1 text-xs font-bold transition-colors',
                    active
                      ? 'bg-cb-accent text-cb-on-accent'
                      : 'text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
                  ].join(' ')}
                >
                  {CURRENCY_SYMBOL[c]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 입력 */}
        <div className="flex flex-col gap-3.5">
          {tool.inputs.map((input) => (
            <label key={input.key} className="block">
              <span className="block text-xs font-medium text-cb-muted mb-1.5">
                {pick(input.label, lang)}
              </span>
              <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-cb-border bg-[var(--cb-input-bg)] transition-colors focus-within:border-cb-accent/50">
                <input
                  type="number"
                  inputMode="decimal"
                  step={input.step ?? 1}
                  value={values[input.key]}
                  onChange={(e) => setVal(input.key, e.target.value)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-cb-foreground font-mono tabular-nums text-base font-semibold text-right"
                />
                {input.unit && (
                  <span className="text-xs font-bold text-cb-muted whitespace-nowrap">
                    {unitText(input.unit)}
                  </span>
                )}
              </div>
              {input.slider && (
                <input
                  type="range"
                  min={input.slider.min}
                  max={input.slider.max}
                  step={input.step ?? 1}
                  value={values[input.key]}
                  onChange={(e) => setVal(input.key, e.target.value)}
                  className="w-full mt-2.5 accent-[var(--cb-point)] cursor-pointer"
                  aria-label={pick(input.label, lang)}
                />
              )}
            </label>
          ))}
        </div>

        {/* 결과 패널 */}
        <div className="rounded-2xl border border-cb-border bg-[var(--cb-input-bg)] p-4 md:p-5 flex flex-col gap-4">
          {hero && (
            <div>
              <div className="text-xs font-semibold text-cb-muted">{pick(hero.label, lang)}</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono tabular-nums text-3xl md:text-[2.4rem] font-extrabold tracking-tight text-cb-foreground leading-none">
                  {hero.value}
                </span>
                {hero.unit && (
                  <span className="text-base font-bold text-cb-muted">{unitText(hero.unit)}</span>
                )}
              </div>
            </div>
          )}

          {viz && (
            <>
              <div className="h-px bg-cb-border" />
              <VizView viz={viz} lang={lang} />
            </>
          )}

          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {tiles.map((r, i) => (
                <div key={i} className="rounded-xl border border-cb-border bg-cb-surface p-2.5">
                  <div className="text-[11px] text-cb-muted">{pick(r.label, lang)}</div>
                  <div className="font-mono tabular-nums text-[15px] font-bold text-cb-foreground mt-0.5">
                    {r.value}
                    {r.unit && (
                      <span className="text-[11px] font-normal text-cb-muted ml-1">
                        {unitText(r.unit)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VizView({ viz, lang }: { viz: Viz; lang: 'ko' | 'en' | 'ja' }) {
  if (viz.type === 'stack') {
    const total = viz.segments.reduce((sum, s) => sum + Math.max(0, s.amount), 0) || 1;
    return (
      <div>
        {viz.caption && (
          <div className="text-[11px] text-cb-muted mb-2">{pick(viz.caption, lang)}</div>
        )}
        <div className="flex h-3 rounded-full overflow-hidden bg-[var(--cb-hover)]">
          {viz.segments.map((s, i) => (
            <span
              key={i}
              className="h-full transition-[width] duration-300"
              style={{ width: `${(Math.max(0, s.amount) / total) * 100}%`, background: toneColor(s.tone) }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
          {viz.segments.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-cb-muted">
              <span className="w-2 h-2 rounded-sm" style={{ background: toneColor(s.tone) }} />
              {pick(s.label, lang)}{' '}
              <b className="font-mono tabular-nums text-cb-foreground font-semibold">
                {fmtNumber(s.amount, 0)}
              </b>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ladder (손절 ← 매수 → 익절)
  const sum = viz.stopPct + viz.takePct || 1;
  const riskW = (viz.stopPct / sum) * 100;
  return (
    <div>
      <div className="text-[11px] text-cb-muted mb-2">
        {pick(L('손절 ← 매수 → 익절', 'Stop ← Buy → Target', '損切り ← 取得 → 利確'), lang)}
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        <span
          className="h-full transition-[width] duration-300"
          style={{ width: `${riskW}%`, background: 'color-mix(in srgb, var(--cb-negative) 45%, transparent)' }}
        />
        <span
          className="h-full transition-[width] duration-300"
          style={{ width: `${100 - riskW}%`, background: 'color-mix(in srgb, var(--cb-positive) 50%, transparent)' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <div className="text-center">
          <div className="text-[10px] text-cb-muted">{pick(L('손절가', 'Stop', '損切り'), lang)}</div>
          <div className="font-mono tabular-nums text-[13px] font-bold text-cb-negative mt-0.5">{viz.stopPrice}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-cb-muted">{pick(L('매수가', 'Buy', '取得'), lang)}</div>
          <div className="font-mono tabular-nums text-[13px] font-bold text-cb-foreground mt-0.5">{viz.buyPrice}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-cb-muted">{pick(L('익절가', 'Target', '利確'), lang)}</div>
          <div className="font-mono tabular-nums text-[13px] font-bold text-cb-positive mt-0.5">{viz.takePrice}</div>
        </div>
      </div>
    </div>
  );
}
