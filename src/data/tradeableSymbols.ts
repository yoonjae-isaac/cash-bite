import type { StockSymbol } from '../domain/market/types';
import kospi from './stockSymbols.kospi.json';
import kosdaq from './stockSymbols.kosdaq.json';
import nasdaq from './stockSymbols.nasdaq.json';
import nyse from './stockSymbols.nyse.json';
import amex from './stockSymbols.amex.json';

/**
 * 거래 가능 종목 통합 카탈로그 — KR(KOSPI·KOSDAQ) + US(NASDAQ·NYSE·AMEX).
 * 지수(k-index/n-index)는 분석 대상이 아니라 제외. 백엔드 allowed-symbols.ts 와 동일 범위.
 * 검색 자동완성·종목명 매핑 공용 소스.
 */
export const TRADEABLE_SYMBOLS: StockSymbol[] = [
  ...(kospi as StockSymbol[]),
  ...(kosdaq as StockSymbol[]),
  ...(nasdaq as StockSymbol[]),
  ...(nyse as StockSymbol[]),
  ...(amex as StockSymbol[]),
];

/** 대문자 코드 → 종목 (종목명 매핑용). 코드는 시장 간 고유. */
export const SYMBOL_BY_CODE: Map<string, StockSymbol> = new Map(
  TRADEABLE_SYMBOLS.map((s) => [s.code.toUpperCase(), s]),
);
