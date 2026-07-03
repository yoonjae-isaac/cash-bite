import { backendGet } from './backendClient';
import type {
  Financials,
  IndexQuote,
  StatementPeriod,
  StockAnalysis,
  TechRange,
  TechnicalResult,
} from '../../domain/market/types';

/** 주요 지수 시세 묶음 (NASDAQ/Dow/KOSPI/KOSDAQ/Nikkei). */
export const fetchIndices = (): Promise<IndexQuote[]> => backendGet<IndexQuote[]>('/market/indices');

/** 종목 재무제표 + 밸류에이션 (period: annual|quarterly). KR 은 005930.KS / 035720.KQ 형식. */
export const fetchFinancials = (ticker: string, period: StatementPeriod): Promise<Financials> =>
  backendGet<Financials>(
    `/market/financials?ticker=${encodeURIComponent(ticker)}&period=${period}`,
  );

/** 기술적 분석 — 일봉 OHLC + 이동평균 + 교육 신호 (range: 3M|6M|1Y). */
export const fetchTechnical = (ticker: string, range: TechRange): Promise<TechnicalResult> =>
  backendGet<TechnicalResult>(
    `/market/technical?ticker=${encodeURIComponent(ticker)}&range=${range}`,
  );

/** AI 종합 분석 (기술 + 펀더멘탈, LLM). locale: ko|en|ja. */
export const fetchStockAnalysis = (ticker: string, locale: string): Promise<StockAnalysis> =>
  backendGet<StockAnalysis>(
    `/market/analysis?ticker=${encodeURIComponent(ticker)}&locale=${locale}`,
  );
