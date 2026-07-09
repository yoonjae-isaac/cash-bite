'use client';

import { Newspaper, Crown, LineChart, BarChart3, CalendarDays, ArrowRight, Lock, Zap, CreditCard, Smartphone, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { PATH_OF } from '../application/routing/pages';
import type { PageId } from '../domain/i18n/types';
import QuoteOfDay from '../components/home/QuoteOfDay';
import MarketNewsPreview from '../components/news/MarketNewsPreview';
import InfoHint from '../components/ui/InfoHint';
import Reveal from '../components/ui/Reveal';

type Tool = {
  id: PageId;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const CARD_CTA = {
  goto: { ko: '바로가기', en: 'Open', ja: '開く' },
  start: { ko: '시작하기', en: 'Start', ja: '始める' },
} as const;

const HomePage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  // 노출 도구 — news·gurus·stock·macro·calendar
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
      id: 'stock',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/15',
    },
    {
      id: 'macro',
      icon: <LineChart className="w-6 h-6" />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/15',
    },
    {
      id: 'calendar',
      icon: <CalendarDays className="w-6 h-6" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/15',
    },
  ];

  const toolLabels = [
    { title: t.home.newsTitle, desc: t.home.newsDesc },
    { title: t.home.gurusTitle, desc: t.home.gurusDesc },
    { title: t.nav.stock, desc: t.stock.subtitle },
    { title: t.nav.macro, desc: t.macro.subtitle },
    { title: t.nav.calendar, desc: t.calendar.subtitle },
  ];

  const trustItems = [
    { icon: <Lock className="w-4 h-4" />, label: t.home.trust1 },
    { icon: <CreditCard className="w-4 h-4" />, label: t.home.trust2 },
    { icon: <Zap className="w-4 h-4" />, label: t.home.trust3 },
    { icon: <Smartphone className="w-4 h-4" />, label: t.home.trust4 },
  ];

  // 히어로 CTA 아래 기능 칩 — "이 사이트로 뭘 할 수 있는지" 즉시 노출
  const chips: PageId[] = ['news', 'gurus', 'stock', 'macro', 'calendar'];
  const chipLabel: Record<string, string> = {
    news: t.nav.news,
    gurus: t.nav.gurus,
    stock: t.nav.stock,
    macro: t.nav.macro,
    calendar: t.nav.calendar,
  };

  // 01·02·03 활용 흐름 카드 (클릭 시 해당 페이지로)
  const usageSteps = [
    { num: '01', icon: <Newspaper className="w-5 h-5" />, title: t.home.usage1Title, desc: t.home.usage1Desc, page: 'news' as PageId, color: 'text-sky-400' },
    { num: '02', icon: <Crown className="w-5 h-5" />, title: t.home.usage2Title, desc: t.home.usage2Desc, page: 'gurus' as PageId, color: 'text-rose-400' },
    { num: '03', icon: <LineChart className="w-5 h-5" />, title: t.home.usage3Title, desc: t.home.usage3Desc, page: 'macro' as PageId, color: 'text-amber-400' },
  ];

  const tips = [
    { title: t.home.tip1Title, desc: t.home.tip1Desc, hint: t.glossary.drip },
    { title: t.home.tip2Title, desc: t.home.tip2Desc, hint: undefined },
    { title: t.home.tip3Title, desc: t.home.tip3Desc, hint: t.glossary.thirteenF },
  ];

  return (
    <div className="flex flex-col gap-16 pb-8">

      {/* ── Hero (정체성 0.5초 전달: eyebrow + 슬로건 + 설명 + CTA 2개) ─── */}
      <Reveal>
        <section className="text-center pt-2 md:pt-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cb-border bg-cb-surface/60 text-xs font-semibold text-cb-accent">
            <Sparkles className="w-3.5 h-3.5" />
            {t.home.heroEyebrow}
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-brand font-extrabold tracking-tight text-cb-foreground leading-snug whitespace-pre-line">
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-cb-muted text-base md:text-lg leading-relaxed">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={PATH_OF.gurus}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors"
            >
              {t.home.heroCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={PATH_OF.news}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-cb-border text-cb-foreground text-sm font-bold hover:border-cb-accent/40 hover:text-cb-accent transition-colors"
            >
              {t.nav.news}
            </Link>
          </div>

          {/* 신뢰 배지 (CTA 바로 아래로 끌어올림) */}
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cb-border bg-cb-surface/50 text-xs md:text-sm text-cb-muted font-medium"
              >
                <span className="text-cb-accent">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* 기능 칩 (이 사이트로 뭘 할 수 있는지) */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {chips.map((id) => (
              <Link
                key={id}
                href={PATH_OF[id]}
                className="px-3 py-1 rounded-full text-xs font-semibold text-cb-muted bg-[var(--cb-hover)] hover:text-cb-accent transition-colors"
              >
                {chipLabel[id]}
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Quote of the Day (뉴스보다 위) ───────────────────── */}
      <Reveal>
        <QuoteOfDay />
      </Reveal>

      {/* ── Market News Preview ──────────────────────────── */}
      <Reveal>
        <MarketNewsPreview />
      </Reveal>

      {/* ── 이렇게 활용하세요 (01·02·03 흐름 카드) ───────────── */}
      <Reveal>
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{t.home.usageTitle}</h3>
            <p className="text-cb-muted">{t.home.usageSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {usageSteps.map((step) => (
              <Link
                key={step.num}
                href={PATH_OF[step.page]}
                className="group glass-panel p-6 text-left flex flex-col gap-3 hover:border-cb-accent/35 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-cb-muted/25 tabular-nums leading-none">{step.num}</span>
                  <span className={`${step.color}`}>{step.icon}</span>
                </div>
                <h4 className="font-bold text-cb-foreground">{step.title}</h4>
                <p className="text-sm text-cb-muted leading-relaxed">{step.desc}</p>
                <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-cb-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  {CARD_CTA.goto[lang]} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Tool Cards ───────────────────────────────────── */}
      <Reveal>
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-cb-foreground mb-2">{t.home.toolsTitle}</h3>
            <p className="text-cb-muted">{t.home.toolsSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool, i) => (
              <Link
                key={i}
                href={PATH_OF[tool.id]}
                className="group glass-panel p-6 flex flex-col gap-4 text-left hover:border-cb-accent/35 hover:shadow-[0_8px_32px_-8px_rgba(127,127,135,0.22)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  {tool.icon}
                </div>
                <div>
                  <h4 className="font-bold text-cb-foreground mb-1.5 group-hover:text-cb-accent transition-colors">
                    {toolLabels[i].title}
                  </h4>
                  <p className="text-sm text-cb-muted leading-relaxed">{toolLabels[i].desc}</p>
                </div>
                <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {CARD_CTA.start[lang]} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Financial Tips ────────────────────────────────── */}
      <Reveal>
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
      </Reveal>

      {/* ── Closing CTA (스크롤 끝 행동 전환) ─────────────────── */}
      <Reveal>
        <section className="rounded-2xl border border-cb-point/25 bg-gradient-to-br from-cb-point/12 to-cb-accent/5 px-6 py-12 md:py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-brand font-extrabold tracking-tight text-cb-foreground">
            {t.home.closingTitle}
          </h3>
          <p className="mt-3 max-w-xl mx-auto text-cb-muted">{t.home.closingDesc}</p>
          <Link
            href={PATH_OF.gurus}
            className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors"
          >
            {t.home.heroCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </Reveal>
    </div>
  );
};

export default HomePage;
