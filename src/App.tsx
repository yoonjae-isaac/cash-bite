import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RightRail from './components/layout/RightRail';
import { usePortfolioStore } from './store/usePortfolioStore';
import { useThemeStore } from './application/theme/useThemeStore';
import { usePageStore } from './store/usePageStore';
import ExchangeRateBar from './presentation/components/exchange/ExchangeRateBar';
import { trackPageView } from './infrastructure/analytics/ga';

import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import CompoundPage from './pages/CompoundPage';
import AveragingPage from './pages/AveragingPage';
import NewsPage from './pages/NewsPage';

// 차트(recharts) 사용 페이지는 lazy 로드 → 초기 번들에서 분리
const GuruPage = lazy(() => import('./pages/GuruPage'));
const MacroPage = lazy(() => import('./pages/MacroPage'));

function App() {
  const fetchExchangeRate = usePortfolioStore((state) => state.fetchExchangeRate);
  const colorMode = useThemeStore((s) => s.theme);
  const page = usePageStore((s) => s.page);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    trackPageView(page);
  }, [page]);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster
        position="bottom-center"
        theme={colorMode === 'dark' ? 'dark' : 'light'}
        richColors={false}
        closeButton
        toastOptions={{
          classNames: {
            toast:
              '!bg-cb-surface !border !border-cb-border !text-cb-foreground !shadow-xl !shadow-[var(--cb-shadow-soft)]',
            title: '!text-cb-foreground',
            description: '!text-cb-muted',
            error: '!border-cb-negative/40',
            success: '!border-cb-positive/35',
          },
        }}
      />
      <Header />
      <ExchangeRateBar />

      {/* 풀-너비 레이아웃 (토스 스타일) — xl 에서 우측 고정 레일 공간 확보 */}
      <main className="flex-grow w-full px-4 md:px-6 py-8 md:py-10 xl:pr-80">
        {page === 'home' && <HomePage />}
        {page === 'portfolio' && <PortfolioPage />}
        {page === 'compound' && <CompoundPage />}
        {page === 'averaging' && <AveragingPage />}
        {page === 'news' && <NewsPage />}
        <Suspense fallback={<div className="h-96 rounded-xl glass-panel animate-pulse" aria-hidden />}>
          {page === 'gurus' && <GuruPage />}
          {page === 'macro' && <MacroPage />}
        </Suspense>
      </main>
      <RightRail />

      <Footer />
    </div>
  );
}

export default App;
