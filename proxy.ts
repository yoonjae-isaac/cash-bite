import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// Next 16 proxy 규칙(구 middleware). next-intl 로케일 라우팅.
const intlProxy = createMiddleware(routing);

/**
 * Vercel 기본 도메인으로 들어온 요청은 정본 도메인으로 301.
 *
 * 정확히 프로덕션 별칭 하나만 대상으로 한다 — 프리뷰 배포(*-git-*.vercel.app)는 Vercel 이
 * noindex 를 붙여 색인되지 않으므로 리다이렉트하면 프리뷰 확인만 불편해진다.
 * canonical 이 이미 정본 도메인을 가리키지만, vercel.app 이 200 으로 살아 있는 동안은
 * 중복 색인 여지가 남아 진입 자체를 막는다.
 */
const LEGACY_HOST = 'cash-bite.vercel.app';
const CANONICAL_HOST = 'ants-up.com';

export default function proxy(request: NextRequest) {
  if (request.headers.get('host') === LEGACY_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }
  return intlProxy(request);
}

export const config = {
  // 로케일 라우팅 대상만: api·_next·_vercel·정적 파일(점 포함)·메타데이터 라우트(robots/sitemap/opengraph) 제외.
  matcher: ['/((?!api|_next|_vercel|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)'],
};
