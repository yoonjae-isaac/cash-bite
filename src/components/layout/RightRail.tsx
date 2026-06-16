import { TrendingUp, Calculator, Layers, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { PageId } from '../../domain/i18n/types';

interface RailLinkProps {
  id: PageId;
  icon: React.ReactNode;
  label: string;
  meta?: string;
}

const RailLink = ({ id, icon, label, meta }: RailLinkProps) => {
  const { page, navigate } = usePageStore();
  const active = page === id;
  return (
    <button
      onClick={() => {
        navigate(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      aria-current={active ? 'page' : undefined}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group',
        active ? 'bg-cb-accent/10' : 'hover:bg-[var(--cb-hover)]',
      ].join(' ')}
    >
      <span
        className={[
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          active ? 'bg-cb-accent/15 text-cb-accent' : 'theme-icon-tile text-cb-muted',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={[
            'block text-sm font-semibold truncate',
            active ? 'text-cb-accent' : 'text-cb-foreground',
          ].join(' ')}
        >
          {label}
        </span>
        {meta && <span className="block text-[11px] text-cb-muted truncate">{meta}</span>}
      </span>
      <ChevronRight className="w-4 h-4 text-cb-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

/** 토스 스타일 우측 레일 — 개인 도구 진입점. 뷰포트 우측에 고정 (데스크톱 전용, 탭에서 분리) */
const RightRail = () => {
  const t = useLanguageStore((s) => s.t);
  const stockCount = usePortfolioStore((s) => s.stocks.length);

  return (
    <aside className="hidden xl:block fixed right-6 top-28 w-72 space-y-4 z-40">
      {/* 내 투자 */}
      <section className="glass-panel rounded-xl p-3">
        <h3 className="px-3 pt-1 pb-2 text-xs font-bold text-cb-muted uppercase tracking-wide">
          {t.sidebar.myInvestTitle}
        </h3>
        <RailLink
          id="portfolio"
          icon={<TrendingUp className="w-4 h-4" />}
          label={t.nav.portfolio}
          meta={
            stockCount > 0 ? `${stockCount} ${t.sidebar.stocksCount}` : t.sidebar.portfolioEmpty
          }
        />
      </section>

      {/* 계산 도구 */}
      <section className="glass-panel rounded-xl p-3">
        <h3 className="px-3 pt-1 pb-2 text-xs font-bold text-cb-muted uppercase tracking-wide">
          {t.sidebar.toolsTitle}
        </h3>
        <div className="space-y-0.5">
          <RailLink id="compound" icon={<Calculator className="w-4 h-4" />} label={t.nav.compound} />
          <RailLink id="averaging" icon={<Layers className="w-4 h-4" />} label={t.nav.averaging} />
        </div>
      </section>
    </aside>
  );
};

export default RightRail;
