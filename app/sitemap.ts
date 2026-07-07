import type { MetadataRoute } from 'next';
import { SITE_URL } from '../src/config/site';
import { TOOLS } from '../src/domain/tools/catalog';

// /sitemap.xml — 네이티브 생성. 공개 route 목록 (persona 제외).
export default function sitemap(): MetadataRoute.Sitemap {
  const content = ['', '/news', '/gurus', '/stock', '/macro', '/calendar'];
  const toolRoutes = ['/tools', ...TOOLS.map((t) => `/tools/${t.slug}`)];
  const staticPages = ['/about', '/privacy', '/terms'];
  return [
    ...content.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...toolRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'monthly' as const,
      priority: path === '/tools' ? 0.7 : 0.6,
    })),
    ...staticPages.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    })),
  ];
}
