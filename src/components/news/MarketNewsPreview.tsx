'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { PATH_OF } from '../../application/routing/pages';
import { fetchNewsDigest } from '../../infrastructure/api/backendNewsClient';
import type { NewsDigest } from '../../domain/news/types';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';

/**
 * 홈 시장 요약 — 국내(KR)·미국(US) 일별 AI 다이제스트(summary)를 두 섹션으로 노출.
 * 데이터: 백엔드 GET /news/digest (크론이 KST 15:30/06:00 생성). 미생성=섹션별 안내, 로딩 실패=재시도.
 */
const MarketNewsPreview = () => {
  const t = useLanguageStore((s) => s.t);
  const [kr, setKr] = useState<NewsDigest | null>(null);
  const [us, setUs] = useState<NewsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // 동기 setState를 두지 않음(effect 내 직접 setState 회피) — 초기 상태가 이미 loading=true.
  const load = useCallback(() => {
    Promise.allSettled([fetchNewsDigest('KR'), fetchNewsDigest('US')]).then((rs) => {
      setKr(rs[0].status === 'fulfilled' ? rs[0].value : null);
      setUs(rs[1].status === 'fulfilled' ? rs[1].value : null);
      setFailed(rs.some((r) => r.status === 'rejected'));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 재시도(사용자 이벤트) — 여기서 로딩 상태를 되돌린다.
  const retry = () => {
    setLoading(true);
    setFailed(false);
    load();
  };

  const sections: { label: string; digest: NewsDigest | null }[] = [
    { label: t.marketNews.digestKr, digest: kr },
    { label: t.marketNews.digestUs, digest: us },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-cb-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cb-accent" />
          {t.marketNews.title}
        </h3>
        <Link
          href={PATH_OF.news}
          className="flex items-center gap-1 text-xs font-semibold text-cb-accent hover:text-cb-accent-hover transition-colors"
        >
          {t.marketNews.viewAll}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : failed && !kr && !us ? (
        <ErrorRetry message={t.marketNews.error} retryLabel={t.news.retry} onRetry={retry} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(({ label, digest }) => (
            <div key={label} className="glass-panel p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cb-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-cb-accent" />
                  {label}
                </span>
                {digest && (
                  <span className="text-[11px] text-cb-muted tabular-nums">{digest.digestDate}</span>
                )}
              </div>
              {digest ? (
                <p className="text-sm text-cb-foreground/90 leading-relaxed whitespace-pre-line">
                  {digest.summary}
                </p>
              ) : (
                <p className="text-sm text-cb-muted">{t.marketNews.noNews}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MarketNewsPreview;
