// 브라우저 → 이 핸들러 → cash-bite-backend 프록시.
//
// 백엔드 주소(API_BASE_URL)와 내부 키(INTERNAL_API_KEY)는 서버에만 존재한다.
// 브라우저는 백엔드 도메인을 알 수 없고, 백엔드는 키 없는 직접 호출을 401로 거절한다.
// 서버 컴포넌트(ISR)는 이미 서버 구간이라 이 핸들러를 거치지 않고 백엔드를 직접 호출한다.

const DEFAULT_BACKEND = 'http://localhost:3000';

function backendBaseUrl(): string {
  return (process.env.API_BASE_URL || DEFAULT_BACKEND).replace(/\/$/, '');
}

// 백엔드 에러 envelope 과 같은 shape — backendClient 가 BackendApiError 로 그대로 변환한다.
function gatewayError(): Response {
  return Response.json(
    { error: { statusCode: 502, code: 'BAD_GATEWAY', message: 'Backend unreachable' } },
    { status: 502 },
  );
}

async function forward(
  request: Request,
  segments: string[],
  method: 'GET' | 'POST',
): Promise<Response> {
  const { search } = new URL(request.url);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.INTERNAL_API_KEY) {
    headers['x-internal-key'] = process.env.INTERNAL_API_KEY;
  }
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl()}/${segments.join('/')}${search}`, {
      method,
      headers,
      body: method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
    });
  } catch {
    return gatewayError();
  }

  // 백엔드가 명시한 캐시 정책만 그대로 전달한다. 대부분의 엔드포인트는 헤더를 두지 않아
  // 지금처럼 매번 백엔드를 타고, 로고처럼 잘 안 바뀌는 응답만 브라우저·CDN 이 받아낸다.
  const responseHeaders: Record<string, string> = {
    'content-type': response.headers.get('content-type') ?? 'application/json',
  };
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl) {
    responseHeaders['cache-control'] = cacheControl;
  }

  return new Response(response.body, { status: response.status, headers: responseHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  return forward(request, (await params).path, 'GET');
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  return forward(request, (await params).path, 'POST');
}
