import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '../../presentation/components/i18n/LanguageSwitcher';
import ThemeToggle from '../../presentation/components/theme/ThemeToggle';
import UpDownToggle from '../../presentation/components/updown/UpDownToggle';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import type { PageId } from '../../domain/i18n/types';

const Header = () => {
  const t = useLanguageStore((state) => state.t);
  const { page, navigate } = usePageStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 데스크톱 탭: 콘텐츠 페이지만 (텍스트 전용). 홈은 로고 클릭으로 이동.
  const navItems: PageId[] = ['news', 'gurus', 'persona', 'stock', 'macro', 'calendar'];

  // 모바일 드로워 = 데스크톱 탭
  const mobileItems: PageId[] = navItems;

  const navLabels: Record<PageId, string> = {
    home: t.nav.home,
    portfolio: t.nav.portfolio,
    compound: t.nav.compound,
    averaging: t.nav.averaging,
    news: t.nav.news,
    gurus: t.nav.gurus,
    macro: t.nav.macro,
    stock: t.nav.stock,
    persona: t.nav.persona,
    calendar: t.nav.calendar,
  };

  const handleNav = (id: PageId) => {
    navigate(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="glass-header">
      {/* Single row: logo | desktop-nav (flush bottom) | controls */}
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 flex items-center justify-between min-h-[52px]">
        {/* 좌측 그룹: 로고 + 탭 (세로 중앙 정렬 — 탭 레이어와 일치) */}
        <div className="flex items-center min-w-0">

        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-1.5 pr-4 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
            <img
              src="/logo.png"
              width={32}
              height={32}
              alt="AntsUp"
              className="w-full h-full object-cover"
              decoding="async"
            />
          </div>
          <h1 className="text-xl font-brand font-bold tracking-tight text-cb-foreground leading-none">
            AntsUp
          </h1>
        </button>

        {/* Desktop nav — 텍스트 전용 필드 탭 (선택 시 채움) */}
        <nav
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((id) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap',
                  'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  active
                    ? 'bg-cb-accent text-cb-on-accent font-semibold hover:bg-cb-accent-hover'
                    : 'font-normal text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
                ].join(' ')}
              >
                {navLabels[id]}
              </button>
            );
          })}
        </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 pl-4">
          <UpDownToggle />
          <ThemeToggle />
          <LanguageSwitcher />
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-1.5 rounded-lg border border-cb-border text-cb-muted hover:text-cb-accent hover:border-cb-accent/35 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-cb-border bg-cb-surface/95 backdrop-blur-sm"
          aria-label="Mobile navigation"
        >
          <div className="w-full max-w-[1280px] mx-auto px-4 py-2 flex flex-col gap-0.5">
            {mobileItems.map((id) => {
              const active = page === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'px-4 py-3 rounded-lg text-sm text-left',
                    'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    active
                      ? 'bg-cb-accent/12 text-cb-accent font-semibold'
                      : 'font-normal text-cb-foreground hover:bg-[var(--cb-hover)]',
                  ].join(' ')}
                >
                  {navLabels[id]}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
