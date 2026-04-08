import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const Footer = () => {
  const t = useLanguageStore((state) => state.t);

  return (
    <footer className="mt-auto py-8 text-center text-cb-muted border-t border-cb-border">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {t.common.title}. 
          <span className="block md:inline md:ml-2">{t.common.footerInfo}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
