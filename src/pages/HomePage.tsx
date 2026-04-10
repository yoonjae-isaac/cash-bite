import { TrendingUp, Calculator, Target, Layers, ArrowRight, Lock, Zap, CreditCard, Smartphone, Lightbulb } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { usePageStore } from '../store/usePageStore';
import type { PageId } from '../domain/i18n/types';
import QuoteOfDay from '../components/home/QuoteOfDay';

type Tool = {
  id: PageId;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const HomePage = () => {
  const t = useLanguageStore((s) => s.t);
  const navigate = usePageStore((s) => s.navigate);

  const tools: Tool[] = [
    {
      id: 'portfolio',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-cb-accent',
      bg: 'bg-cb-accent/15',
    },
    {
      id: 'compound',
      icon: <Calculator className="w-6 h-6" />,
      color: 'text-cb-positive',
      bg: 'bg-cb-positive/15',
    },
    {
      id: 'fire',
      icon: <Target className="w-6 h-6" />,
      color: 'text-orange-400',
      bg: 'bg-orange-400/15',
    },
    {
      id: 'averaging',
      icon: <Layers className="w-6 h-6" />,
      color: 'text-violet-400',
      bg: 'bg-violet-400/15',
    },
  ];

  const toolLabels = [
    { title: t.home.portfolioTitle, desc: t.home.portfolioDesc },
    { title: t.home.compoundTitle, desc: t.home.compoundDesc },
    { title: t.home.fireTitle, desc: t.home.fireDesc },
    { title: t.home.averagingTitle, desc: t.home.averagingDesc },
  ];

  const trustItems = [
    { icon: <Lock className="w-4 h-4" />, label: t.home.trust1 },
    { icon: <CreditCard className="w-4 h-4" />, label: t.home.trust2 },
    { icon: <Zap className="w-4 h-4" />, label: t.home.trust3 },
    { icon: <Smartphone className="w-4 h-4" />, label: t.home.trust4 },
  ];

  const tips = [
    { title: t.home.tip1Title, desc: t.home.tip1Desc },
    { title: t.home.tip2Title, desc: t.home.tip2Desc },
    { title: t.home.tip3Title, desc: t.home.tip3Desc },
  ];

  return (
    <div className="flex flex-col gap-16 pb-8">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex flex-col lg:flex-row items-center gap-10 pt-6 lg:pt-10">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-cb-accent/10 blur-[80px]" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-sky-400/6 blur-[80px]" />
        </div>

        {/* Text */}
        <div className="flex-1 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cb-accent/30 bg-cb-accent/8 text-cb-accent text-xs font-semibold tracking-wide uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            브라우저 기반 · 무료 · 오픈
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-cb-foreground leading-tight">
            {t.home.heroTitle
              .split(',')
              .map((part, i) =>
                i === 0 ? (
                  <span key={i} className="bg-clip-text text-transparent bg-gradient-to-r from-cb-accent via-amber-300 to-cb-accent-hover">
                    {part}
                  </span>
                ) : (
                  <span key={i}>, {part}</span>
                )
              )}
          </h2>

          <p className="text-base md:text-lg text-cb-muted max-w-lg leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('portfolio')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cb-accent text-cb-on-accent font-bold shadow-lg shadow-amber-500/30 hover:bg-cb-accent-hover hover:shadow-amber-400/45 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {t.home.heroCta}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('compound')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-cb-border bg-cb-surface/60 text-cb-foreground font-semibold hover:border-cb-accent/40 hover:text-cb-accent transition-all"
            >
              <Calculator className="w-4 h-4" />
              {t.nav.compound}
            </button>
          </div>
        </div>

        {/* Hero illustration — inline SVG, theme-aware */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="relative w-72 h-72">
            {/* glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cb-accent/20 to-cb-positive/10 blur-xl" />
            <div className="relative w-full h-full rounded-3xl border border-cb-accent/25 bg-cb-surface/60 shadow-2xl shadow-black/30 overflow-hidden p-5 flex flex-col justify-end">

              {/* Inline chart SVG — no background rect, uses hardcoded theme colors */}
              <svg
                viewBox="0 0 240 160"
                fill="none"
                aria-hidden
                className="absolute inset-0 w-full h-full p-6"
              >
                <defs>
                  <linearGradient id="hAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffbf00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ffbf00" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a67c1a" />
                    <stop offset="100%" stopColor="#ffca28" />
                  </linearGradient>
                  <linearGradient id="hBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43a047" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#43a047" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[40, 80, 120].map((y) => (
                  <line key={y} x1="10" y1={y} x2="230" y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
                ))}

                {/* Volume bars */}
                {[
                  [24, 40], [54, 55], [84, 35], [114, 50],
                  [144, 60], [174, 45], [204, 70],
                ].map(([x, h]) => (
                  <rect key={x} x={x - 8} y={150 - h} width={16} height={h} rx="3" fill="url(#hBar)" />
                ))}

                {/* Area fill */}
                <path
                  d="M20 118 L50 100 L80 108 L110 82 L140 65 L170 45 L200 28 L220 20 L220 150 L20 150 Z"
                  fill="url(#hAreaFill)"
                />

                {/* Trend line */}
                <path
                  d="M20 118 L50 100 L80 108 L110 82 L140 65 L170 45 L200 28"
                  stroke="url(#hLine)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point circles */}
                {[[50, 100], [110, 82], [170, 45]].map(([cx, cy]) => (
                  <circle key={cx} cx={cx} cy={cy} r="3.5" fill="#ffbf00" fillOpacity="0.85" />
                ))}

                {/* Arrow tip */}
                <polygon points="200,18 208,28 192,28" fill="#ffca28" />
              </svg>

              {/* Floating stat badges */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-cb-positive/20 border border-cb-positive/30 text-cb-positive text-[11px] font-bold font-mono z-10">
                +7.2% / yr
              </div>
              <div className="absolute bottom-10 left-4 px-2.5 py-1 rounded-lg bg-cb-accent/20 border border-cb-accent/30 text-cb-accent text-[11px] font-bold font-mono z-10">
                FIRE 🎯
              </div>
              <div className="absolute bottom-20 right-4 px-2.5 py-1 rounded-lg bg-sky-400/20 border border-sky-400/30 text-sky-400 text-[11px] font-bold font-mono z-10">
                ₩1,430
              </div>
            </div>
          </div>
        </div>
      </section>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, i) => (
            <button
              key={i}
              onClick={() => navigate(tool.id)}
              className="group glass-panel p-6 flex flex-col gap-4 text-left hover:border-cb-accent/35 hover:shadow-[0_8px_32px_-8px_rgba(255,191,0,0.15)] transition-all duration-300 hover:-translate-y-1"
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
                <h4 className="font-bold text-cb-foreground text-sm">{tip.title}</h4>
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
