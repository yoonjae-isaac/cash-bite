import type { MetadataRoute } from 'next';
import { SITE_URL, localePath } from '@/config/site';
import { TOOLS } from '@/domain/tools/catalog';
import { ARTICLE_SLUGS } from '@/domain/learn/articles';
import { GURU_KEYS } from '@/domain/guru/investors';

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

// 국내 전용 페이지 — ko 단일 URL만(en/ja hreflang 없이). 주린이 온보딩이 여기 해당.
function entryKoOnly(
  path: string,
  changeFrequency: 'daily' | 'weekly' | 'monthly',
  priority: number,
): MetadataRoute.Sitemap[number] {
  return { url: `${SITE_URL}${localePath('ko', path)}`, changeFrequency, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const content = ['/', '/news', '/gurus', '/consensus', '/stock', '/macro', '/calendar'];
  // 거장 개별 포트폴리오 — 인물명 검색 유입의 실질 진입점이라 색인 대상에 포함.
  const guruRoutes = GURU_KEYS.map((key) => `/gurus/${key}`);
  const toolRoutes = ['/tools', ...TOOLS.map((t) => `/tools/${t.slug}`)];
  const learnRoutes = ['/learn', ...ARTICLE_SLUGS.map((slug) => `/learn/${slug}`)];
  const staticPages = ['/about', '/privacy', '/terms'];
  return [
    ...content.map((path) => entry(path, 'daily', path === '/' ? 1 : 0.8)),
    ...guruRoutes.map((path) => entry(path, 'weekly', 0.7)),
    entryKoOnly('/onboarding', 'weekly', 0.8),
    ...toolRoutes.map((path) => entry(path, 'monthly', path === '/tools' ? 0.7 : 0.6)),
    ...learnRoutes.map((path) => entry(path, 'weekly', path === '/learn' ? 0.7 : 0.6)),
    ...staticPages.map((path) => entry(path, 'monthly', 0.3)),
  ];
}
