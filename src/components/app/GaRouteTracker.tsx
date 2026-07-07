'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '../../infrastructure/analytics/ga';

/**
 * SPA 라우트 전환 page_view 트래킹 — 기존 App.tsx 의 usePageStore 기반 트래킹 대체.
 * App Router 에서는 usePathname 변경을 감지해 dataLayer 로 push.
 */
export default function GaRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
