
import { useEffect } from 'react';
import { Loader2, AlertCircle, Rss } from 'lucide-react';
import { useStockDetailStore } from '../../store/useStockDetailStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import NewsItem from '../portfolio/NewsItem';

interface Props {
  limit?: number;
}

const MarketNews = ({ limit }: Props) => {
  const t = useLanguageStore((s) => s.t);
  const { fetchMarketNews, marketNews, marketNewsLoadState } = useStockDetailStore();

  useEffect(() => {
    fetchMarketNews();
  }, [fetchMarketNews]);

  const articles = marketNews
    ? (limit ? marketNews.articles.slice(0, limit) : marketNews.articles)
    : [];

  return (
    <div className="glass-panel p-5">
      <h2 className="text-base font-semibold text-cb-foreground flex items-center gap-2 mb-4">
        <Rss className="w-4 h-4 text-cb-accent" />
        {t.marketNews.title}
      </h2>

      {marketNewsLoadState === 'loading' && (
        <div className="flex items-center gap-2 text-cb-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.marketNews.loading}</span>
        </div>
      )}

      {marketNewsLoadState === 'error' && (
        <div className="flex items-center gap-2 text-cb-negative text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t.marketNews.error}</span>
        </div>
      )}

      {marketNewsLoadState === 'success' && (
        <>
          {articles.length > 0 ? (
            <div>
              {articles.map((article) => (
                <NewsItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-cb-muted">{t.marketNews.noNews}</p>
          )}
        </>
      )}
    </div>
  );
};

export default MarketNews;
