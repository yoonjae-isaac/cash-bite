import { useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { StockSymbol } from '../../domain/market/types';
import kospiData from '../../data/stockSymbols.kospi.json';
import nasdaqData from '../../data/stockSymbols.nasdaq.json';

const SYMBOLS = [...kospiData, ...nasdaqData] as StockSymbol[];
const MAX_SUGGESTIONS = 8;

/** 입력어 → 코드/한글명/영문명 매칭(정확>코드prefix>이름prefix>코드포함>이름포함). */
function matchSymbols(query: string): StockSymbol[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { sym: StockSymbol; score: number }[] = [];
  for (const sym of SYMBOLS) {
    const code = sym.code.toLowerCase();
    const ko = sym.nameKo.toLowerCase();
    const en = (sym.nameEn ?? '').toLowerCase();
    let score = -1;
    if (code === q || ko === q) score = 0;
    else if (code.startsWith(q)) score = 1;
    else if (ko.startsWith(q) || en.startsWith(q)) score = 2;
    else if (code.includes(q)) score = 3;
    else if (ko.includes(q) || en.includes(q)) score = 4;
    if (score >= 0) scored.push({ sym, score });
  }
  scored.sort((a, b) => a.score - b.score || a.sym.nameKo.localeCompare(b.sym.nameKo));
  return scored.slice(0, MAX_SUGGESTIONS).map((x) => x.sym);
}

interface TickerAutocompleteProps {
  onSearch: (ticker: string) => void;
  initialText?: string;
  placeholder: string;
  searchLabel: string;
}

/**
 * 종목 검색 입력 + 자동완성 드롭다운.
 * - KR(코드·한글명)은 로컬 JSON에서 즉시 매칭, 선택 시 코드로 조회.
 * - 목록에 없는 입력(예: 미국 티커 AAPL)은 Enter 로 그대로 조회(US=Yahoo).
 */
const TickerAutocomplete = ({
  onSearch,
  initialText = '',
  placeholder,
  searchLabel,
}: TickerAutocompleteProps) => {
  const [text, setText] = useState(initialText);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => matchSymbols(text), [text]);

  const selectSym = (sym: StockSymbol) => {
    setText(sym.nameKo);
    setOpen(false);
    setActiveIdx(-1);
    onSearch(sym.code);
  };

  const submitText = () => {
    const raw = text.trim();
    if (!raw) return;
    setOpen(false);
    setActiveIdx(-1);
    // 한글명/부분 입력은 최상위 매칭의 코드로 변환, 매칭 없으면(미국 티커 등) 원문 그대로.
    const matched = matchSymbols(raw);
    onSearch(matched.length > 0 ? matched[0].code : raw.toUpperCase());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIdx >= 0 && suggestions[activeIdx]) selectSym(suggestions[activeIdx]);
      else submitText();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div className="relative flex-1">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => text.trim() && setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-cb-surface border border-cb-border text-cb-foreground placeholder:text-cb-muted focus:outline-none focus:border-cb-accent/50 transition-colors"
        />
        <button
          type="button"
          onClick={submitText}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors shrink-0"
        >
          <Search className="w-4 h-4" />
          {searchLabel}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-30 mt-1.5 w-full max-h-72 overflow-y-auto glass-panel rounded-xl py-1 shadow-xl shadow-[var(--cb-shadow-soft)]"
          role="listbox"
        >
          {suggestions.map((sym, i) => (
            <li key={sym.code}>
              <button
                type="button"
                // onMouseDown: input blur 보다 먼저 실행돼 드롭다운이 닫히기 전에 선택 처리
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  selectSym(sym);
                }}
                onMouseEnter={() => setActiveIdx(i)}
                className={[
                  'w-full flex items-center justify-between gap-3 px-4 py-2 text-left transition-colors',
                  i === activeIdx ? 'bg-[var(--cb-hover)]' : '',
                ].join(' ')}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-cb-foreground truncate">{sym.nameKo}</span>
                  <span className="text-xs text-cb-muted tabular-nums shrink-0">{sym.code}</span>
                </span>
                <span className="text-[10px] font-semibold text-cb-muted bg-[var(--cb-input-bg)] px-1.5 py-0.5 rounded shrink-0">
                  {sym.market}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TickerAutocomplete;
