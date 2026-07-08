import type { Metadata } from 'next';

// 도메인 확정 후 Vercel 환경변수 NEXT_PUBLIC_SITE_URL 로 설정. 미설정 시 임시 플레이스홀더.
// canonical·OG·sitemap·robots 의 절대 URL 기준이 되므로 배포 전 반드시 실제 도메인으로 지정할 것.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://antsup.app';
export const SITE_NAME = 'AntsUp';
export const SITE_DESCRIPTION =
  '주린이를 위한 주식 정보 — 뉴스·거장 포트폴리오·종목 분석·거시지표를 한눈에.';

/** route 별 정적 metadata 생성 헬퍼 (canonical + OG 일괄). path 는 '/news' 처럼 절대경로. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} · ${SITE_NAME}`,
      description: opts.description,
      url: opts.path,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'ko_KR',
    },
  };
}
