'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '../../presentation/components/i18n/LanguageSwitcher';
import ThemeToggle from '../../presentation/components/theme/ThemeToggle';
import UpDownToggle from '../../presentation/components/updown/UpDownToggle';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { FEATURES } from '../../config/features';
import { PATH_OF } from '../../application/routing/pages';
import Wordmark from './Wordmark';
import { TOOLS_UI, pick } from '../../domain/tools/catalog';
import { LEARN_NAV } from '../../domain/learn/articles';
import type { PageId } from '../../domain/i18n/types';

const Header = () => {
  const t = useLanguageStore((state) => state.t);
  const lang = useLanguageStore((state) => state.language);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 데스크톱 탭: 콘텐츠 페이지만 (텍스트 전용). 홈은 로고 클릭으로 이동.
  // persona 는 임시 미노출(FEATURES.persona) — 플래그 true 로 즉시 복구.
  const navItems: PageId[] = (
    ['news', 'gurus', 'persona', 'stock', 'macro', 'calendar'] as PageId[]
  ).filter((id) => id !== 'persona' || FEATURES.persona);

  // 모바일 드로워 = 데스크톱 탭
  const mobileItems: PageId[] = navItems;

  const navLabels: Record<PageId, string> = {
    home: t.nav.home,
    portfolio: t.nav.portfolio,
    compound: t.nav.compound,
    averaging: t.nav.averaging,
    news: t.nav.news,
    gurus: t.nav.gurus,
    consensus: t.nav.consensus,
    macro: t.nav.macro,
    stock: t.nav.stock,
    persona: t.nav.persona,
    calendar: t.nav.calendar,
  };

  // 하위 라우트(/gurus/[investor] 등)에서도 상위 탭이 활성으로 보이도록 prefix 매칭.
  // 홈은 '/' 라 startsWith 가 전부 참이 되므로 완전 일치로만 판정한다.
  const isActive = (id: PageId): boolean =>
    id === 'home' ? pathname === '/' : pathname.startsWith(PATH_OF[id]);

  // 투자 도구는 PageId 체계 밖(별도 계산기 섹션) — 전용 링크로 취급.
  const toolsActive = pathname.startsWith('/tools');
  const learnActive = pathname.startsWith('/learn');

  // 링크 클릭 시 모바일 드로워 닫기 + 상단으로 (기존 handleNav 동작 유지). 이동 자체는 <Link> 가 처리.
  const closeMobile = () => {
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
        <Link
          href="/"
          onClick={closeMobile}
          className="flex items-center pr-4 shrink-0 group"
        >
          <Wordmark as="span" className="text-xl" />
        </Link>

        {/* Desktop nav — 텍스트 전용 필드 탭 (선택 시 채움) */}
        <nav
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((id) => {
            const active = isActive(id);
            return (
              <Link
                key={id}
                href={PATH_OF[id]}
                onClick={closeMobile}
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
              </Link>
            );
          })}
          <Link
            href="/tools"
            onClick={closeMobile}
            aria-current={toolsActive ? 'page' : undefined}
            className={[
              'px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap',
              'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
              toolsActive
                ? 'bg-cb-accent text-cb-on-accent font-semibold hover:bg-cb-accent-hover'
                : 'font-normal text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
            ].join(' ')}
          >
            {pick(TOOLS_UI.navLabel, lang)}
          </Link>
          <Link
            href="/learn"
            onClick={closeMobile}
            aria-current={learnActive ? 'page' : undefined}
            className={[
              'px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap',
              'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
              learnActive
                ? 'bg-cb-accent text-cb-on-accent font-semibold hover:bg-cb-accent-hover'
                : 'font-normal text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
            ].join(' ')}
          >
            {pick(LEARN_NAV, lang)}
          </Link>
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
            className="md:hidden -mr-1 flex h-11 w-11 items-center justify-center rounded-lg text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              const active = isActive(id);
              return (
                <Link
                  key={id}
                  href={PATH_OF[id]}
                  onClick={closeMobile}
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
                </Link>
              );
            })}
            <Link
              href="/tools"
              onClick={closeMobile}
              aria-current={toolsActive ? 'page' : undefined}
              className={[
                'px-4 py-3 rounded-lg text-sm text-left',
                'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                toolsActive
                  ? 'bg-cb-accent/12 text-cb-accent font-semibold'
                  : 'font-normal text-cb-foreground hover:bg-[var(--cb-hover)]',
              ].join(' ')}
            >
              {pick(TOOLS_UI.navLabel, lang)}
            </Link>
            <Link
              href="/learn"
              onClick={closeMobile}
              aria-current={learnActive ? 'page' : undefined}
              className={[
                'px-4 py-3 rounded-lg text-sm text-left',
                'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                learnActive
                  ? 'bg-cb-accent/12 text-cb-accent font-semibold'
                  : 'font-normal text-cb-foreground hover:bg-[var(--cb-hover)]',
              ].join(' ')}
            >
              {pick(LEARN_NAV, lang)}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
