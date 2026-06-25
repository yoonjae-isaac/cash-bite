import { Newspaper, Crown, LineChart, Compass, ArrowRight, Lock, Zap, CreditCard, Smartphone, Lightbulb } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { usePageStore } from '../store/usePageStore';
import type { PageId } from '../domain/i18n/types';
import QuoteOfDay from '../components/home/QuoteOfDay';
import MarketNewsPreview from '../components/news/MarketNewsPreview';
import InfoHint from '../components/ui/InfoHint';

type Tool = {
  id: PageId;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const HomePage = () => {
  const t = useLanguageStore((s) => s.t);
  const navigate = usePageStore((s) => s.navigate);

  // 복리·배당포트폴리오·물타기 비활성 — news·gurus·macro 노출
  const tools: Tool[] = [
    {
      id: 'news',
      icon: <Newspaper className="w-6 h-6" />,
      color: 'text-sky-400',
      bg: 'bg-sky-400/15',
    },
    {
      id: 'gurus',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-rose-400',
      bg: 'bg-rose-400/15',
    },
    {
      id: 'macro',
      icon: <LineChart className="w-6 h-6" />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/15',
    },
    {
      id: 'persona',
      icon: <Compass className="w-6 h-6" />,
      color: 'text-violet-400',
      bg: 'bg-violet-400/15',
    },
  ];

  const toolLabels = [
    { title: t.home.newsTitle, desc: t.home.newsDesc },
    { title: t.home.gurusTitle, desc: t.home.gurusDesc },
    { title: t.nav.macro, desc: t.macro.subtitle },
    { title: t.nav.persona, desc: t.persona.subtitle },
  ];

  const trustItems = [
    { icon: <Lock className="w-4 h-4" />, label: t.home.trust1 },
    { icon: <CreditCard className="w-4 h-4" />, label: t.home.trust2 },
    { icon: <Zap className="w-4 h-4" />, label: t.home.trust3 },
    { icon: <Smartphone className="w-4 h-4" />, label: t.home.trust4 },
  ];

  const tips = [
    { title: t.home.tip1Title, desc: t.home.tip1Desc, hint: t.glossary.drip },
    { title: t.home.tip2Title, desc: t.home.tip2Desc, hint: undefined },
    { title: t.home.tip3Title, desc: t.home.tip3Desc, hint: t.glossary.thirteenF },
  ];

  return (
    <div className="flex flex-col gap-16 pb-8">

      {/* ── Hero (정체성 먼저) ───────────────────────────── */}
      <section className="text-center pt-2 md:pt-6">
        <h2 className="text-3xl md:text-5xl font-brand font-extrabold tracking-tight text-cb-foreground leading-tight">
          {t.home.heroTitle}
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-cb-muted text-base md:text-lg leading-relaxed">
          {t.home.heroSubtitle}
        </p>
        <button
          onClick={() => navigate('gurus')}
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors"
        >
          {t.home.heroCta}
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* ── Market News Preview ──────────────────────────── */}
      <MarketNewsPreview />

      {/* ── Quote of the Day ─────────────────────────────── */}
      <QuoteOfDay />

      {/* ── Trust signals ────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3">
        {trustItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-cb-border bg-cb-surface/50 text-sm text-cb-muted font-medium"
          >
            <span className="text-cb-accent">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* ── Tool Cards ───────────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{t.home.toolsTitle}</h3>
          <p className="text-cb-muted">{t.home.toolsSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, i) => (
            <button
              key={i}
              onClick={() => navigate(tool.id)}
              className="group glass-panel p-6 flex flex-col gap-4 text-left hover:border-cb-accent/35 hover:shadow-[0_8px_32px_-8px_rgba(127,127,135,0.22)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                {tool.icon}
              </div>
              <div>
                <h4 className={`font-bold text-cb-foreground mb-1.5 group-hover:${tool.color} transition-colors`}>
                  {toolLabels[i].title}
                </h4>
                <p className="text-sm text-cb-muted leading-relaxed">{toolLabels[i].desc}</p>
              </div>
              <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                시작하기 <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Financial Tips ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-cb-accent" />
          <h3 className="text-xl font-bold text-cb-foreground">{t.home.tipTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="glass-panel p-5 border-l-2 border-cb-accent/50 bg-gradient-to-br from-cb-accent/5 to-transparent"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-cb-accent/20 text-cb-accent flex items-center justify-center text-xs font-black">
                  {i + 1}
                </div>
                <h4 className="font-bold text-cb-foreground text-sm flex items-center gap-1">
                  {tip.title}
                  {tip.hint && <InfoHint label={tip.title} content={tip.hint} />}
                </h4>
              </div>
              <p className="text-sm text-cb-muted leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
