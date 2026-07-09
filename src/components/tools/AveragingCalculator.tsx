'use client';

import { useState } from 'react';
import { Plus, X, TrendingDown, TrendingUp } from 'lucide-react';
import { averaging, fmtNumber } from '../../domain/tools/calc';
import { L, pick, type Loc } from '../../domain/tools/catalog';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { useCalcCurrency, CurrencyToggle } from './CurrencyControls';

// 라벨(Loc)
const T = {
  ticker: L('종목명(선택)', 'Ticker (optional)', '銘柄名(任意)'),
  holdingQty: L('보유 수량', 'Shares held', '保有数量'),
  avgPrice: L('평균 매수가', 'Avg buy price', '平均取得単価'),
  addQty: L('추가 매수 수량', 'Shares to add', '追加購入数量'),
  addPrice: L('추가 매수가', 'Add price', '追加購入価格'),
  newAvg: L('새 평단', 'New avg', '新平均'),
  totalQty: L('총 수량', 'Total shares', '総数量'),
  invested: L('총 투자금', 'Total invested', '総投資額'),
  addStock: L('종목 추가', 'Add stock', '銘柄を追加'),
  grandTotal: L('전체 총 투자금', 'All-stocks total invested', '全銘柄 総投資額'),
  down: L('물타기', 'Averaging down', 'ナンピン'),
  up: L('불타기', 'Averaging up', '買い増し'),
  shares: L('주', 'shares', '株'),
  remove: L('행 삭제', 'Remove row', '行を削除'),
};

interface Row {
  id: number;
  name: string;
  holdingQty: string;
  avgPrice: string;
  addQty: string;
  addPrice: string;
}

let idSeq = 0;
const makeRow = (over?: Partial<Row>): Row => ({
  id: idSeq++,
  name: '',
  holdingQty: '10',
  avgPrice: '100000',
  addQty: '10',
  addPrice: '80000',
  ...over,
});

const num = (s: string): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

function NumField({
  label,
  value,
  onChange,
  symbol,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  symbol?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-cb-muted mb-1">{label}</span>
      <div className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl border border-cb-border bg-cb-surface transition-colors focus-within:border-cb-accent/50">
        {symbol && <span className="text-xs font-bold text-cb-muted">{symbol}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none text-cb-foreground font-mono tabular-nums text-sm font-semibold text-right"
        />
        {suffix && <span className="text-[11px] font-bold text-cb-muted whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}

/**
 * 물타기·불타기 여러 종목 계산기 — 종목마다 (보유+평단 + 추가매수) 를 넣으면
 * 종목별 새 평단·총수량·총투자금 + 전체 합계를 계산. ₩/$ 통화 + USD 원화 환산 지원.
 */
export default function AveragingCalculator() {
  const lang = useLanguageStore((s) => s.language);
  const { symbol, krwOf } = useCalcCurrency();
  const [rows, setRows] = useState<Row[]>(() => [makeRow({ name: '' }), makeRow({ name: '', avgPrice: '120000', addPrice: '150000' })]);

  const setRow = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, makeRow()]);
  const removeRow = (id: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const calc = rows.map((row) => {
    const hq = num(row.holdingQty);
    const ap = num(row.avgPrice);
    const aq = num(row.addQty);
    const addp = num(row.addPrice);
    const r = averaging(hq, ap, aq, addp);
    const invested = hq * ap + aq * addp;
    const direction: 'down' | 'up' | null = aq <= 0 || addp === ap ? null : addp < ap ? 'down' : 'up';
    return { newAvg: r.newAvg, totalQty: r.totalQty, invested, direction };
  });
  const grandTotal = calc.reduce((s, c) => s + c.invested, 0);
  const grandKrw = krwOf(grandTotal);

  const pl = (loc: Loc) => pick(loc, lang);

  return (
    <div className="glass-panel p-5 md:p-6">
      <CurrencyToggle />

      <div className="flex flex-col gap-4">
        {rows.map((row, idx) => {
          const c = calc[idx];
          const avgKrw = krwOf(c.newAvg);
          const investedKrw = krwOf(c.invested);
          return (
            <div key={row.id} className="rounded-2xl border border-cb-border bg-[var(--cb-input-bg)] p-4">
              {/* 헤더: 종목명 + 삭제 */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => setRow(row.id, { name: e.target.value })}
                  placeholder={pl(T.ticker)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-cb-foreground placeholder:text-cb-muted/60 placeholder:font-normal border-b border-transparent focus:border-cb-accent/40 pb-1"
                />
                {c.direction && (
                  <span
                    className={[
                      'inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                      c.direction === 'down'
                        ? 'text-cb-accent bg-cb-accent/12'
                        : 'text-amber-500 bg-amber-500/12',
                    ].join(' ')}
                  >
                    {c.direction === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {c.direction === 'down' ? pl(T.down) : pl(T.up)}
                  </span>
                )}
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={pl(T.remove)}
                    className="shrink-0 p-1 rounded-md text-cb-muted hover:text-cb-negative hover:bg-[var(--cb-hover)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 입력 4칸 */}
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label={pl(T.holdingQty)} value={row.holdingQty} onChange={(v) => setRow(row.id, { holdingQty: v })} suffix={pl(T.shares)} />
                <NumField label={pl(T.avgPrice)} value={row.avgPrice} onChange={(v) => setRow(row.id, { avgPrice: v })} symbol={symbol} />
                <NumField label={pl(T.addQty)} value={row.addQty} onChange={(v) => setRow(row.id, { addQty: v })} suffix={pl(T.shares)} />
                <NumField label={pl(T.addPrice)} value={row.addPrice} onChange={(v) => setRow(row.id, { addPrice: v })} symbol={symbol} />
              </div>

              {/* 결과 스트립 */}
              <div className="mt-3.5 rounded-xl border border-cb-border bg-cb-surface p-3 flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] font-semibold text-cb-muted">{pl(T.newAvg)}</div>
                  <div className="font-mono tabular-nums text-2xl font-extrabold tracking-tight text-cb-foreground leading-none mt-0.5">
                    {symbol}
                    {fmtNumber(c.newAvg, 0)}
                  </div>
                  {avgKrw && <div className="text-[10px] text-cb-muted mt-0.5 tabular-nums">{avgKrw}</div>}
                </div>
                <div className="text-right text-[12px] text-cb-muted leading-snug">
                  <div>
                    {pl(T.totalQty)}{' '}
                    <b className="font-mono tabular-nums text-cb-foreground font-semibold">{fmtNumber(c.totalQty, 0)}</b>{' '}
                    {pl(T.shares)}
                  </div>
                  <div className="mt-0.5">
                    {pl(T.invested)}{' '}
                    <b className="font-mono tabular-nums text-cb-foreground font-semibold">
                      {symbol}
                      {fmtNumber(c.invested, 0)}
                    </b>
                  </div>
                  {investedKrw && <div className="text-[10px] mt-0.5 tabular-nums">{investedKrw}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 종목 추가 */}
      <button
        type="button"
        onClick={addRow}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-xl border border-dashed border-cb-border text-sm font-bold text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-colors"
      >
        <Plus className="w-4 h-4" /> {pl(T.addStock)}
      </button>

      {/* 전체 합계 */}
      {rows.length > 1 && (
        <div className="mt-4 pt-4 border-t border-cb-border flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-cb-muted">{pl(T.grandTotal)}</span>
          <span className="text-right">
            <span className="font-mono tabular-nums text-xl font-extrabold text-cb-foreground">
              {symbol}
              {fmtNumber(grandTotal, 0)}
            </span>
            {grandKrw && <span className="block text-[11px] text-cb-muted tabular-nums">{grandKrw}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
