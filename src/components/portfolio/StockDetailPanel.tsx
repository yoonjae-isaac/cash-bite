
import { Loader2, AlertCircle, Newspaper } from 'lucide-react';
import { useStockDetailStore } from '../../store/useStockDetailStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import RecommendationBar from './RecommendationBar';
import PriceTargetCard from './PriceTargetCard';
import NewsItem from './NewsItem';

interface Props {
  ticker: string;
  currentPrice: number;
}

const StockDetailPanel = ({ ticker, currentPrice }: Props) => {
  const t = useLanguageStore((s) => s.t);
  const detail = useStockDetailStore((s) => s.details[ticker]);
  const loadState = useStockDetailStore((s) => s.loadStates[ticker] ?? 'idle');
  const error = useStockDetailStore((s) => s.errors[ticker]);

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="flex items-center gap-2 px-4 py-5 text-cb-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t.portfolio.detail.loading}</span>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-cb-negative text-sm bg-cb-negative/5 rounded-lg m-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error ?? t.portfolio.detail.error}</span>
      </div>
    );
  }

  const hasNews = detail?.news && detail.news.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4 border-t border-cb-border/50 bg-cb-card/30">
      {/* 애널리스트 컨센서스 */}
      <div className="bg-cb-background/40 rounded-xl p-4 border border-cb-border/30">
        <RecommendationBar recommendation={detail?.recommendation ?? null} />
      </div>

      {/* 목표 주가 */}
      <div className="bg-cb-background/40 rounded-xl p-4 border border-cb-border/30">
        <PriceTargetCard priceTarget={detail?.priceTarget ?? null} currentPrice={currentPrice} />
      </div>

      {/* 최근 뉴스 */}
      <div className="bg-cb-background/40 rounded-xl p-4 border border-cb-border/30">
        <p className="text-xs font-semibold text-cb-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Newspaper className="w-3.5 h-3.5" />
          {t.portfolio.detail.recentNews}
        </p>
        {hasNews ? (
          <div>
            {detail.news.map((article) => (
              <NewsItem key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-cb-muted">{t.portfolio.detail.noData}</p>
        )}
      </div>
    </div>
  );
};

export default StockDetailPanel;
