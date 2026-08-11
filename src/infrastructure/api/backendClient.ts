// cash-bite-backend 공용 클라이언트
// 성공: { data, meta } / 실패: { error: { statusCode, code, message, ... } } envelope 해제

const DEFAULT_BASE_URL = 'http://localhost:3000';

export class BackendApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'BackendApiError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, BackendApiError.prototype);
  }
}

interface SuccessEnvelope<T> {
  data: T;
}

interface ErrorEnvelope {
  error: { statusCode: number; code: string; message: string };
}

// 브라우저는 백엔드 도메인을 알 수 없어야 하므로 프론트 프록시(app/api/be)를 경유하고,
// 서버 구간(서버 컴포넌트·ISR·빌드)은 한 홉을 아끼려고 백엔드를 직접 호출한다.
// API_BASE_URL·INTERNAL_API_KEY 에 NEXT_PUBLIC_ 을 붙이면 번들에 박혀 무의미해진다.
const isServer = typeof window === 'undefined';

function getBackendBaseUrl(): string {
  if (!isServer) {
    return '/api/be';
  }
  return (process.env.API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  if (isServer && process.env.INTERNAL_API_KEY) {
    headers['x-internal-key'] = process.env.INTERNAL_API_KEY;
  }
  return headers;
}

// revalidate(초): 서버 컴포넌트에서 ISR 캐시로 호출할 때 지정. 미지정(클라 호출)은 기본 동작.
export async function backendGet<T>(path: string, revalidate?: number): Promise<T> {
  let res: Response;
  const init: RequestInit = { headers: buildHeaders() };
  if (revalidate != null) {
    (init as RequestInit & { next?: { revalidate: number } }).next = { revalidate };
  }
  try {
    res = await fetch(`${getBackendBaseUrl()}${path}`, init);
  } catch {
    throw new BackendApiError(0, 'NETWORK_ERROR', 'Backend unreachable');
  }

  const body = (await res.json().catch(() => null)) as
    | SuccessEnvelope<T>
    | ErrorEnvelope
    | null;

  if (body && 'error' in body) {
    throw new BackendApiError(body.error.statusCode, body.error.code, body.error.message);
  }
  if (!res.ok || !body || !('data' in body)) {
    throw new BackendApiError(res.status, 'UNEXPECTED_RESPONSE', `Backend HTTP ${res.status}`);
  }
  return body.data;
}

export async function backendPost<T>(path: string, payload: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getBackendBaseUrl()}${path}`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BackendApiError(0, 'NETWORK_ERROR', 'Backend unreachable');
  }

  const body = (await res.json().catch(() => null)) as
    | SuccessEnvelope<T>
    | ErrorEnvelope
    | null;

  if (body && 'error' in body) {
    throw new BackendApiError(body.error.statusCode, body.error.code, body.error.message);
  }
  if (!res.ok || !body || !('data' in body)) {
    throw new BackendApiError(res.status, 'UNEXPECTED_RESPONSE', `Backend HTTP ${res.status}`);
  }
  return body.data;
}
