import { backendGet } from './backendClient';
import type { IndexQuote } from '../../domain/market/types';

/** 주요 지수 시세 묶음 (NASDAQ/Dow/KOSPI/KOSDAQ/Nikkei). */
export const fetchIndices = (): Promise<IndexQuote[]> => backendGet<IndexQuote[]>('/market/indices');
