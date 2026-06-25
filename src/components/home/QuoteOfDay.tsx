import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { investorQuotes } from '../../data/investorQuotes';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { Language } from '../../domain/i18n/types';

function getDailyIndex(): number {
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return daysSinceEpoch % investorQuotes.length;
}

const LEN = investorQuotes.length;

function pickText(lang: Language, ko: string, en: string, ja: string) {
  if (lang === 'ko') return ko;
  if (lang === 'ja') return ja;
  return en;
}

const QuoteOfDay = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const [index, setIndex] = useState(getDailyIndex);
  const [visible, setVisible] = useState(true);

  const q = investorQuotes[index];

  const text = pickText(lang, q.ko, q.en, q.ja);
  const author = pickText(lang, q.authorKo, q.author, q.authorJa);
  const role = pickText(lang, q.roleKo, q.role, q.roleJa);

  const animateBy = useCallback((delta: number) => {
    setVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + delta + LEN) % LEN);
      setVisible(true);
    }, 220);
  }, []);

  return (
    <section className="relative overflow-hidden glass-panel p-7 md:p-9 border-cb-accent/20">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-cb-accent/6 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-cb-positive/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cb-accent/15 text-cb-accent">
              <Quote className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-cb-accent uppercase tracking-widest">
              {t.quote.sectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => animateBy(-1)}
              aria-label={t.quote.prev}
              title={t.quote.prev}
              className="p-1.5 rounded-lg border border-cb-border text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => animateBy(1)}
              aria-label={t.quote.next}
              title={t.quote.next}
              className="p-1.5 rounded-lg border border-cb-border text-cb-muted hover:text-cb-accent hover:border-cb-accent/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quote */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {/* Decorative open-quote mark */}
          <span
            aria-hidden
            className="block text-[72px] leading-none text-cb-accent/20 font-serif select-none -mb-5 -mt-2"
          >
            &#8220;
          </span>

          <blockquote className="text-lg md:text-xl font-semibold text-cb-foreground leading-relaxed mb-6 pl-1">
            {text}
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-3 pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cb-accent/30 to-zinc-600/35 border border-cb-accent/25 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-cb-accent select-none">
                {author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-cb-foreground">{author}</p>
              <p className="text-xs text-cb-muted">{role}</p>
            </div>

            {/* Quote index pill */}
            <div className="ml-auto px-2 py-0.5 rounded-full bg-cb-muted/10 text-cb-muted text-[10px] font-mono tabular-nums">
              {index + 1} / {investorQuotes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom progress bar — 현재 위치((index+1)/전체) 비례, 이전/다음마다 이동 */}
      <div className="relative z-10 mt-6 h-1 rounded-full bg-cb-muted/15 overflow-hidden" aria-hidden>
        <div
          className="h-full rounded-full bg-cb-accent transition-all duration-300"
          style={{ width: `${((index + 1) / LEN) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default QuoteOfDay;
