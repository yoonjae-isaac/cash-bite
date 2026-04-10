import Summary from '../components/portfolio/Summary';
import InputForm from '../components/portfolio/InputForm';
import PortfolioList from '../components/portfolio/PortfolioList';
import ExchangeRateCard from '../presentation/components/exchange/ExchangeRateCard';

const PortfolioPage = () => (
  <div className="flex flex-col gap-8">
    <section className="w-full">
      <Summary />
    </section>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <aside className="lg:col-span-3">
        <div className="glass-panel p-6 sticky top-24">
          <InputForm />
        </div>
      </aside>
      <section className="lg:col-span-6">
        <div className="glass-panel p-6 min-h-[400px]">
          <PortfolioList />
        </div>
      </section>
      <aside className="lg:col-span-3">
        <div className="sticky top-24 flex flex-col gap-6">
          <ExchangeRateCard />
        </div>
      </aside>
    </div>
  </div>
);

export default PortfolioPage;
