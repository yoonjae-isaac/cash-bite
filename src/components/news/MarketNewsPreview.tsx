import { useEffect, useState } from 'react';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import { fetchNewsDigest } from '../../infrastructure/api/backendNewsClient';
import type { NewsDigest } from '../../domain/news/types';

/**
 * 홈 시장 요약 — 국내(KR)·미국(US) 일별 AI 다이제스트(summary)를 두 섹션으로 노출.
 * 데이터: 백엔드 GET /news/digest (크론이 KST 15:30/06:00 생성). 아직 없으면 섹션별 안내.
 */
const MarketNewsPreview = () => {
  const t = useLanguageStore((s) => s.t);
  const navigate = usePageStore((s) => s.navigate);
  const [kr, setKr] = useState<NewsDigest | null>(null);
  const [us, setUs] = useState<NewsDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchNewsDigest('KR').catch(() => null),
      fetchNewsDigest('US').catch(() => null),
    ])
      .then(([k, u]) => {
        if (!alive) return;
        setKr(k);
        setUs(u);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

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
        <button
          onClick={() => navigate('news')}
          className="flex items-center gap-1 text-xs font-semibold text-cb-accent hover:text-cb-accent-hover transition-colors"
        >
          {t.marketNews.viewAll}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-cb-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.marketNews.loading}</span>
        </div>
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
