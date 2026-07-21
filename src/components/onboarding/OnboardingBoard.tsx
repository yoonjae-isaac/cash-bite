'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ONBOARDING, STEP_IDS, CROSSLINK_PATH } from '@/domain/onboarding/content';
import type { StepId } from '@/domain/onboarding/types';

const { meta, home, opener, journey, steps } = ONBOARDING;
const STORAGE_KEY = 'antsup-onboarding-progress-v1';
const TOTAL = STEP_IDS.length;

type Screen = 'home' | 'why' | StepId;

const CARD =
  'rounded-2xl border border-cb-border bg-cb-surface shadow-[var(--cb-shadow-elevated)]';

/* ------------------------------ 공통 조각 ------------------------------ */

function DetailHead({ kicker, onBack }: { kicker: string; onBack: () => void }) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-cb-muted transition-colors hover:text-cb-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로
      </button>
      <span className="rounded-full bg-cb-point/10 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.1em] text-cb-point">
        {kicker}
      </span>
    </div>
  );
}

function Title({ title, intro }: { title: string; intro?: string }) {
  return (
    <>
      <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-cb-foreground">{title}</h2>
      {intro && <p className="mb-5 text-[14.5px] leading-relaxed text-cb-muted">{intro}</p>}
    </>
  );
}

function Subhead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-3 mt-8">
      <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-cb-point">
        {eyebrow}
      </span>
      <h3 className="text-lg font-extrabold tracking-tight text-cb-foreground">{title}</h3>
      {desc && <p className="mt-1.5 text-[13.5px] leading-relaxed text-cb-muted">{desc}</p>}
    </div>
  );
}

function NumBlock({ n, title, body }: { n: number | string; title: string; body: string }) {
  return (
    <div className={`mb-2.5 flex gap-3 ${CARD} p-3.5`}>
      <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg bg-cb-point/10 text-[13px] font-extrabold tabular-nums text-cb-point">
        {n}
      </span>
      <div className="min-w-0">
        <h3 className="mb-1 text-[15px] font-bold text-cb-foreground">{title}</h3>
        <p className="text-[13.8px] leading-relaxed text-cb-muted">{body}</p>
      </div>
    </div>
  );
}

function PointBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className={`mb-2.5 flex gap-3 ${CARD} p-3.5`}>
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cb-point" />
      <div className="min-w-0">
        <h3 className="mb-1 text-[15px] font-bold text-cb-foreground">{title}</h3>
        <p className="text-[13.8px] leading-relaxed text-cb-muted">{body}</p>
      </div>
    </div>
  );
}

function Callout({ children, tone = 'point' }: { children: React.ReactNode; tone?: 'point' | 'warn' }) {
  const cls =
    tone === 'warn'
      ? 'bg-[var(--cb-trader-soft)] text-[var(--cb-trader)]'
      : 'bg-cb-point/10 text-cb-foreground';
  return <div className={`mt-3 rounded-2xl px-4 py-3.5 text-[13.5px] leading-relaxed ${cls}`}>{children}</div>;
}

function CrossLink({ to, label }: { to: string; label: string }) {
  const path = CROSSLINK_PATH[to];
  if (!path) return null;
  return (
    <Link
      href={path}
      className={`mt-4 flex items-center gap-2.5 ${CARD} px-4 py-3.5 transition hover:border-[var(--cb-border-strong)]`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cb-point/10 text-cb-point">↗</span>
      <span className="flex-1 text-[13.5px] font-bold text-cb-foreground">{label}</span>
      <span className="text-lg text-cb-muted">›</span>
    </Link>
  );
}

function Cta({
  id,
  done,
  onComplete,
  label,
}: {
  id: StepId;
  done: boolean;
  onComplete: (id: StepId) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onComplete(id)}
      className={[
        'mt-6 w-full rounded-2xl px-4 py-3.5 text-[15px] font-extrabold transition',
        done
          ? 'border border-cb-point bg-cb-surface text-cb-point'
          : 'bg-cb-accent text-cb-on-accent hover:bg-cb-accent-hover',
      ].join(' ')}
    >
      {done ? '✓ 완료함 · 홈으로' : label}
    </button>
  );
}

const stepKicker = (n: number) => `STEP ${String(n).padStart(2, '0')}`;

/* -------------------------------- 본체 -------------------------------- */

export default function OnboardingBoard() {
  const [screen, setScreen] = useState<Screen>('home');
  const [track, setTrack] = useState<'trader' | 'value'>('trader');
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* localStorage 접근 불가(사생활 모드 등) — 진행도 저장만 생략 */
    }
  }, []);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const complete = useCallback(
    (id: StepId) => {
      setDone((prev) => {
        const next = { ...prev, [id]: true };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* 저장 생략 */
        }
        return next;
      });
      go('home');
    },
    [go],
  );

  const doneCount = STEP_IDS.filter((id) => done[id]).length;

  return (
    <div className="mx-auto max-w-[680px]">
      {screen === 'home' && (
        <section>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-cb-point">
            {home.eyebrow}
          </p>
          <h1 className="mb-2.5 text-3xl font-extrabold leading-tight tracking-tight text-cb-foreground md:text-4xl">
            {home.title}
          </h1>
          <p className="mb-6 max-w-[52ch] text-[15px] leading-relaxed text-cb-muted">{home.subtitle}</p>

          {/* 진행도 */}
          <div className={`${CARD} mb-6 p-4`}>
            <div className="mb-2.5 flex items-baseline justify-between text-[13px]">
              <span className="font-bold text-cb-foreground">{home.progressLabel}</span>
              <span className="tabular-nums text-cb-muted">
                <b className="text-[15px] text-cb-point">{doneCount}</b>/{TOTAL} 완료
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--cb-hover)]">
              <div
                className="h-full rounded-full bg-cb-point transition-[width] duration-500"
                style={{ width: `${(doneCount / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          {/* 여는 글 */}
          <button
            type="button"
            onClick={() => go('why')}
            className="mb-6 flex w-full items-center gap-3.5 rounded-2xl border border-cb-point bg-cb-point/10 p-4 text-left transition hover:-translate-y-px"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cb-point text-xl text-white">
              💡
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[15px] font-extrabold text-cb-foreground">{opener.title}</b>
              <span className="mt-0.5 block text-[12px] text-cb-muted">{home.openerCardSubtitle}</span>
            </span>
            <span className="text-xl text-cb-point">›</span>
          </button>

          <p className="mb-3.5 text-xs font-extrabold uppercase tracking-[0.06em] text-cb-muted/70">
            {home.journeyLabel}
          </p>

          {/* 여정 */}
          <div className="relative flex flex-col gap-2.5">
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-[35px] top-6 z-0 w-px bg-cb-border"
            />
            {journey.map((item) => {
              const isDone = !!done[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`relative z-10 flex w-full items-center gap-3.5 ${CARD} p-3.5 text-left transition hover:-translate-y-px hover:border-[var(--cb-border-strong)]`}
                >
                  <span
                    className={[
                      'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[15px] font-extrabold tabular-nums',
                      isDone
                        ? 'bg-cb-accent text-cb-on-accent'
                        : 'border border-cb-border bg-cb-surface text-cb-muted',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : String(item.step).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-cb-foreground">{item.title}</span>
                    <span className="mt-0.5 block text-[12.5px] text-cb-muted">{item.subtitle}</span>
                  </span>
                  <span className="text-xl text-cb-muted">›</span>
                </button>
              );
            })}
          </div>

          <p className="mt-7 border-t border-cb-border pt-4 text-[11px] leading-relaxed text-cb-muted/70">
            {meta.disclaimer}
          </p>
        </section>
      )}

      {/* ---------------- 왜 투자? ---------------- */}
      {screen === 'why' && (
        <section>
          <DetailHead kicker={opener.kicker} onBack={() => go('home')} />
          <Title title={opener.title} intro={opener.intro} />

          {opener.blocks.map((b, i) => (
            <div key={i}>
              <NumBlock n={i + 1} title={b.heading} body={b.body} />
              {i === 1 && (
                <>
                  <div className="my-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-cb-border bg-[var(--cb-hover)] px-3 py-3.5 text-[13.5px] font-bold tabular-nums">
                    {opener.formula.parts.map((p, j) => {
                      const isResult = j === opener.formula.parts.length - 1;
                      const isOp = p === '−' || p === '=';
                      return (
                        <span
                          key={j}
                          className={
                            isResult
                              ? 'rounded-md bg-[var(--cb-trader-soft)] px-2 py-0.5 text-[var(--cb-trader)]'
                              : isOp
                                ? 'font-normal text-cb-muted'
                                : 'text-cb-foreground'
                          }
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mb-2 text-center text-[11px] text-cb-muted/70">{opener.formula.caption}</p>
                </>
              )}
              {i === 2 && (
                <div className="my-3 flex flex-col gap-2">
                  {opener.moneyLayers.map((l, k) => (
                    <div
                      key={k}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                        l.emphasis ? 'border-cb-point bg-cb-point/10' : 'border-cb-border bg-cb-surface'
                      }`}
                    >
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                          l.emphasis ? 'bg-cb-point text-white' : 'bg-[var(--cb-hover)] text-cb-muted'
                        }`}
                      >
                        {l.level}
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className={`block text-[14px] font-bold ${l.emphasis ? 'text-cb-point' : 'text-cb-foreground'}`}>
                          {l.title}
                        </b>
                        <span className="mt-0.5 block text-[12.5px] text-cb-muted">{l.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Callout>🎯 <b className="font-extrabold">핵심</b> — {opener.keyTakeaway}</Callout>

          <button
            type="button"
            onClick={() => go('home')}
            className="mt-6 w-full rounded-2xl bg-cb-accent px-4 py-3.5 text-[15px] font-extrabold text-cb-on-accent transition hover:bg-cb-accent-hover"
          >
            이해했어요 · 시작할게요
          </button>
        </section>
      )}

      {/* ---------------- STEP 1 마음가짐 ---------------- */}
      {screen === 'mindset' && (
        <section>
          <DetailHead kicker={stepKicker(steps.mindset.step)} onBack={() => go('home')} />
          <Title title={steps.mindset.title} intro={steps.mindset.intro} />

          <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-cb-border bg-cb-surface p-1.5">
            {(['trader', 'value'] as const).map((t) => {
              const active = track === t;
              const tr = steps.mindset.tracks[t];
              const activeCls =
                t === 'trader'
                  ? 'bg-[var(--cb-trader-soft)] text-[var(--cb-trader)]'
                  : 'bg-[var(--cb-value-soft)] text-[var(--cb-value)]';
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTrack(t)}
                  className={[
                    'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
                    active ? activeCls : 'text-cb-muted hover:text-cb-foreground',
                  ].join(' ')}
                >
                  {tr.label}
                  <span className="text-[10.5px] font-semibold opacity-80">{tr.tagline}</span>
                </button>
              );
            })}
          </div>

          {(() => {
            const tr = steps.mindset.tracks[track];
            const borderL = track === 'trader' ? 'border-l-[var(--cb-trader)]' : 'border-l-[var(--cb-value)]';
            const citeCls =
              track === 'trader'
                ? 'bg-[var(--cb-trader-soft)] text-[var(--cb-trader)]'
                : 'bg-[var(--cb-value-soft)] text-[var(--cb-value)]';
            return (
              <>
                <p className="mb-4 text-[14px] leading-relaxed text-cb-muted">{tr.intro}</p>
                {tr.articles.map((a, i) => (
                  <article key={i} className={`mb-3 ${CARD} border-l-4 ${borderL} p-4`}>
                    <h3 className="text-[15px] font-bold text-cb-foreground">{a.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-cb-muted">{a.body}</p>
                    {a.cite && (
                      <span className={`mt-2.5 inline-block rounded-full px-2.5 py-1 text-[11.5px] font-bold ${citeCls}`}>
                        {a.cite}
                      </span>
                    )}
                  </article>
                ))}
              </>
            );
          })()}

          <p className="mt-4 rounded-2xl border border-dashed border-cb-border px-4 py-3 text-center text-[12.5px] font-semibold text-cb-muted">
            🧭 {steps.mindset.personaHook}
          </p>

          <Cta id="mindset" done={!!done.mindset} onComplete={complete} label={steps.mindset.completeLabel} />
        </section>
      )}

      {/* ---------------- STEP 2 증권계좌 ---------------- */}
      {screen === 'account' && (
        <section>
          <DetailHead kicker={stepKicker(steps.account.step)} onBack={() => go('home')} />
          <Title title={steps.account.title} intro={steps.account.intro} />

          {steps.account.openSteps.map((s) => (
            <NumBlock key={s.n} n={s.n} title={s.title} body={s.body} />
          ))}

          <Subhead eyebrow="증권사 고르기" title="어떤 증권사로 시작할까?" desc={steps.account.brokersIntro} />
          {steps.account.brokers.map((b) => (
            <div key={b.name} className={`mb-2.5 ${CARD} p-4`}>
              <div className="text-[15px] font-extrabold text-cb-foreground">{b.name}</div>
              <p className="mb-2.5 mt-1 text-[12.5px] leading-relaxed text-cb-muted">{b.oneLiner}</p>
              <ul className="flex flex-col gap-1.5">
                {b.points.map((p, i) => (
                  <li key={i} className="relative pl-4 text-[12.5px] leading-relaxed text-cb-foreground">
                    <span className="absolute left-0.5 top-[7px] h-1 w-1 rounded-full bg-cb-point" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Subhead eyebrow="국장 vs 미장" title="세금이 이렇게 달라요" desc={steps.account.krVsUs.intro} />
          <div className="flex flex-col gap-2.5">
            {steps.account.krVsUs.rows.map((row) => (
              <div key={row.topic} className={`${CARD} p-3.5`}>
                <div className="mb-2.5 text-[13.5px] font-extrabold text-cb-foreground">{row.topic}</div>
                <div className="flex gap-2.5">
                  <span className="w-9 shrink-0 rounded-md bg-cb-foreground/10 py-0.5 text-center text-[10.5px] font-extrabold text-cb-foreground">
                    국내
                  </span>
                  <span className="flex-1 text-[12.5px] leading-relaxed text-cb-muted">{row.kr}</span>
                </div>
                <div className="mt-1.5 flex gap-2.5">
                  <span className="w-9 shrink-0 rounded-md bg-cb-point/10 py-0.5 text-center text-[10.5px] font-extrabold text-cb-point">
                    미국
                  </span>
                  <span className="flex-1 text-[12.5px] leading-relaxed text-cb-muted">{row.us}</span>
                </div>
              </div>
            ))}
          </div>
          <Callout>💡 <b className="font-extrabold">한 줄 정리</b> — {steps.account.krVsUs.takeaway}</Callout>

          <Subhead eyebrow="미국 투자" title="환전 리스크" desc={steps.account.fxRisk.heading} />
          <p className="mb-3 text-[13.8px] leading-relaxed text-cb-muted">{steps.account.fxRisk.body}</p>
          <div className={`${CARD} border-l-4 border-l-[var(--cb-trader)] p-4 text-[12.8px] leading-relaxed text-cb-muted`}>
            <b className="text-cb-foreground">예시</b> — {steps.account.fxRisk.example}
          </div>

          <Subhead eyebrow="절세" title="ISA = 세금 막아주는 '절세 우산'" />
          <div className="mb-3.5 rounded-2xl bg-cb-point/10 px-4 py-3.5 text-[13.5px] leading-relaxed text-cb-foreground">
            {steps.account.isa.analogy}
          </div>
          <p className="mb-3 text-[13.8px] leading-relaxed text-cb-muted">{steps.account.isa.whatItSaves}</p>
          <div className="mb-3 flex flex-col gap-2.5">
            {steps.account.isa.types.map((t, i) => (
              <div key={t.name} className={`${CARD} p-3.5 ${i === 1 ? 'border-cb-point' : ''}`}>
                <div className={`mb-1.5 text-[14.5px] font-extrabold ${i === 1 ? 'text-cb-point' : 'text-cb-foreground'}`}>
                  {t.name}
                </div>
                <div className="text-[13px] leading-relaxed text-cb-muted">{t.benefit}</div>
                {t.who && <span className="mt-1.5 block text-[11.5px] leading-relaxed text-cb-muted/80">{t.who}</span>}
              </div>
            ))}
          </div>
          <p className="mb-1 text-[13.8px] leading-relaxed text-cb-muted">{steps.account.isa.limits}</p>
          <Callout tone="warn">⚠️ {steps.account.isa.caution}</Callout>

          <p className="mt-5 rounded-2xl border border-dashed border-cb-border px-4 py-3 text-[11.5px] leading-relaxed text-cb-muted/80">
            세율·한도는 시점·개인 상황에 따라 달라질 수 있어요. 가입·매매 전 국세청·증권사 안내로 꼭 확인하세요.
          </p>

          <Cta id="account" done={!!done.account} onComplete={complete} label="이 단계 완료" />
        </section>
      )}

      {/* ---------------- STEP 3 용어 ---------------- */}
      {screen === 'terms' && (
        <section>
          <DetailHead kicker={stepKicker(steps.terms.step)} onBack={() => go('home')} />
          <Title title={steps.terms.title} intro={steps.terms.intro} />
          <dl className="flex flex-col gap-2.5">
            {steps.terms.items.map((it) => (
              <div key={it.term} className={`${CARD} p-3.5`}>
                <dt className="text-[14.5px] font-extrabold tracking-tight text-cb-point">{it.term}</dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-cb-muted">{it.def}</dd>
              </div>
            ))}
          </dl>
          <CrossLink to={steps.terms.crosslink.to} label={steps.terms.crosslink.label} />
          <Cta id="terms" done={!!done.terms} onComplete={complete} label="이 단계 완료" />
        </section>
      )}

      {/* ---------------- STEP 4 뭘 살까 (성향 · 개별주/ETF · 적립식) ---------------- */}
      {screen === 'buyWhat' &&
        (() => {
          const s = steps.buyWhat;
          return (
            <section>
              <DetailHead kicker={stepKicker(s.step)} onBack={() => go('home')} />
              <Title title={s.title} intro={s.intro} />

              {s.approaches.map((a) => {
                const active = a.key === 'active';
                const borderL = active ? 'border-l-[var(--cb-trader)]' : 'border-l-[var(--cb-value)]';
                const tagCls = active ? 'text-[var(--cb-trader)]' : 'text-[var(--cb-value)]';
                const dotCls = active ? 'bg-[var(--cb-trader)]' : 'bg-[var(--cb-value)]';
                return (
                  <article key={a.key} className={`mb-3 ${CARD} border-l-4 ${borderL} p-4`}>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-[15px] font-extrabold text-cb-foreground">{a.label}</h3>
                      <span className={`text-[11.5px] font-semibold ${tagCls}`}>{a.tagline}</span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-cb-muted">{a.body}</p>
                    <ul className="mt-2.5 flex flex-col gap-2">
                      {a.items.map((it, i) => (
                        <li key={i} className="relative pl-4 text-[12.8px] leading-relaxed text-cb-foreground">
                          <span className={`absolute left-0.5 top-[7px] h-1 w-1 rounded-full ${dotCls}`} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}

              <Subhead eyebrow="개별주 vs ETF" title="구체적으로 뭘 사나" />
              {s.points.map((p) => (
                <PointBlock key={p.title} title={p.title} body={p.body} />
              ))}
              {s.callout && <Callout>💡 {s.callout}</Callout>}

              <Subhead eyebrow="어떻게 사나" title={s.autoInvest.heading} />
              <p className="mb-3 text-[13.8px] leading-relaxed text-cb-muted">{s.autoInvest.body}</p>
              <div className={`${CARD} border-l-4 border-l-cb-point p-4 text-[12.8px] leading-relaxed text-cb-muted`}>
                <b className="text-cb-foreground">⏱️ 매수 주기</b> — {s.autoInvest.intervalNote}
              </div>
              <Callout tone="warn">⚠️ {s.autoInvest.caution}</Callout>

              {s.crosslink && <CrossLink to={s.crosslink.to} label={s.crosslink.label} />}
              <Cta id="buyWhat" done={!!done.buyWhat} onComplete={complete} label="이 단계 완료" />
            </section>
          );
        })()}

      {/* ---------------- STEP 6 사고 난 뒤 관리 (포인트형) ---------------- */}
      {screen === 'afterBuy' &&
        (() => {
          const s = steps.afterBuy;
          return (
            <section>
              <DetailHead kicker={stepKicker(s.step)} onBack={() => go('home')} />
              <Title title={s.title} intro={s.intro} />
              {s.points.map((p) => (
                <PointBlock key={p.title} title={p.title} body={p.body} />
              ))}
              {s.callout && <Callout>💡 {s.callout}</Callout>}
              {s.crosslink && <CrossLink to={s.crosslink.to} label={s.crosslink.label} />}
              <Cta id={s.id} done={!!done[s.id]} onComplete={complete} label="이 단계 완료" />
            </section>
          );
        })()}

      {/* ---------------- STEP 5 체크리스트 ---------------- */}
      {screen === 'checklist' && (
        <section>
          <DetailHead kicker={stepKicker(steps.checklist.step)} onBack={() => go('home')} />
          <Title title={steps.checklist.title} intro={steps.checklist.intro} />
          {steps.checklist.items.map((it) => (
            <NumBlock key={it.n} n={it.n} title={it.q} body={it.body} />
          ))}
          <Cta id="checklist" done={!!done.checklist} onComplete={complete} label="이 단계 완료" />
        </section>
      )}
    </div>
  );
}
