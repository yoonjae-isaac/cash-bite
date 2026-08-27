import { backendGet } from './backendClient';
import type { ArkDailyTrades, ArkFundStatus } from '../../domain/ark/types';

/** 최근 거래일별 ARK 매매 (펀드 통합). 적재 전이면 404 → 호출부에서 섹션을 감춘다. */
export const fetchArkTrades = (days: number, revalidate?: number): Promise<ArkDailyTrades[]> =>
  backendGet<ArkDailyTrades[]>(`/ark/trades?days=${days}`, revalidate);

/** 펀드별 최신 반영 상태 — 갱신이 멈춘 펀드(isStale)를 화면이 밝히기 위해. */
export const fetchArkFunds = (revalidate?: number): Promise<ArkFundStatus[]> =>
  backendGet<ArkFundStatus[]>('/ark/funds', revalidate);
