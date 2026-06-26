import { backendGet } from './backendClient';
import type { Financials, IndexQuote, StatementPeriod } from '../../domain/market/types';

/** 주요 지수 시세 묶음 (NASDAQ/Dow/KOSPI/KOSDAQ/Nikkei). */
export const fetchIndices = (): Promise<IndexQuote[]> => backendGet<IndexQuote[]>('/market/indices');

/** 종목 재무제표 + 밸류에이션 (period: annual|quarterly). KR 은 005930.KS / 035720.KQ 형식. */
export const fetchFinancials = (ticker: string, period: StatementPeriod): Promise<Financials> =>
  backendGet<Financials>(
    `/market/financials?ticker=${encodeURIComponent(ticker)}&period=${period}`,
  );
