import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Script from 'next/script';
import { Space_Grotesk, Bricolage_Grotesque } from 'next/font/google';
import '../globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ExchangeRateBar from '@/presentation/components/exchange/ExchangeRateBar';
import MarketBoard from '@/components/layout/MarketBoard';
import ClientInit from '@/components/app/ClientInit';
import AppToaster from '@/components/app/AppToaster';
import ConsentBanner from '@/components/app/ConsentBanner';
import MobileRefreshButton from '@/components/app/MobileRefreshButton';
import { LanguageProvider } from '@/application/i18n/useLanguageStore';
import { SITE_URL, SITE_NAME, SITE_TAGLINE_LOC, SITE_DESCRIPTION_LOC, localePath, LOCALES, type Locale } from '@/config/site';
import { routing } from '@/i18n/routing';
import { resolveBoard } from '@/config/boardRules';
import { fetchCalendar } from '@/infrastructure/api/calendarClient';
import type { BoardConfig } from '@/domain/calendar/board';
import type { Language } from '@/domain/i18n/types';

// 브랜드/워드마크 폰트 — next/font 로 셀프호스팅(빌드 시 번들, zero-CLS). Pretendard(한글)만 CDN 유지.
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });

const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_KEY;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALE: Record<Locale, string> = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (hasLocale(routing.locales, raw) ? raw : 'ko') as Locale;
  const tagline = SITE_TAGLINE_LOC[locale];
  const description = SITE_DESCRIPTION_LOC[locale];
  const homeTitle = `${SITE_NAME} — ${tagline}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitle,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    // 구글 검색결과 파비콘 규격: 루트 /favicon.ico 존재 + 정사각 48 배수 PNG.
    // logo.png(512)는 48 배수가 아니라 구글이 무시한다 — 192 로 파생해 함께 선언.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      shortcut: '/favicon.ico',
      apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    },
    alternates: {
      canonical: localePath(locale, '/'),
      languages: {
        ko: localePath('ko', '/'),
        en: localePath('en', '/'),
        ja: localePath('ja', '/'),
        'x-default': localePath('ko', '/'),
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: homeTitle,
      description,
      url: localePath(locale, '/'),
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: homeTitle,
      description,
    },
    robots: { index: true, follow: true },
    ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  };
}

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme-storage');var m='dark';if(t){var p=JSON.parse(t);if(p&&p.state&&p.state.theme==='light')m='light';}document.documentElement.dataset.theme=m;}catch(e){document.documentElement.dataset.theme='dark';}try{var u=localStorage.getItem('updown-storage');var n='default';if(u){var q=JSON.parse(u);if(q&&q.state&&q.state.mode==='swap')n='swap';}document.documentElement.dataset.updown=n;}catch(e){document.documentElement.dataset.updown='default';}})();`;

/**
 * 홈 최상단 전광판 데이터 — 금주 미국 증시 일정 + 노출 규칙(config/boardRules) 판정.
 *
 * 셸에서 만드는 이유: 스트립이 헤더·환율바에 붙은 풀블리드라 main(.shell-container) 안에 둘 수 없다.
 * 홈에서만 보이게 하는 판정은 MarketBoard 가 경로로 처리한다(레이아웃은 pathname 을 모른다).
 * 해설 카피가 한국어 전용이라 ko 로케일에서만 만든다. 백엔드 장애 시엔 조용히 생략.
 * ISR 30분 — 백엔드 갱신(매일 12:00 KST)과 주간 롤오버(일 09시)를 증시 일정 페이지와 같은 주기로 따라간다.
 */
async function loadHomeBoard(locale: string): Promise<BoardConfig | null> {
  if (locale !== 'ko') {
    return null;
  }
  try {
    return resolveBoard(await fetchCalendar('US', undefined, undefined, 1800));
  } catch {
    return null;
  }
}

const consentInitScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale); // 정적 렌더 활성화(플러그인 request 설정과 연동)
  const board = await loadHomeBoard(locale);

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        {/* Pretendard(한글)만 CDN dynamic-subset 유지. Space Grotesk·Bricolage 는 next/font 셀프호스팅. */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: consentInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale}>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {GTM_ID && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        {ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}

        <ClientInit />
        <AppToaster />
        <ConsentBanner />

        <LanguageProvider language={locale as Language}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <ExchangeRateBar />
            {board && <MarketBoard config={board} />}
            <main className="shell-container flex-grow py-8 md:py-10">
              {children}
            </main>
            <Footer />
          </div>
          <MobileRefreshButton />
        </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
