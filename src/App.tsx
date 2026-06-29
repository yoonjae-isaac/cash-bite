import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { usePortfolioStore } from './store/usePortfolioStore';
import { useThemeStore } from './application/theme/useThemeStore';
import { usePageStore } from './store/usePageStore';
import ExchangeRateBar from './presentation/components/exchange/ExchangeRateBar';
import { trackPageView } from './infrastructure/analytics/ga';

import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';

// 차트(recharts)·대용량 종목목록 페이지는 lazy 로드 → 초기 번들에서 분리
const GuruPage = lazy(() => import('./pages/GuruPage'));
const MacroPage = lazy(() => import('./pages/MacroPage'));
const StockPage = lazy(() => import('./pages/StockPage'));

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

      {/* 콘텐츠 최대폭 제한 + 중앙정렬 — 모든 페이지 좌우 여백 (헤더/환율바/푸터는 풀-너비 유지) */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-10">
        {page === 'home' && <HomePage />}
        {page === 'news' && <NewsPage />}
        <Suspense fallback={<div className="h-96 rounded-xl glass-panel animate-pulse" aria-hidden />}>
          {page === 'gurus' && <GuruPage />}
          {page === 'macro' && <MacroPage />}
          {page === 'stock' && <StockPage />}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
