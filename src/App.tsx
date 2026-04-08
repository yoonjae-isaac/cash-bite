import { useEffect } from 'react';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Summary from './components/portfolio/Summary';
import InputForm from './components/portfolio/InputForm';
import PortfolioList from './components/portfolio/PortfolioList';
import ExchangeRateCard from './presentation/components/exchange/ExchangeRateCard';
import { usePortfolioStore } from './store/usePortfolioStore';
import { useThemeStore } from './application/theme/useThemeStore';

function App() {
  const fetchExchangeRate = usePortfolioStore((state) => state.fetchExchangeRate);
  const colorMode = useThemeStore((s) => s.theme);

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
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 max-w-7xl">
        
        {/* Summary Section */}
        <section className="w-full">
          <Summary />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form */}
          <aside className="lg:col-span-3">
            <div className="glass-panel p-6 sticky top-24">
              <InputForm />
            </div>
          </aside>
          
          {/* Middle Column: Portfolio List */}
          <section className="lg:col-span-6">
            <div className="glass-panel p-6 min-h-[400px]">
              <PortfolioList />
            </div>
          </section>

          {/* Right Column: Exchange Rate Dashboard */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-6">
              <ExchangeRateCard />
            </div>
          </aside>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}

export default App;
