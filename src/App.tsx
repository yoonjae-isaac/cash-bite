import { useEffect } from 'react';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { usePortfolioStore } from './store/usePortfolioStore';
import { useThemeStore } from './application/theme/useThemeStore';
import { usePageStore } from './store/usePageStore';

import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import CompoundPage from './pages/CompoundPage';
import FirePage from './pages/FirePage';

function App() {
  const fetchExchangeRate = usePortfolioStore((state) => state.fetchExchangeRate);
  const colorMode = useThemeStore((s) => s.theme);
  const page = usePageStore((s) => s.page);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

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

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {page === 'home' && <HomePage />}
        {page === 'portfolio' && <PortfolioPage />}
        {page === 'compound' && <CompoundPage />}
        {page === 'fire' && <FirePage />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
