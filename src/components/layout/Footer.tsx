import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { usePageStore } from '../../store/usePageStore';
import type { PageId } from '../../domain/i18n/types';

const MENU: PageId[] = ['news', 'gurus', 'stock', 'macro'];

const Footer = () => {
  const t = useLanguageStore((s) => s.t);
  const language = useLanguageStore((s) => s.language);
  const navigate = usePageStore((s) => s.navigate);

  const handleNav = (id: PageId) => {
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <div className="flex items-end gap-1.5">
              <img
                src="/logo.png"
                width={32}
                height={32}
                alt="AntsUp"
                className="w-8 h-8 rounded-md object-cover"
                decoding="async"
              />
              <span className="text-xl font-brand font-bold tracking-tight text-cb-foreground">
                AntsUp
              </span>
            </div>
            <p className="mt-3 text-sm text-cb-muted leading-relaxed">{t.footer.tagline}</p>
            <span className="mt-3 inline-block text-[11px] font-semibold text-cb-muted/70 tracking-wide">
              v1 · {language.toUpperCase()}
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
                  <button
                    onClick={() => handleNav(id)}
                    className="text-sm text-cb-muted hover:text-cb-accent transition-colors"
                  >
                    {menuLabel[id]}
                  </button>
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

        <div className="mt-8 pt-6 border-t border-cb-border text-xs text-cb-muted">
          &copy; {new Date().getFullYear()} {t.common.title}.
          <span className="ml-1">{t.common.footerInfo}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
