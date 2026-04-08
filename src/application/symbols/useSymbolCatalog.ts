import { useCallback, useState } from 'react';
import type { SymbolTuple } from '../../domain/symbols/types';
import { fetchSymbolCatalog } from '../../infrastructure/symbols/symbolCatalogClient';

export type SymbolCatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useSymbolCatalog() {
  const [status, setStatus] = useState<SymbolCatalogStatus>('idle');
  const [catalog, setCatalog] = useState<SymbolTuple[]>([]);

  const ensureLoaded = useCallback(() => {
    if (status === 'loading' || status === 'ready') return;

    setStatus('loading');
    fetchSymbolCatalog()
      .then((rows) => {
        setCatalog(rows);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [status]);

  return {
    catalog,
    status,
    ensureLoaded,
    suggestEnabled: status === 'ready' && catalog.length > 0,
  };
}
