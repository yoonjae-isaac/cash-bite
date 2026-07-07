import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import ExchangeRateBar from '../src/presentation/components/exchange/ExchangeRateBar';
import ClientInit from '../src/components/app/ClientInit';
import GaRouteTracker from '../src/components/app/GaRouteTracker';
import AppToaster from '../src/components/app/AppToaster';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '../src/config/site';
import ConsentBanner from '../src/components/app/ConsentBanner';

const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_KEY;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 주린이를 위한 주식 정보`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: '/logo.png' },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 주린이를 위한 주식 정보`,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'ko_KR',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: `${SITE_NAME} — 주린이를 위한 주식 정보`,
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
  // Search Console 소유확인 — env 설정 시에만 메타 태그 삽입.
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
};

// 첫 페인트 전 data-theme / data-updown 을 localStorage 에서 읽어 <html> 에 반영 → 테마 플래시(FOUC) 방지.
// useThemeStore/useUpDownStore 의 저장 키·구조({state:{theme|mode}})와 동일. 기본값: theme=dark, updown=default.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme-storage');var m='dark';if(t){var p=JSON.parse(t);if(p&&p.state&&p.state.theme==='light')m='light';}document.documentElement.dataset.theme=m;}catch(e){document.documentElement.dataset.theme='dark';}try{var u=localStorage.getItem('updown-storage');var n='default';if(u){var q=JSON.parse(u);if(q&&q.state&&q.state.mode==='swap')n='swap';}document.documentElement.dataset.updown=n;}catch(e){document.documentElement.dataset.updown='default';}})();`;

// Google consent mode v2 기본값 — 광고·분석 저장을 denied 로 시작(EEA 대비). GTM 로드 전에 실행되어야 함.
// 이용자가 동의 배너에서 선택하면 ConsentBanner 가 gtag('consent','update',...) 로 갱신.
const consentInitScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 폰트 — 파리티 위해 기존 index.html 의 CDN <link> 유지 (추후 next/font 최적화 검토) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&display=swap"
        />
        {/* 테마 플래시 방지 — 하이드레이션 전에 실행 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* consent mode v2 기본값(denied) — GTM 로드 전 */}
        <script dangerouslySetInnerHTML={{ __html: consentInitScript }} />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
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

        {/* Google AdSense — 승인/env 설정 시에만 로드(Auto ads). SPA 라우트 전환은 Auto ads 가 처리. */}
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
        <GaRouteTracker />
        <AppToaster />
        <ConsentBanner />

        <div className="flex flex-col min-h-screen">
          <Header />
          <ExchangeRateBar />
          {/* 콘텐츠 최대폭 제한 + 중앙정렬 — 헤더/환율바/푸터는 풀-너비 유지 */}
          <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
