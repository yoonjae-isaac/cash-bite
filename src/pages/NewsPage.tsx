import { useEffect } from 'react';
import { Newspaper, RefreshCcw, ExternalLink, Globe, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { useNewsStore } from '../application/news/useNewsStore';
import type { NewsItem } from '../domain/news/types';

// Relative time using browser's Intl API
function relativeTime(unixSeconds: number, locale: string): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffSec = Math.floor(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  const diffDay = Math.floor(diffHour / 24);
  return rtf.format(-diffDay, 'day');
}

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="glass-panel p-4 flex flex-col gap-2 animate-pulse">
    <div className="flex justify-between">
      <div className="h-3 w-20 bg-cb-muted/20 rounded" />
      <div className="h-3 w-14 bg-cb-muted/10 rounded" />
    </div>
    <div className="h-4 w-full bg-cb-muted/20 rounded" />
    <div className="h-4 w-4/5 bg-cb-muted/15 rounded" />
    <div className="h-3 w-2/5 bg-cb-muted/10 rounded mt-1" />
  </div>
);

interface NewsCardProps {
  item: NewsItem;
  translation?: string;
  locale: string;
}

const NewsCard = ({ item, translation, locale }: NewsCardProps) => (
  <a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    className="glass-panel p-4 flex gap-4 hover:border-cb-accent/30 hover:shadow-[0_4px_20px_-4px_rgba(255,191,0,0.12)] transition-all duration-200 group"
  >
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cb-accent bg-cb-accent/10 px-1.5 py-0.5 rounded">
          {item.source}
        </span>
        <span className="text-[10px] text-cb-muted/60 shrink-0">
          {relativeTime(item.datetime, locale)}
        </span>
      </div>

      {/* Original headline */}
      <p className="text-sm font-semibold text-cb-foreground leading-snug line-clamp-2 group-hover:text-cb-accent transition-colors">
        {item.headline}
      </p>

      {/* Translated headline */}
      {translation && (
        <p className="text-sm text-cb-muted leading-snug line-clamp-2">
          {translation}
        </p>
      )}

      {/* Read more */}
      <span className="flex items-center gap-1 text-[10px] text-cb-muted/50 group-hover:text-cb-accent transition-colors mt-auto">
        <ExternalLink className="w-2.5 h-2.5" />
        원문 보기
      </span>
    </div>
  </a>
);

const NewsPage = () => {
  const t = useLanguageStore((s) => s.t);
  const language = useLanguageStore((s) => s.language);

  const {
    news,
    translations,
    isLoading,
    isTranslating,
    translationStatus,
    translationMode,
    translationProgress,
    error,
    lastFetchedAt,
    fetchNews,
    initTranslation,
    translateAll,
  } = useNewsStore();

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // When news loads or language changes, (re-)init translation
  useEffect(() => {
    if (news.length > 0) {
      initTranslation(language);
    }
  }, [news.length, language, initTranslation]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  const lastUpdatedText = lastFetchedAt
    ? relativeTime(Math.floor(lastFetchedAt / 1000), language)
    : null;

  // Translation status badge
  const renderTranslationBadge = () => {
    if (language === 'en' || translationMode === 'not-needed') return null;

    if (isTranslating) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-cb-muted">
          <Loader2 className="w-3 h-3 animate-spin" />
          {translationMode === 'chrome-ai'
            ? t.news.autoTranslating
            : `${t.news.translating} (${translationProgress}/${news.length})`}
        </span>
      );
    }

    if (translationStatus === 'done') {
      return (
        <span className="flex items-center gap-1.5 text-xs text-cb-positive">
          <CheckCircle2 className="w-3 h-3" />
          {t.news.translated}
        </span>
      );
    }

    if (translationMode === 'mymemory' && translationStatus === 'idle') {
      return (
        <button
          onClick={() => translateAll(language)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cb-border text-xs font-semibold text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-all"
        >
          <Globe className="w-3.5 h-3.5" />
          {t.news.translate}
        </button>
      );
    }

    if (translationStatus === 'error') {
      return (
        <button
          onClick={() => translateAll(language)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cb-negative/30 text-xs font-semibold text-cb-negative hover:bg-cb-negative/10 transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          {t.news.retry}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-sky-400/15 text-sky-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-cb-foreground">{t.news.title}</h2>
        </div>
        <p className="text-cb-muted ml-11">{t.news.subtitle}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {lastUpdatedText && (
            <span className="text-xs text-cb-muted/60">{lastUpdatedText} 갱신</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cb-border text-xs font-semibold text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-all disabled:opacity-40"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {t.news.refresh}
          </button>
        </div>

        {/* Translation status / button */}
        {renderTranslationBadge()}
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-cb-negative/25 bg-cb-negative/8 text-cb-negative text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.news.error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* News list */}
      {!isLoading && news.length > 0 && (
        <div className="flex flex-col gap-3">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              translation={translations[item.id]}
              locale={language}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && news.length === 0 && (
        <div className="glass-panel p-12 flex flex-col items-center gap-3 text-center">
          <Newspaper className="w-10 h-10 text-cb-muted/30" />
          <p className="text-sm text-cb-muted">{t.news.noNews}</p>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
