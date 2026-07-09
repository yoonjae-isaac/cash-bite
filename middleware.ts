import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 로케일 라우팅 대상만: api·_next·_vercel·정적 파일(점 포함)·메타데이터 라우트(robots/sitemap/opengraph) 제외.
  matcher: ['/((?!api|_next|_vercel|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)'],
};
