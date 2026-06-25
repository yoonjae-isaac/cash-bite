import { useState } from 'react';
import { Compass, ArrowRight, RotateCcw, Crown } from 'lucide-react';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { usePageStore } from '../store/usePageStore';
import {
  PERSONA_QUESTIONS,
  PERSONAS,
  scorePersona,
  pickL,
  type PersonaKey,
} from '../data/personaQuiz';

const PersonaPage = () => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const navigate = usePageStore((s) => s.navigate);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<PersonaKey[]>([]);

  const total = PERSONA_QUESTIONS.length;
  const step = answers.length;
  const done = started && step >= total;
  const result = done ? PERSONAS[scorePersona(answers)] : null;

  const choose = (persona: PersonaKey) => setAnswers((a) => [...a, persona]);
  const restart = () => {
    setAnswers([]);
    setStarted(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <Compass className="w-7 h-7 text-cb-point" />
          {t.persona.title}
        </h2>
        <p className="mt-1.5 text-cb-muted">{t.persona.subtitle}</p>
      </header>

      {/* Intro */}
      {!started && (
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-cb-foreground/90 leading-relaxed mb-6">{t.persona.intro}</p>
          <button
            onClick={() => setStarted(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors"
          >
            {t.persona.start}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Question */}
      {started && !done && (
        <div className="glass-panel rounded-xl p-6 md:p-8">
          <span className="text-xs font-semibold text-cb-muted tabular-nums">
            {step + 1} / {total}
          </span>
          <div className="h-1 rounded-full bg-cb-muted/15 overflow-hidden my-4">
            <div
              className="h-full rounded-full bg-cb-point transition-all duration-300"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>

          <h3 className="text-lg md:text-xl font-bold text-cb-foreground mb-5">
            {pickL(PERSONA_QUESTIONS[step].question, lang)}
          </h3>

          <div className="flex flex-col gap-2.5">
            {PERSONA_QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.persona}
                onClick={() => choose(opt.persona)}
                className="text-left px-4 py-3 rounded-xl border border-cb-border text-sm text-cb-foreground hover:border-cb-point/50 hover:bg-[var(--cb-hover)] transition-colors"
              >
                {pickL(opt.label, lang)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-panel rounded-xl p-7 md:p-9">
          <div className="text-center">
            <span className="text-xs font-semibold text-cb-muted uppercase tracking-wider">
              {t.persona.resultTitle}
            </span>
            <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-cb-point">
              {pickL(result.name, lang)}
            </h3>
            <p className="mt-1 text-sm font-semibold text-cb-foreground">
              {pickL(result.tagline, lang)}
            </p>
            <p className="mt-4 text-sm text-cb-muted leading-relaxed max-w-lg mx-auto">
              {pickL(result.desc, lang)}
            </p>
          </div>

          <div className="mt-7">
            <p className="flex items-center gap-1.5 text-xs font-bold text-cb-muted uppercase tracking-wide mb-3">
              <Crown className="w-3.5 h-3.5 text-cb-point" />
              {t.persona.matchedGurus}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.gurus.map((g) => (
                <span
                  key={g.en}
                  className="px-3 py-1.5 rounded-lg bg-cb-point/10 text-cb-point text-sm font-semibold"
                >
                  {pickL(g, lang)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => navigate('gurus')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-cb-point text-cb-on-point text-sm font-bold hover:bg-cb-point-hover transition-colors"
            >
              {t.persona.viewGurus}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-cb-border text-sm font-semibold text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t.persona.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaPage;
