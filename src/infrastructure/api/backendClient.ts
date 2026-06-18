// cash-bite-backend 공용 클라이언트
// 성공: { data, meta } / 실패: { error: { statusCode, code, message, ... } } envelope 해제

const DEFAULT_BASE_URL = 'http://localhost:3000';

class BackendApiError extends Error {
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

function getBackendBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (fromEnv || DEFAULT_BASE_URL).replace(/\/$/, '');
}

export async function backendGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getBackendBaseUrl()}${path}`, {
      headers: { Accept: 'application/json' },
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
