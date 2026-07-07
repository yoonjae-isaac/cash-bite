import type { MetadataRoute } from 'next';
import { SITE_URL } from '../src/config/site';

// /robots.txt — 네이티브 생성. persona 는 임시 미노출이라 크롤 차단.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/persona'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
