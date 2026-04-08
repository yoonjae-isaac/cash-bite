import { DollarSign } from 'lucide-react';
import LanguageSwitcher from '../../presentation/components/i18n/LanguageSwitcher';
import ThemeToggle from '../../presentation/components/theme/ThemeToggle';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const Header = () => {
  const t = useLanguageStore((state) => state.t);

  return (
    <header className="glass-header py-4">
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cb-accent to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/35">
            <DollarSign className="w-6 h-6 text-cb-on-accent" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cb-foreground to-cb-muted">
            {t.common.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
