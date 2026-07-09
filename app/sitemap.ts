import type { MetadataRoute } from 'next';
import { SITE_URL, localePath } from '@/config/site';
import { TOOLS } from '@/domain/tools/catalog';
import { ARTICLE_SLUGS } from '@/domain/learn/articles';

// /sitemap.xml — 네이티브 생성. 공개 route 목록 (persona 제외).
// ko 를 canonical URL 로 두고 en/ja 를 hreflang(alternates.languages)로 함께 명시.
function entry(
  path: string,
  changeFrequency: 'daily' | 'weekly' | 'monthly',
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${localePath('ko', path)}`,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ko: `${SITE_URL}${localePath('ko', path)}`,
        en: `${SITE_URL}${localePath('en', path)}`,
        ja: `${SITE_URL}${localePath('ja', path)}`,
        'x-default': `${SITE_URL}${localePath('ko', path)}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const content = ['/', '/news', '/gurus', '/stock', '/macro', '/calendar'];
  const toolRoutes = ['/tools', ...TOOLS.map((t) => `/tools/${t.slug}`)];
  const learnRoutes = ['/learn', ...ARTICLE_SLUGS.map((slug) => `/learn/${slug}`)];
  const staticPages = ['/about', '/privacy', '/terms'];
  return [
    ...content.map((path) => entry(path, 'daily', path === '/' ? 1 : 0.8)),
    ...toolRoutes.map((path) => entry(path, 'monthly', path === '/tools' ? 0.7 : 0.6)),
    ...learnRoutes.map((path) => entry(path, 'weekly', path === '/learn' ? 0.7 : 0.6)),
    ...staticPages.map((path) => entry(path, 'monthly', 0.3)),
  ];
}
