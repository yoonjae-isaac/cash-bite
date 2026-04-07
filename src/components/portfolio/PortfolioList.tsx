import { Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const PortfolioList = () => {
  const { stocks, rates, removeStock, setShares } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  const exchangeRate = rates.KRW;

  if (stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 opacity-70">
        <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-500 font-medium text-lg">{t.portfolio.noStocks}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          {t.portfolio.stockList}
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-4">{t.portfolio.ticker}</th>
              <th className="py-4 px-4 text-right">{t.portfolio.quantity}</th>
              <th className="py-4 px-4 text-right">{t.portfolio.currentPrice}</th>
              <th className="py-4 px-4 text-right">{t.portfolio.dividendPerShare}</th>
              <th className="py-4 px-4 text-right">Pre-tax</th>
              <th className="py-4 px-4 text-right">After-tax (USD)</th>
              <th className="py-4 px-4 text-right pr-6">{t.portfolio.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {stocks.map((stock) => {
              const preTax = stock.shares * stock.dividendPerShare;
              const afterTaxUSD = preTax * 0.85;

              return (
                <tr key={stock.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-white font-bold text-base">{stock.ticker}</div>
                      <div className="text-slate-500 text-[10px] uppercase font-medium truncate max-w-[120px]">
                        {stock.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={stock.shares}
                      onChange={(e) => setShares(stock.id, Number(e.target.value))}
                      className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-right w-20 py-1 transition-all focus:outline-none text-slate-200 font-mono"
                    />
                  </td>
                  <td className="py-4 px-4 text-right text-slate-300 font-mono text-sm">
                    ${stock.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-400 font-mono text-sm">
                    ${stock.dividendPerShare.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-300 font-mono text-sm italic">
                    ${preTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    <span className="text-indigo-400 font-bold">${afterTaxUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ≈ ₩{(afterTaxUSD * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right pr-6">
                    <button
                      onClick={() => removeStock(stock.id)}
                      className="p-2 mr-[-8px] text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title={t.portfolio.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioList;
