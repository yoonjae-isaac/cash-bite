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

export function trackPageView(path: string): void {
  push({
    event: 'page_view',
    page_path: path,
    page_title: path,
  });
}

export function trackEvent(name: string, params: EventParams = {}): void {
  push({ event: name, ...params });
}
