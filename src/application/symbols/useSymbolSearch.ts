import Fuse from 'fuse.js';
import { useCallback, useMemo } from 'react';
import type { SymbolTuple } from '../../domain/symbols/types';

const MAX_RESULTS = 10;

export function useSymbolSearch(catalog: readonly SymbolTuple[]) {
  const fuse = useMemo(() => {
    if (catalog.length === 0) return null;
    return new Fuse([...catalog], {
      keys: [
        { name: 'ticker', getFn: (row: SymbolTuple) => row[0] },
        { name: 'name', getFn: (row: SymbolTuple) => row[1] },
      ],
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [catalog]);

  const search = useCallback(
    (query: string): SymbolTuple[] => {
      const q = query.trim();
      if (!fuse || q.length === 0) return [];
      return fuse.search(q, { limit: MAX_RESULTS }).map((r) => r.item);
    },
    [fuse]
  );

  return search;
}
