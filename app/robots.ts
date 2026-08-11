import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

// /robots.txt — 네이티브 생성.
// persona: 임시 미노출이라 크롤 차단.
// /api/: 백엔드 프록시(app/api/be/[...path])가 same-origin JSON 을 그대로 노출한다.
//        HTML 에서 링크되진 않지만 색인 대상이 될 이유가 없어 크롤 예산에서 뺀다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/persona', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
