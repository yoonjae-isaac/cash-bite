import { parseSymbolCatalogJson } from '../../domain/symbols/parseSymbolCatalog';
import type { SymbolTuple } from '../../domain/symbols/types';

const CATALOG_URL = '/symbols.json';

let memoryCache: SymbolTuple[] | null = null;
let inflight: Promise<SymbolTuple[]> | null = null;

/**
 * 심볼 카탈로그를 한 번만 fetch하고 메모리에 캐시합니다. 동시 호출은 동일 Promise를 공유합니다.
 */
export function fetchSymbolCatalog(): Promise<SymbolTuple[]> {
  if (memoryCache !== null) {
    return Promise.resolve(memoryCache);
  }
  if (inflight !== null) {
    return inflight;
  }

  inflight = fetch(CATALOG_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Symbol catalog fetch failed: ${res.status}`);
      }
      return res.json() as Promise<unknown>;
    })
    .then((json) => parseSymbolCatalogJson(json))
    .then((data) => {
      memoryCache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

/** 테스트 또는 핫 리로드 시 캐시 초기화용 */
export function clearSymbolCatalogCache(): void {
  memoryCache = null;
  inflight = null;
}
