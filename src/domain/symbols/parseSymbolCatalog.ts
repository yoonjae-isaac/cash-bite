import type { SymbolTuple } from './types';

function isSymbolTuple(row: unknown): row is [string, string] {
  return (
    Array.isArray(row) &&
    row.length === 2 &&
    typeof row[0] === 'string' &&
    typeof row[1] === 'string' &&
    row[0].length > 0
  );
}

/**
 * `/symbols.json` 본문을 파싱해 `SymbolTuple[]`로 검증합니다.
 * 잘못된 행은 건너뜁니다.
 */
export function parseSymbolCatalogJson(data: unknown): SymbolTuple[] {
  if (!Array.isArray(data)) {
    throw new Error('Symbol catalog must be a JSON array');
  }
  const out: SymbolTuple[] = [];
  for (const row of data) {
    if (isSymbolTuple(row)) {
      out.push([row[0].trim(), row[1].trim()]);
    }
  }
  return out;
}
