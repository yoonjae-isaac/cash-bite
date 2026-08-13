import { backendGet } from './backendClient';
import type {
  GuruAnalysis,
  GuruHeldSymbols,
  GuruOverview,
  GuruPortfolio,
  GuruStats,
  GuruSymbolHolders,
} from '../../domain/guru/types';

export const fetchGuruPortfolio = (
  investorKey: string,
  revalidate?: number,
): Promise<GuruPortfolio> =>
  backendGet<GuruPortfolio>(
    `/disclosure/13f/holdings?investor=${encodeURIComponent(investorKey)}`,
    revalidate,
  );

export const fetchGuruStats = (revalidate?: number): Promise<GuruStats> =>
  backendGet<GuruStats>('/disclosure/13f/stats', revalidate);

export const fetchGuruOverview = (revalidate?: number): Promise<GuruOverview> =>
  backendGet<GuruOverview>('/disclosure/13f/overview', revalidate);

export const fetchGuruSymbolHolders = (
  symbol: string,
  revalidate?: number,
): Promise<GuruSymbolHolders> =>
  backendGet<GuruSymbolHolders>(
    `/disclosure/13f/symbol/${encodeURIComponent(symbol)}`,
    revalidate,
  );

export const fetchGuruHeldSymbols = (revalidate?: number): Promise<GuruHeldSymbols> =>
  backendGet<GuruHeldSymbols>('/disclosure/13f/held-symbols', revalidate);

/** investorKey 미지정 시 시장 전체 요약. 미생성이면 null. */
export const fetchGuruAnalysis = (
  investorKey?: string,
  revalidate?: number,
): Promise<GuruAnalysis | null> =>
  backendGet<GuruAnalysis | null>(
    investorKey
      ? `/disclosure/13f/analysis?investor=${encodeURIComponent(investorKey)}`
      : '/disclosure/13f/analysis',
    revalidate,
  );
