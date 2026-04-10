import { Home, TrendingUp, Calculator, Target, Layers, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '../../presentation/components/i18n/LanguageSwitcher';
import ThemeToggle from '../../presentation/components/theme/ThemeToggle';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import type { PageId } from '../../domain/i18n/types';

type NavItem = { id: PageId; icon: React.ReactNode };

const Header = () => {
  const t = useLanguageStore((state) => state.t);
  const { page, navigate } = usePageStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', icon: <Home className="w-4 h-4" /> },
    { id: 'portfolio', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'compound', icon: <Calculator className="w-4 h-4" /> },
    { id: 'fire', icon: <Target className="w-4 h-4" /> },
    { id: 'averaging', icon: <Layers className="w-4 h-4" /> },
  ];

  const navLabels: Record<PageId, string> = {
    home: t.nav.home,
    portfolio: t.nav.portfolio,
    compound: t.nav.compound,
    fire: t.nav.fire,
    averaging: t.nav.averaging,
  };

  const handleNav = (id: PageId) => {
    navigate(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="glass-header">
      {/* Single row: logo | desktop-nav (flush bottom) | controls */}
      <div className="container mx-auto max-w-7xl px-4 flex items-stretch justify-between min-h-[52px]">

        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-1.5 py-2.5 pr-4 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
            <img
              src="/logo.png"
              width={32}
              height={32}
              alt="CashBite"
              className="w-full h-full object-cover"
              decoding="async"
            />
          </div>
          <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-cb-foreground to-cb-muted hidden sm:block leading-none">
            {t.common.title}
          </h1>
        </button>

        {/* Desktop nav — flush to header bottom via border-b-2 -mb-px */}
        <nav
          className="hidden md:flex items-stretch"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-1.5 px-3.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 whitespace-nowrap',
                  active
                    ? 'border-cb-accent text-cb-accent'
                    : 'border-transparent text-cb-muted hover:text-cb-foreground hover:border-cb-border',
                ].join(' ')}
              >
                {item.icon}
                {navLabels[item.id]}
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 py-2 pl-4">
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
          <div className="container mx-auto max-w-7xl px-4 py-2 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left',
                    active
                      ? 'bg-cb-accent/12 text-cb-accent'
                      : 'text-cb-foreground hover:bg-[var(--cb-hover)]',
                  ].join(' ')}
                >
                  <span className={active ? 'text-cb-accent' : 'text-cb-muted'}>{item.icon}</span>
                  {navLabels[item.id]}
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
