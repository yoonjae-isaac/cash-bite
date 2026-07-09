'use client';

import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { PATH_OF } from '../../application/routing/pages';
import Wordmark from './Wordmark';
import type { PageId } from '../../domain/i18n/types';

const MENU: PageId[] = ['news', 'gurus', 'stock', 'macro'];

// 하단 법적 링크 라벨(다국어) — t 스키마 밖 항목이라 별도 맵.
const LEGAL_LABELS = {
  about: { ko: '소개', en: 'About', ja: '概要' },
  privacy: { ko: '개인정보처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー' },
  terms: { ko: '이용약관', en: 'Terms of Service', ja: '利用規約' },
} as const;

const Footer = () => {
  const t = useLanguageStore((s) => s.t);
  const language = useLanguageStore((s) => s.language);

  const menuLabel: Record<string, string> = {
    news: t.nav.news,
    gurus: t.nav.gurus,
    stock: t.nav.stock,
    macro: t.nav.macro,
  };

  return (
    <footer className="mt-auto border-t border-cb-border">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* 브랜드 + 태그라인 + 버전·언어 */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-end">
              <Wordmark className="text-xl" />
            </div>
            <p className="mt-3 text-sm text-cb-muted leading-relaxed">{t.footer.tagline}</p>
            <span className="mt-3 inline-block text-[11px] font-semibold text-cb-muted/70 tracking-wide">
              v1 / {language.toUpperCase()}
            </span>
          </div>

          {/* 메뉴 */}
          <nav aria-label={t.footer.menuTitle}>
            <h4 className="text-xs font-bold text-cb-foreground uppercase tracking-wide mb-3">
              {t.footer.menuTitle}
            </h4>
            <ul className="space-y-2">
              {MENU.map((id) => (
                <li key={id}>
                  <Link
                    href={PATH_OF[id]}
                    className="text-sm text-cb-muted hover:text-cb-accent transition-colors"
                  >
                    {menuLabel[id]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 소개 */}
          <div>
            <h4 className="text-xs font-bold text-cb-foreground uppercase tracking-wide mb-3">
              {t.footer.aboutTitle}
            </h4>
            <p className="text-sm text-cb-muted leading-relaxed">{t.footer.aboutDesc}</p>
          </div>

          {/* 데이터 · 면책 */}
          <div>
            <h4 className="text-xs font-bold text-cb-foreground uppercase tracking-wide mb-3">
              {t.footer.dataTitle}
            </h4>
            <p className="text-sm text-cb-muted leading-relaxed">{t.footer.sources}</p>
            <p className="mt-2 text-xs text-cb-muted/80 leading-relaxed">{t.footer.disclaimer}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cb-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-cb-muted">
          <div>
            &copy; {new Date().getFullYear()} {t.common.title}.
            <span className="ml-1">{t.common.footerInfo}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-cb-accent transition-colors">{LEGAL_LABELS.about[language]}</Link>
            <Link href="/privacy" className="hover:text-cb-accent transition-colors">{LEGAL_LABELS.privacy[language]}</Link>
            <Link href="/terms" className="hover:text-cb-accent transition-colors">{LEGAL_LABELS.terms[language]}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
