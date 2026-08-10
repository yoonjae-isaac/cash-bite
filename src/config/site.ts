import type { Metadata } from 'next';

// canonical·OG·sitemap·robots 의 절대 URL 기준. Vercel 환경변수 NEXT_PUBLIC_SITE_URL 로 주입하고,
// 기본값은 프로덕션 도메인과 동일하게 둔다 — env 누락 시 죽은 도메인이 색인되는 사고를 막기 위함.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ants-up.com';
export const SITE_NAME = 'AntsUp';

export type Locale = 'ko' | 'en' | 'ja';
export const LOCALES: Locale[] = ['ko', 'en', 'ja'];
/** 로케일별 문구 묶음(ko/en/ja). */
export type Loc = Record<Locale, string>;

const OG_LOCALE: Record<Locale, string> = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' };

export const SITE_DESCRIPTION_LOC: Loc = {
  ko: '주린이를 위한 주식 정보 — 뉴스·거장 포트폴리오·종목 분석·거시지표를 한눈에.',
  en: 'Stock insights for beginners — market news, guru 13F portfolios, stock analysis, and macro indicators at a glance.',
  ja: '株初心者のための株式情報 — 市場ニュース・巨匠の13Fポートフォリオ・銘柄分析・マクロ指標をひと目で。',
};
export const SITE_DESCRIPTION = SITE_DESCRIPTION_LOC.ko;

export const SITE_TAGLINE_LOC: Loc = {
  ko: '주린이를 위한 주식 정보',
  en: 'Stock insights for beginner investors',
  ja: '株初心者のための株式情報',
};

/**
 * localePrefix 'as-needed' 규칙에 맞춰 로케일별 절대경로 생성.
 * ko 는 접두사 없음(루트 유지 — 기존 색인 URL 보존), en/ja 만 `/en`·`/ja` 접두사.
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  if (locale === 'ko') return clean || '/';
  return `/${locale}${clean}`;
}

/**
 * 로케일 인지 metadata 생성 — 현재 로케일 title/description + canonical + hreflang(alternates.languages).
 * path 는 로케일 접두사 없는 논리 경로('/news', '/' 등).
 */
export function localeMetadata(opts: {
  locale: Locale;
  path: string;
  title: Loc;
  description: Loc;
}): Metadata {
  const { locale, path, title, description } = opts;
  const canonical = localePath(locale, path);
  const languages: Record<string, string> = {
    ko: localePath('ko', path),
    en: localePath('en', path),
    ja: localePath('ja', path),
    'x-default': localePath('ko', path),
  };
  return {
    title: title[locale],
    description: description[locale],
    alternates: { canonical, languages },
    openGraph: {
      title: `${title[locale]} · ${SITE_NAME}`,
      description: description[locale],
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
  };
}

/** 정적 route 별 SEO 문구 테이블(ko/en/ja). 논리 경로 기준. */
export const PAGE_SEO: Record<string, { title: Loc; description: Loc }> = {
  '/news': {
    title: { ko: '시장 뉴스', en: 'Market News', ja: '市場ニュース' },
    description: {
      ko: '국내·미국 증시 뉴스와 AI 요약 다이제스트를 한눈에.',
      en: 'Korean and U.S. market news with AI-summarized digests, all in one place.',
      ja: '韓国・米国株式市場のニュースとAI要約ダイジェストをひと目で。',
    },
  },
  '/gurus': {
    title: { ko: '거장 포트폴리오', en: 'Guru Portfolios', ja: '巨匠のポートフォリオ' },
    description: {
      ko: '워런 버핏 등 투자 거장들의 13F 포트폴리오와 보유 종목 변화를 확인하세요.',
      en: 'Track the 13F portfolios and holdings changes of legendary investors like Warren Buffett.',
      ja: 'ウォーレン・バフェットら投資の巨匠の13Fポートフォリオと保有銘柄の変化をチェック。',
    },
  },
  '/stock': {
    title: { ko: '종목 분석', en: 'Stock Analysis', ja: '銘柄分析' },
    description: {
      ko: '국내·미국 주식의 재무·기술적 지표를 한눈에 분석합니다. PER·PBR·RSI·이동평균 등 기초 지표 설명 포함.',
      en: 'Analyze fundamental and technical indicators for Korean and U.S. stocks — PER, PBR, RSI, moving averages, and more, explained.',
      ja: '韓国・米国株の財務・テクニカル指標をひと目で分析。PER・PBR・RSI・移動平均など基礎指標の解説付き。',
    },
  },
  '/macro': {
    title: { ko: '거시지표', en: 'Macro Indicators', ja: 'マクロ指標' },
    description: {
      ko: '미국 금리·물가·고용 등 핵심 거시지표와 금리 방향 전망을 한눈에.',
      en: 'Key U.S. macro indicators — rates, inflation, employment — with a rate-direction outlook at a glance.',
      ja: '米国の金利・物価・雇用など主要マクロ指標と金利見通しをひと目で。',
    },
  },
  '/calendar': {
    title: { ko: '경제 캘린더', en: 'Economic Calendar', ja: '経済カレンダー' },
    description: {
      ko: '미국 실적 발표·경제지표·IPO 일정을 주간 캘린더로 확인하세요.',
      en: 'U.S. earnings, economic releases, and IPO schedules in a weekly calendar.',
      ja: '米国の決算発表・経済指標・IPOの予定を週間カレンダーで確認。',
    },
  },
  '/tools': {
    title: { ko: '투자 도구', en: 'Investment Calculators', ja: '投資計算ツール' },
    description: {
      ko: '주린이를 위한 투자 계산기 모음 — 물타기·복리·손절익절·양도세·배당 등 12종. API 없이 바로 계산.',
      en: 'A suite of investment calculators — averaging down, compound interest, stop-loss/take-profit, capital-gains tax, dividends, and more. 12 tools, no signup.',
      ja: '投資計算ツール集 — ナンピン・複利・損切り/利確・譲渡税・配当など12種。登録不要ですぐ計算。',
    },
  },
  '/learn': {
    title: { ko: '투자 배우기', en: 'Learn Investing', ja: '投資を学ぶ' },
    description: {
      ko: '주린이를 위한 투자 학습 — 물타기·복리·손절·배당·거장 13F를 쉽고 짧게. 읽고 바로 계산기로 연습하세요.',
      en: 'Learn investing the easy way — averaging down, compounding, stop-loss, dividends, and guru 13F filings, in short reads. Then practice with the calculators.',
      ja: '投資をやさしく学ぶ — ナンピン・複利・損切り・配当・巨匠の13Fを短く。読んだらすぐ計算ツールで練習。',
    },
  },
  '/onboarding': {
    title: { ko: '주린이 온보딩', en: 'Beginner Start', ja: '株の始め方' },
    description: {
      ko: '주식 완전 초보를 위한 실전 시작 가이드 — 왜 투자하나, 증권계좌·세금·ISA, 첫 매수까지 쉽게.',
      en: 'A hands-on starter guide for complete beginners — why invest, brokerage accounts, taxes, ISA, and your first buy.',
      ja: '株の完全初心者のための実践スタートガイド — なぜ投資するか、証券口座・税金・ISA、初めての買付まで。',
    },
  },
  '/about': {
    title: { ko: '소개', en: 'About', ja: '概要' },
    description: {
      ko: 'AntsUp 소개 — 주린이를 위한 주식 정보 서비스. 제공 기능과 데이터 출처 안내.',
      en: 'About AntsUp — a stock information service for beginner investors. Features and data sources.',
      ja: 'AntsUpについて — 株初心者のための株式情報サービス。機能とデータ出典のご案内。',
    },
  },
  '/privacy': {
    title: { ko: '개인정보처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー' },
    description: {
      ko: 'AntsUp 개인정보처리방침 — 수집 항목, 쿠키 및 광고, 제3자 제공, 이용자 권리.',
      en: 'AntsUp Privacy Policy — data collected, cookies and ads, third-party sharing, and your rights.',
      ja: 'AntsUpプライバシーポリシー — 収集項目、Cookieと広告、第三者提供、利用者の権利。',
    },
  },
  '/terms': {
    title: { ko: '이용약관', en: 'Terms of Service', ja: '利用規約' },
    description: {
      ko: 'AntsUp 이용약관 — 서비스 성격, 면책, 지식재산, 금지행위.',
      en: 'AntsUp Terms of Service — nature of the service, disclaimers, intellectual property, and prohibited conduct.',
      ja: 'AntsUp利用規約 — サービスの性質、免責、知的財産、禁止行為。',
    },
  },
  '/persona': {
    title: { ko: '내 포트폴리오 평가', en: 'Rate My Holdings', ja: 'ポートフォリオ診断' },
    description: {
      ko: '내 보유 종목을 입력하면 구성과 리스크를 평가해 드립니다.',
      en: 'Enter your holdings to get an assessment of composition and risk.',
      ja: '保有銘柄を入力すると構成とリスクを診断します。',
    },
  },
};

/** 정적 route metadata 생성기 — page 의 generateMetadata 에서 호출. */
export function staticPageMetadata(path: string, locale: Locale): Metadata {
  const seo = PAGE_SEO[path];
  if (!seo) {
    return localeMetadata({ locale, path, title: SITE_TAGLINE_LOC, description: SITE_DESCRIPTION_LOC });
  }
  return localeMetadata({ locale, path, title: seo.title, description: seo.description });
}

/**
 * @deprecated 로케일 인지 이전 헬퍼. 신규 코드는 localeMetadata/staticPageMetadata 사용.
 * (하위호환용 — 단일 언어 문자열 기반.)
 */
export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
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
