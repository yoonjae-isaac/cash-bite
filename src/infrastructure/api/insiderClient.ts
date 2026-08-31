import { backendGet } from './backendClient';
import type { InsiderBuysResult, InsiderSymbolSummary } from '../../domain/insider/types';

/** 최근 장내 매수 상위 종목 (내부자가 자기 돈으로 산 것). */
export const fetchInsiderBuys = (days: number, revalidate?: number): Promise<InsiderBuysResult> =>
  backendGet<InsiderBuysResult>(`/insider/buys?days=${days}`, revalidate);

/** 종목별 최근 내부자 거래. 거래가 없어도 빈 배열로 200 이 온다. */
export const fetchInsiderBySymbol = (
  symbol: string,
  revalidate?: number,
): Promise<InsiderSymbolSummary> =>
  backendGet<InsiderSymbolSummary>(`/insider/symbol/${encodeURIComponent(symbol)}`, revalidate);
