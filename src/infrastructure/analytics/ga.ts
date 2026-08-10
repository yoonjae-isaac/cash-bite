type EventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function push(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

// page_view 는 보내지 않는다 — GTM Google 태그의 향상된 측정(히스토리 기반 페이지 변경)이 담당한다.
// 여기서 직접 push 하면 GA4 기본 페이지뷰와 겹쳐 모든 페이지뷰가 2배로 집계된다.
export function trackEvent(name: string, params: EventParams = {}): void {
  push({ event: name, ...params });
}
