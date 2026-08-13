import HomePage from '@/views/HomePage';
import JsonLd from '@/components/app/JsonLd';
import { setRequestLocale } from 'next-intl/server';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION_LOC, localePath, type Locale } from '@/config/site';
import { fetchCalendar } from '@/infrastructure/api/calendarClient';
import {
  fetchGuruHeldSymbols,
  fetchGuruOverview,
  fetchGuruStats,
} from '@/infrastructure/api/guruClient';
import { fetchMacroOverview } from '@/infrastructure/api/macroClient';
import type { HomeData } from '@/domain/home/types';

const OG_INLANG: Record<Locale, string> = { ko: 'ko', en: 'en', ja: 'ja' };

// 홈 데이터 사전 조회 — 항목마다 독립적으로 실패해도 나머지 섹션은 노출되도록 각각 catch.
// 전부 ISR 캐시 경유라(레이아웃의 캘린더 호출과 동일 URL·revalidate → fetch 중복 제거) 추가 비용은 사실상 없다.
const CALENDAR_REVALIDATE = 1800;
const GURU_REVALIDATE = 86400;
const MACRO_REVALIDATE = 1800;

const CONSENSUS_PREVIEW = 6; // 홈에 노출할 컨센서스 종목 수
const INVESTOR_PREVIEW = 5; // 홈에 노출할 거장 수
const EARNINGS_PREVIEW = 6; // 홈에 노출할 실적 건수
// 홈 타일로 보여줄 핵심 지표 — 물가·고용·금리·변동성·원자재를 하나씩 섞어 한눈에 보이게 고정.
// (카탈로그 순서대로 자르면 물가 지표만 4개가 나와 화면이 편중된다.)
const MACRO_PREVIEW_IDS = [
  'us-cpi',
  'us-unemployment',
  'us-fed-rate',
  'us-treasury-10y',
  'us-vix',
  'wti-oil',
];

async function loadHomeData(): Promise<HomeData> {
  const [overview, stats, calendar, held, macro] = await Promise.all([
    fetchGuruOverview(GURU_REVALIDATE).catch(() => null),
    fetchGuruStats(GURU_REVALIDATE).catch(() => null),
    fetchCalendar('US', undefined, undefined, CALENDAR_REVALIDATE).catch(() => null),
    fetchGuruHeldSymbols(GURU_REVALIDATE).catch(() => null),
    fetchMacroOverview(MACRO_REVALIDATE).catch(() => null),
  ]);

  const data: HomeData = {};

  if (overview) {
    data.guru = {
      asOf: overview.asOf,
      investorCount: overview.investors.length,
      topInvestors: overview.investors.slice(0, INVESTOR_PREVIEW),
    };
  }
  if (stats) {
    data.consensus = { asOf: stats.asOf, stocks: stats.mostHeld.slice(0, CONSENSUS_PREVIEW) };
  }
  if (held) {
    data.guruSymbols = held.symbols;
  }
  if (calendar) {
    const isGuruHeld = (symbol: string): boolean =>
      held ? held.symbols[symbol.toUpperCase()] !== undefined : false;
    const guruHeld = calendar.earnings.filter((e) => isGuruHeld(e.symbol));
    // 거장 보유 종목을 먼저 — 홈에서 가장 볼 만한 실적이 위로 오도록.
    const ordered = [...guruHeld, ...calendar.earnings.filter((e) => !isGuruHeld(e.symbol))];
    data.earnings = {
      from: calendar.from,
      to: calendar.to,
      items: ordered.slice(0, EARNINGS_PREVIEW),
      total: calendar.earnings.length,
      guruHeldTotal: guruHeld.length,
    };
  }
  if (macro) {
    const picked = MACRO_PREVIEW_IDS.map((id) => macro.find((r) => r.entry.id === id)).filter(
      (r) => r !== undefined,
    );
    // 카탈로그 id 가 바뀌어도 섹션이 비지 않도록, 못 찾으면 앞에서부터 채운다.
    data.macro = picked.length > 0 ? picked : macro.slice(0, MACRO_PREVIEW_IDS.length);
  }

  return data;
}

// 홈은 섹션별 스크롤 리빌을 자체 처리(HomePage 내부) → 페이지 단위 Reveal 미적용 (기존 App.tsx 동작 그대로).
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const home = await loadHomeData();
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}${localePath(locale, '/')}`,
        description: SITE_DESCRIPTION_LOC[locale],
        inLanguage: OG_INLANG[locale],
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={siteJsonLd} />
      <HomePage home={home} />
    </>
  );
}
