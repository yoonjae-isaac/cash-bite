import { backendGet } from './backendClient';
import type { GuruInvestor, GuruPortfolio, GuruStats } from '../../domain/guru/types';

export const fetchGuruInvestors = (): Promise<GuruInvestor[]> =>
  backendGet<GuruInvestor[]>('/disclosure/13f/investors');

export const fetchGuruPortfolio = (investorKey: string): Promise<GuruPortfolio> =>
  backendGet<GuruPortfolio>(`/disclosure/13f/holdings?investor=${encodeURIComponent(investorKey)}`);

export const fetchGuruStats = (): Promise<GuruStats> =>
  backendGet<GuruStats>('/disclosure/13f/stats');
