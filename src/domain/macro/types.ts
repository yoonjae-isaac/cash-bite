// 거시지표(Macro) — cash-bite-backend `/macro/*` 응답 타입

type MacroProvider = 'fred' | 'ecos';
type MacroFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
type MacroImportance = 'low' | 'medium' | 'high' | 'very-high';

export interface MacroCatalogEntry {
  id: string;
  label: string;
  labelEn?: string;
  provider: MacroProvider;
  seriesId: string;
  unit: string;
  frequency: MacroFrequency;
  category: string;
  importance: MacroImportance;
  description?: string;
  isAvailable: boolean;
}

export interface MacroObservation {
  date: string; // YYYY-MM-DD
  value: number | null;
}

interface MacroSeriesMeta {
  latestValue: number | null;
  latestDate: string | null;
  yoyChange: number | null;
  momChange: number | null;
}

export interface MacroSeriesData {
  entry: MacroCatalogEntry;
  observations: MacroObservation[];
  meta: MacroSeriesMeta;
}

/** 최신값만 (값 + 변동). */
export interface MacroLatest {
  id: string;
  date: string | null;
  value: number | null;
  yoyChange: number | null;
  momChange: number | null;
}

/** 전체 지표 한눈에 — 카탈로그 메타 + 최신값. */
export interface MacroOverviewRow {
  entry: MacroCatalogEntry;
  latest: MacroLatest;
}
