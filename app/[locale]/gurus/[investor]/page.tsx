import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/ui/Reveal';
import JsonLd from '@/components/app/JsonLd';
import GuruDetailPage from '@/views/GuruDetailPage';
import { localeMetadata, localePath, SITE_NAME, SITE_URL, type Loc, type Locale } from '@/config/site';
import { GURU_KEYS, GURU_PROFILES } from '@/domain/guru/investors';
import { splitInvestorName, toQuarterLabel } from '@/domain/guru/types';
import { fetchGuruAnalysis, fetchGuruPortfolio } from '@/infrastructure/api/guruClient';
import { fetchStockLogos } from '@/infrastructure/api/logoClient';
import type { GuruAnalysis, GuruPortfolio } from '@/domain/guru/types';

const REVALIDATE = 86400; // 13F 는 분기 공시 — 하루 1회면 충분
const LOGO_REVALIDATE = 604800; // 로고는 거의 안 바뀐다 — 주 단위 재검증
const LOGO_ROWS = 15; // 보유 테이블 접힌 상태에서 보이는 행 수만 선조회

export const revalidate = 86400;

// 프로필이 등록된 거장만 정적 생성. 그 외 키는 요청 시 렌더(백엔드에 있으면 표시).
export function generateStaticParams() {
  return GURU_KEYS.map((investor) => ({ investor }));
}

const GURUS_LABEL: Record<Locale, string> = {
  ko: '거장 포트폴리오',
  en: 'Guru Portfolios',
  ja: '巨匠のポートフォリオ',
};

/** 인물명 + 운용사로 로케일별 title/description 구성 (검색 유입은 인물명이 핵심). */
function buildSeo(investor: string, firm: string, fallbackPerson: string): { title: Loc; description: Loc } {
  const profile = GURU_PROFILES[investor];
  const person: Loc = {
    ko: profile?.person.ko ?? fallbackPerson,
    en: profile?.person.en ?? fallbackPerson,
    ja: profile?.person.ja ?? fallbackPerson,
  };
  return {
    title: {
      ko: `${person.ko} 포트폴리오`,
      en: `${person.en} Portfolio`,
      ja: `${person.ja}のポートフォリオ`,
    },
    description: {
      ko: `${person.ko}(${firm})의 최신 SEC 13F 보유 종목·비중과 이번 분기 신규 매수·비중 축소·전량 매도 내역을 확인하세요.`,
      en: `See ${person.en}'s latest SEC 13F holdings and weights, plus this quarter's new buys, trims, and exits at ${firm}.`,
      ja: `${person.ja}（${firm}）の最新SEC 13F保有銘柄・比率と、今四半期の新規買い・比率縮小・全売却をチェック。`,
    },
  };
}

async function loadPortfolio(investor: string): Promise<GuruPortfolio | null> {
  try {
    return await fetchGuruPortfolio(investor, REVALIDATE);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; investor: string }>;
}): Promise<Metadata> {
  const { locale, investor } = await params;
  const portfolio = await loadPortfolio(investor);
  if (!portfolio) {
    return {};
  }
  const { firm, person } = splitInvestorName(portfolio.investorName);
  const seo = buildSeo(investor, firm, person);
  return localeMetadata({
    locale: locale as Locale,
    path: `/gurus/${investor}`,
    title: seo.title,
    description: seo.description,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; investor: string }>;
}) {
  const { locale: raw, investor } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;

  const portfolio = await loadPortfolio(investor);
  if (!portfolio) {
    notFound();
  }

  let analysis: GuruAnalysis | null = null;
  try {
    analysis = await fetchGuruAnalysis(investor, REVALIDATE);
  } catch {
    analysis = null; // AI 리포트는 부가 정보 — 실패해도 포트폴리오는 보여준다
  }

  const logos = await fetchStockLogos(
    portfolio.holdings
      .slice(0, LOGO_ROWS)
      .map((h) => h.ticker)
      .filter((s): s is string => Boolean(s)),
    LOGO_REVALIDATE,
  ).catch(() => undefined);

  const { firm, person } = splitInvestorName(portfolio.investorName);
  const seo = buildSeo(investor, firm, person);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: GURUS_LABEL[locale],
        item: `${SITE_URL}${localePath(locale, '/gurus')}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: seo.title[locale],
        item: `${SITE_URL}${localePath(locale, `/gurus/${investor}`)}`,
      },
    ],
  };

  // 공시 데이터셋임을 명시 — 종목 목록이 아니라 "특정 시점 보유 현황"이라는 성격을 검색엔진에 전달.
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${seo.title[locale]} — ${toQuarterLabel(portfolio.reportDate)}`,
    description: seo.description[locale],
    creator: { '@type': 'Organization', name: SITE_NAME },
    temporalCoverage: portfolio.reportDate,
    isBasedOn: 'https://www.sec.gov/',
    variableMeasured: ['13F holdings', 'portfolio weight', 'quarterly change'],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={datasetJsonLd} />
      <Reveal>
        <GuruDetailPage portfolio={portfolio} analysis={analysis} logos={logos} />
      </Reveal>
    </>
  );
}
