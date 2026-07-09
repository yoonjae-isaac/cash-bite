'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '../../application/currency/useCurrencyStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { fmtNumber } from '../../domain/tools/calc';
import { L, pick } from '../../domain/tools/catalog';

// 계산기 통화 — 엔화 제거, ₩/$ 만 지원. USD 는 환율바(usePortfolioStore.rates)의 실시간 환율로 원화 환산.
export type CalcCurrency = 'KRW' | 'USD';
export const CALC_CURRENCY_SYMBOL: Record<CalcCurrency, string> = { KRW: '₩', USD: '$' };
const CALC_CURRENCIES: CalcCurrency[] = ['KRW', 'USD'];

export function useCalcCurrency() {
  const raw = useCurrencyStore((s) => s.currency);
  const setCurrencyRaw = useCurrencyStore((s) => s.setCurrency);
  const krwPerUsd = usePortfolioStore((s) => s.rates.KRW);

  // 계산기는 KRW/USD 만 — 과거 JPY 저장값은 USD 로 이관.
  const currency: CalcCurrency = raw === 'KRW' ? 'KRW' : 'USD';
  useEffect(() => {
    if (raw !== 'KRW' && raw !== 'USD') setCurrencyRaw('USD');
  }, [raw, setCurrencyRaw]);

  const symbol = CALC_CURRENCY_SYMBOL[currency];

  // USD 선택 시 현재 환율로 원화 환산 라벨(≈ ₩...) 반환. KRW(기준통화)면 null.
  const krwOf = (n: number): string | null =>
    currency === 'USD' && Number.isFinite(n) && n !== 0
      ? `≈ ₩${fmtNumber(n * krwPerUsd, 0)}`
      : null;

  const setCurrency = (c: CalcCurrency) => setCurrencyRaw(c);
  return { currency, setCurrency, symbol, krwPerUsd, krwOf };
}

/** 통화 선택 토글 + (USD 일 때) 적용 환율 표시. */
export function CurrencyToggle() {
  const lang = useLanguageStore((s) => s.language);
  const { currency, setCurrency, krwPerUsd } = useCalcCurrency();
  return (
    <div className="flex items-center justify-end gap-2 mb-4 flex-wrap">
      {currency === 'USD' && (
        <span className="text-[11px] text-cb-muted tabular-nums" title={pick(L('환율바 기준 실시간 환율', 'Live rate from the ticker bar', 'レートバー基準のリアルタイム為替'), lang)}>
          $1 = ₩{fmtNumber(krwPerUsd, 2)}
        </span>
      )}
      <span className="text-xs text-cb-muted">{pick(L('통화', 'Currency', '通貨'), lang)}</span>
      <div className="inline-flex rounded-lg border border-cb-border overflow-hidden">
        {CALC_CURRENCIES.map((c) => {
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
              {CALC_CURRENCY_SYMBOL[c]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
