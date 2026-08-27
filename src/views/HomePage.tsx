'use client';

import { Newspaper, Crown, LineChart, BarChart3, CalendarDays, ArrowRight, Lock, Zap, CreditCard, Smartphone, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { PATH_OF } from '../application/routing/pages';
import type { PageId } from '../domain/i18n/types';
import QuoteOfDay from '../components/home/QuoteOfDay';
import UpdatesStrip from '../components/home/UpdatesStrip';
import ArkPreview from '../components/home/ArkPreview';
import ConsensusPreview from '../components/home/ConsensusPreview';
import TopInvestorsPreview from '../components/home/TopInvestorsPreview';
import EarningsPreview from '../components/home/EarningsPreview';
import MacroPreview from '../components/home/MacroPreview';
import MarketNewsPreview from '../components/news/MarketNewsPreview';
import InfoHint from '../components/ui/InfoHint';
import Reveal from '../components/ui/Reveal';
import type { HomeData } from '../domain/home/types';

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

const HomePage = ({ home }: { home?: HomeData }) => {
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

  const tips = [
    { title: t.home.tip1Title, desc: t.home.tip1Desc, hint: t.glossary.drip },
    { title: t.home.tip2Title, desc: t.home.tip2Desc, hint: undefined },
    { title: t.home.tip3Title, desc: t.home.tip3Desc, hint: t.glossary.thirteenF },
  ];

  return (
    <div className="flex flex-col gap-16 pb-8">

      {/* ── 주린이 온보딩 진입 배너 (국내 전용 — ko 에서만).
              레이아웃의 증시 일정 배너 바로 아래가 되도록 홈 최상단에 둔다. ─── */}
      {lang === 'ko' && (
        <Reveal className="-mb-10">
          <Link
            href="/onboarding"
            className="group flex items-center gap-4 rounded-2xl border border-cb-point/30 bg-gradient-to-br from-cb-point/12 to-cb-accent/5 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cb-point/50 md:px-7"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cb-point text-xl text-cb-on-point">
              💡
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-xs font-bold text-cb-point">주식 처음이세요?</div>
              <h3 className="text-base font-extrabold tracking-tight text-cb-foreground md:text-lg">
                주린이 온보딩 — 왜 투자하나부터 첫 매수까지
              </h3>
              <p className="mt-0.5 hidden text-sm text-cb-muted sm:block">
                증권계좌·세금·ISA·용어까지 순서대로. 6단계면 혼자 시작할 수 있어요.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-cb-point">
              <span className="hidden sm:inline">시작하기</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      )}

      {/* ── Hero — 좌: 정체성/CTA, 우: 지금 들어와 있는 데이터 피드.
              첫 화면을 카피로만 채우지 않고 실데이터 진입점을 나란히 둔다. ─── */}
      <Reveal>
        <section className="grid items-start gap-5 pt-1 md:pt-3 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cb-border bg-cb-surface/60 px-3 py-1 text-xs font-semibold text-cb-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {t.home.heroEyebrow}
            </span>
            <h1 className="mt-3.5 whitespace-pre-line font-brand text-2xl font-extrabold leading-snug tracking-tight text-cb-foreground md:text-4xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cb-muted md:text-base">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                href={PATH_OF.gurus}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cb-point px-5 py-2.5 text-sm font-bold text-cb-on-point transition-colors hover:bg-cb-point-hover"
              >
                {t.home.heroCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={PATH_OF.news}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cb-border px-5 py-2.5 text-sm font-bold text-cb-foreground transition-colors hover:border-cb-accent/40 hover:text-cb-accent"
              >
                {t.nav.news}
              </Link>
            </div>

            {/* 신뢰 배지 — 히어로가 커지지 않도록 한 줄로 압축 */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {trustItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-cb-muted">
                  <span className="text-cb-accent">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {home && <UpdatesStrip data={home} />}
        </section>
      </Reveal>

      {/* ── ARK 일별 매매 — 유일하게 매일 공개되는 거장 데이터라 분기 집계보다 위에 둔다 ─── */}
      {home?.ark && (
        <Reveal>
          <ArkPreview
            tradeDate={home.ark.tradeDate}
            buyCount={home.ark.buyCount}
            sellCount={home.ark.sellCount}
            trades={home.ark.trades}
            logos={home.logos}
          />
        </Reveal>
      )}

      {/* ── 거장 데이터 (컨센서스 · 운용자산 상위) ───────────────── */}
      {(home?.consensus || home?.guru) && (
        <Reveal>
          {/* items-start — 카드마다 항목 수·행 높이가 달라 늘려 맞추면 아래가 빈다. */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {home.consensus && (
              <ConsensusPreview
                stocks={home.consensus.stocks}
                asOf={home.consensus.asOf}
                logos={home.logos}
              />
            )}
            {home.guru && (
              <TopInvestorsPreview
                investors={home.guru.topInvestors}
                investorCount={home.guru.investorCount}
              />
            )}
          </div>
        </Reveal>
      )}

      {/* ── Quote of the Day (뉴스보다 위) ───────────────────── */}
      <Reveal>
        <QuoteOfDay />
      </Reveal>

      {/* ── Market News Preview ──────────────────────────── */}
      <Reveal>
        <MarketNewsPreview />
      </Reveal>

      {/* ── 이번 주 일정 · 거시지표 ──────────────────────────── */}
      {(home?.earnings || home?.macro) && (
        <Reveal>
          {/* items-start — 카드마다 항목 수·행 높이가 달라 늘려 맞추면 아래가 빈다. */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {home.earnings && (
              <EarningsPreview
                items={home.earnings.items}
                total={home.earnings.total}
                guruHeldTotal={home.earnings.guruHeldTotal}
                guruSymbols={home.guruSymbols}
                logos={home.logos}
              />
            )}
            {home.macro && <MacroPreview rows={home.macro} />}
          </div>
        </Reveal>
      )}

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
