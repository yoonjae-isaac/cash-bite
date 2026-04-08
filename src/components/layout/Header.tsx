import { DollarSign } from 'lucide-react';
import LanguageSwitcher from '../../presentation/components/i18n/LanguageSwitcher';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const Header = () => {
  const t = useLanguageStore((state) => state.t);

  return (
    <header className="glass-header py-4">
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t.common.title}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
