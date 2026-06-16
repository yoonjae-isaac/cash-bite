// 거장 포트폴리오 localStorage 캐시 — 13F 는 분기 단위 갱신이라 24h TTL 로 충분
// (백엔드 Redis 24h 와 정렬 — 새 filing 반영 최대 지연은 두 캐시 합산 ~48h)

import type { GuruInvestor, GuruPortfolio, GuruStats } from '../../domain/guru/types';

const CACHE_VERSION = 2; // 응답 스키마 변경 시 올려서 구버전 캐시 무효화 (v2: 투자자 리스트 77명 갱신)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const INVESTORS_KEY = 'cashbite-guru-investors';
const PORTFOLIO_KEY_PREFIX = 'cashbite-guru-portfolio:';
const STATS_KEY = 'cashbite-guru-stats';

interface CacheEntry<T> {
  version: number;
  savedAt: number;
  data: T;
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.version !== CACHE_VERSION || Date.now() - entry.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function save<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { version: CACHE_VERSION, savedAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage quota 초과 등 — 캐시는 best-effort
  }
}

export const loadCachedInvestors = (): GuruInvestor[] | null => load<GuruInvestor[]>(INVESTORS_KEY);

export const saveCachedInvestors = (investors: GuruInvestor[]): void =>
  save(INVESTORS_KEY, investors);

export const loadCachedPortfolio = (investorKey: string): GuruPortfolio | null =>
  load<GuruPortfolio>(`${PORTFOLIO_KEY_PREFIX}${investorKey}`);

export const saveCachedPortfolio = (investorKey: string, portfolio: GuruPortfolio): void =>
  save(`${PORTFOLIO_KEY_PREFIX}${investorKey}`, portfolio);

export const loadCachedStats = (): GuruStats | null => load<GuruStats>(STATS_KEY);

export const saveCachedStats = (stats: GuruStats): void => save(STATS_KEY, stats);
