'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Newspaper, RefreshCcw, ExternalLink, Globe, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { useNewsStore } from '../application/news/useNewsStore';
import { fetchNewsDigests } from '../infrastructure/api/backendNewsClient';
import type { NewsItem, NewsDigest } from '../domain/news/types';

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

// 실제 발행시각(월.일 시:분) — Naver 최신순이라 상대시각만으론 "전부 N분 전"으로 뭉쳐 보임.
function absoluteTime(unixSeconds: number, locale: string): string {
  return new Date(unixSeconds * 1000).toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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

// 카드 CTA / 갱신 라벨(다국어). locale 은 언어 코드(ko/en/ja)로 전달됨.
const READ_ORIGINAL: Record<string, string> = { ko: '원문 보기', en: 'View original', ja: '原文を見る' };
const UPDATED_SUFFIX: Record<string, string> = { ko: '갱신', en: 'updated', ja: '更新' };

const NewsCard = ({ item, translation, locale }: NewsCardProps) => (
  <a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    className="glass-panel p-4 flex gap-4 hover:border-cb-accent/30 hover:shadow-[0_4px_20px_-4px_rgba(127,127,135,0.18)] transition-all duration-200 group"
  >
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cb-accent bg-cb-accent/10 px-1.5 py-0.5 rounded">
          {item.source}
        </span>
        <span
          className="text-[10px] text-cb-muted/60 shrink-0 tabular-nums"
          title={item.datetime ? relativeTime(item.datetime, locale) : undefined}
        >
          {item.datetime ? absoluteTime(item.datetime, locale) : ''}
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
        {READ_ORIGINAL[locale] ?? READ_ORIGINAL.ko}
      </span>
    </div>
  </a>
);

interface AnalysisPanelProps {
  market: 'KR' | 'US';
  digests: NewsDigest[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  locale: string;
}

// 생성시각 → "MM.DD HH:MM"
function digestTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 우측 'AI 뉴스 분석' 패널 — 선택 시장의 다이제스트 리스트(매시 누적, 생성시각 노출). 데스크톱 sticky.
const AnalysisPanel = ({ market, digests, loading, error, onRetry, locale }: AnalysisPanelProps) => {
  const t = useLanguageStore((s) => s.t);

  return (
    <aside className="lg:sticky lg:top-[150px]">
      <div className="glass-panel p-5 flex flex-col gap-3 lg:max-h-[calc(100vh-170px)]">
        <div className="flex items-center justify-between gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cb-foreground">
            <Sparkles className="w-4 h-4 text-cb-accent" />
            {t.news.analysisTitle}
          </span>
          <span className="text-[11px] font-semibold text-cb-muted bg-[var(--cb-input-bg)] px-2 py-0.5 rounded-full">
            {market === 'KR' ? t.news.marketKr : t.news.marketUs}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2.5 animate-pulse pt-1">
            <div className="h-3 w-full bg-cb-muted/20 rounded" />
            <div className="h-3 w-full bg-cb-muted/20 rounded" />
            <div className="h-3 w-11/12 bg-cb-muted/15 rounded" />
            <div className="h-3 w-4/5 bg-cb-muted/15 rounded" />
            <div className="h-3 w-2/3 bg-cb-muted/10 rounded" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-cb-negative mb-3">{t.news.error}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cb-border text-xs font-semibold text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              {t.news.retry}
            </button>
          </div>
        ) : digests.length > 0 ? (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 -mr-1">
            {digests.map((d) => (
              <article key={d.generatedAt} className="border-b border-cb-border/40 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center text-[11px] text-cb-muted/70 tabular-nums mb-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-cb-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-cb-accent" />
                    {digestTime(d.generatedAt, locale)}
                  </span>
                </div>
                <p className="text-sm text-cb-foreground/90 leading-relaxed whitespace-pre-line">
                  {d.summary}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cb-muted py-4">{t.news.analysisEmpty}</p>
        )}
      </div>
    </aside>
  );
};

const NewsPage = ({
  initialNews,
  initialDigests,
}: {
  initialNews?: NewsItem[];
  initialDigests?: NewsDigest[];
}) => {
  const t = useLanguageStore((s) => s.t);
  const language = useLanguageStore((s) => s.language);

  const {
    market,
    news,
    translations,
    isLoading,
    isTranslating,
    translationStatus,
    translationMode,
    translationProgress,
    error,
    lastFetchedAt,
    setMarket,
    fetchNews,
    initTranslation,
    translateAll,
  } = useNewsStore();

  // 서버 초기 데이터가 있으면 store 가 채워지기 전에도 SSR/첫 렌더에서 뉴스 리스트 표시(폴백).
  const displayNews = news.length > 0 ? news : (initialNews ?? []);

  // 우측 분석 패널 — 선택 시장의 AI 다이제스트 리스트(매시 누적).
  const [digests, setDigests] = useState<NewsDigest[]>(initialDigests ?? []);
  const [digestLoading, setDigestLoading] = useState(!initialDigests);
  const [digestError, setDigestError] = useState(false);

  // 비동기 경로에서만 setState (effect 내 동기 setState 회피) — 로딩 토글은 이벤트 핸들러에서.
  const loadDigest = useCallback((m: 'KR' | 'US') => {
    fetchNewsDigests(m)
      .then((list) => {
        setDigests(list);
        setDigestError(false);
      })
      .catch(() => setDigestError(true))
      .finally(() => setDigestLoading(false));
  }, []);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 시장 변경/마운트 시 분석 다이제스트 로드. 서버가 KR 다이제스트를 줬으면 마운트 재요청 생략.
  const didInitialDigest = useRef(false);
  useEffect(() => {
    if (!didInitialDigest.current) {
      didInitialDigest.current = true;
      if (initialDigests && market === 'KR') return;
    }
    loadDigest(market);
  }, [market, loadDigest, initialDigests]);

  // When news loads or language changes, (re-)init translation
  useEffect(() => {
    if (news.length > 0) {
      initTranslation(language);
    }
  }, [news.length, language, initTranslation]);

  const handleMarket = (m: 'KR' | 'US') => {
    if (m === market) return;
    setDigestLoading(true);
    setDigestError(false);
    setMarket(m);
  };

  const retryDigest = () => {
    setDigestLoading(true);
    setDigestError(false);
    loadDigest(market);
  };

  const handleRefresh = () => {
    fetchNews(true);
    setDigestLoading(true);
    setDigestError(false);
    loadDigest(market);
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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-sky-400/15 text-sky-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-cb-foreground">{t.news.title}</h1>
        </div>
        <p className="text-cb-muted ml-11">{t.news.subtitle}</p>
      </div>

      {/* Market 토글 (국내 네이버 / 해외 Finnhub) */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--cb-input-bg)] w-fit">
        {(['KR', 'US'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleMarket(m)}
            className={[
              'px-4 py-1.5 rounded-md text-sm font-semibold transition-colors',
              market === m
                ? 'bg-cb-accent text-cb-on-accent'
                : 'text-cb-muted hover:text-cb-foreground',
            ].join(' ')}
          >
            {m === 'KR' ? t.news.marketKr : t.news.marketUs}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {lastUpdatedText && (
            <span className="text-xs text-cb-muted/60">{lastUpdatedText} {UPDATED_SUFFIX[language] ?? UPDATED_SUFFIX.ko}</span>
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

      {/* 본문: 좌(뉴스 리스트) · 우(AI 분석) 2단 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: 뉴스 리스트 */}
        <div className="flex flex-col gap-3">
          {error && !isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-cb-negative/25 bg-cb-negative/8 text-cb-negative text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.news.error}</span>
            </div>
          )}

          {isLoading && displayNews.length === 0 &&
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

          {displayNews.length > 0 &&
            displayNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                translation={translations[item.id]}
                locale={language}
              />
            ))}

          {!isLoading && !error && displayNews.length === 0 && (
            <div className="glass-panel p-12 flex flex-col items-center gap-3 text-center">
              <Newspaper className="w-10 h-10 text-cb-muted/30" />
              <p className="text-sm text-cb-muted">{t.news.noNews}</p>
            </div>
          )}
        </div>

        {/* Right: AI 뉴스 분석 (sticky) */}
        <AnalysisPanel
          market={market}
          digests={digests}
          loading={digestLoading}
          error={digestError}
          onRetry={retryDigest}
          locale={language}
        />
      </div>
    </div>
  );
};

export default NewsPage;
