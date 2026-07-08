import { backendGet } from './backendClient';
import type {
  MacroCatalogEntry,
  MacroOverviewRow,
  MacroSeriesData,
  RateOutlook,
} from '../../domain/macro/types';

export const fetchMacroCatalog = (): Promise<MacroCatalogEntry[]> =>
  backendGet<MacroCatalogEntry[]>('/macro/series');

/** 전체 지표 한눈에 (값 + 변동률). */
export const fetchMacroOverview = (revalidate?: number): Promise<MacroOverviewRow[]> =>
  backendGet<MacroOverviewRow[]>('/macro/overview', revalidate);

/** 금리 인하/인상 방향 추정 (결정형, 미국 연준 기준). */
export const fetchRateOutlook = (revalidate?: number): Promise<RateOutlook> =>
  backendGet<RateOutlook>('/macro/rate-outlook', revalidate);

export const fetchMacroSeries = (id: string, from?: string): Promise<MacroSeriesData> => {
  const qs = from ? `?from=${encodeURIComponent(from)}` : '';
  return backendGet<MacroSeriesData>(`/macro/series/${encodeURIComponent(id)}/data${qs}`);
};
