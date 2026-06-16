import { backendGet } from './backendClient';
import type { MacroCatalogEntry, MacroSeriesData } from '../../domain/macro/types';

export const fetchMacroCatalog = (): Promise<MacroCatalogEntry[]> =>
  backendGet<MacroCatalogEntry[]>('/macro/series');

export const fetchMacroSeries = (id: string, from?: string): Promise<MacroSeriesData> => {
  const qs = from ? `?from=${encodeURIComponent(from)}` : '';
  return backendGet<MacroSeriesData>(`/macro/series/${encodeURIComponent(id)}/data${qs}`);
};
