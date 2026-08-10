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

/**
 * GTM dataLayer 로 넘기는 이벤트 파라미터 키 전체 목록.
 *
 * dataLayer 는 push 된 값을 계속 유지한다. 이번 이벤트가 쓰지 않는 키를 비우지 않으면
 * GTM 변수가 이전 값을 계속 읽어 다음 이벤트에 섞여 나간다(테마를 바꾼 뒤 환율을
 * 새로고침하면 exchange_rate_refresh 에 theme 가 따라붙는 식). 그래서 매번 전 키를
 * 훑어 미사용 키는 undefined 로 덮어쓴다 — GA4 태그는 값이 undefined 인 매개변수를 생략한다.
 *
 * 새 파라미터를 쓰는 이벤트를 추가하면 이 목록에도 키를 넣어야 한다.
 */
const TRACKED_PARAM_KEYS = ['currency', 'theme', 'language', 'mode', 'refresh_source', 'type'] as const;

// page_view 는 보내지 않는다 — GTM Google 태그의 향상된 측정(히스토리 기반 페이지 변경)이 담당한다.
// 여기서 직접 push 하면 GA4 기본 페이지뷰와 겹쳐 모든 페이지뷰가 2배로 집계된다.
export function trackEvent(name: string, params: EventParams = {}): void {
  const payload: EventParams = { event: name, ...params };
  for (const key of TRACKED_PARAM_KEYS) {
    if (!(key in payload)) {
      payload[key] = undefined;
    }
  }
  push(payload);
}
