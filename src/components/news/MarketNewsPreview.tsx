
import { useEffect } from 'react';
import { Loader2, Rss, ArrowRight } from 'lucide-react';
import { useStockDetailStore } from '../../store/useStockDetailStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import NewsItem from '../portfolio/NewsItem';

const MarketNewsPreview = () => {
  const t = useLanguageStore((s) => s.t);
  const navigate = usePageStore((s) => s.navigate);
  const { fetchMarketNews, marketNews, marketNewsLoadState } = useStockDetailStore();

  useEffect(() => {
    fetchMarketNews();
  }, [fetchMarketNews]);

  const top3 = marketNews?.articles.slice(0, 3) ?? [];

  if (marketNewsLoadState === 'idle') return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-cb-foreground flex items-center gap-2">
          <Rss className="w-5 h-5 text-cb-accent" />
          {t.marketNews.title}
        </h3>
        <button
          onClick={() => navigate('news')}
          className="flex items-center gap-1 text-xs font-semibold text-cb-accent hover:text-cb-accent-hover transition-colors"
        >
          {t.marketNews.viewAll}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {marketNewsLoadState === 'loading' && (
        <div className="flex items-center gap-2 text-cb-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.marketNews.loading}</span>
        </div>
      )}

      {marketNewsLoadState === 'success' && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((article) => (
            <div key={article.id} className="glass-panel p-4">
              <NewsItem article={article} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MarketNewsPreview;
