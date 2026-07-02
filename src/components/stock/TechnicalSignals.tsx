import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import InfoHint from '../ui/InfoHint';
import type { TechnicalSignals as Signals } from '../../domain/market/types';

type Tone = 'pos' | 'neg' | 'neu';

const toneStyle = (tone: Tone): { color: string; background: string } => {
  if (tone === 'pos')
    return { color: 'var(--cb-positive)', background: 'color-mix(in srgb, var(--cb-positive) 15%, transparent)' };
  if (tone === 'neg')
    return { color: 'var(--cb-negative)', background: 'color-mix(in srgb, var(--cb-negative) 15%, transparent)' };
  return { color: 'var(--cb-muted)', background: 'var(--cb-hover)' };
};

const Pill = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => (
  <span
    className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0"
    style={toneStyle(tone)}
  >
    {children}
  </span>
);

const SigCard = ({
  label,
  hint,
  note,
  children,
}: {
  label: string;
  hint: string;
  note: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-cb-border p-4 bg-[var(--cb-input-bg)]">
    <p className="text-[11.5px] text-cb-muted mb-2.5 flex items-center gap-1.5">
      {label}
      <InfoHint label={label} content={hint} />
    </p>
    <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">{children}</div>
    <p className="text-[11.5px] text-cb-muted mt-2 leading-snug">{note}</p>
  </div>
);

const TechnicalSignals = ({
  signals,
  disparity20,
  disparity60,
}: {
  signals: Signals;
  disparity20: number | null;
  disparity60: number | null;
}) => {
  const t = useLanguageStore((s) => s.t);
  const tt = t.stock.tech;

  const align =
    signals.alignment === 'bullish'
      ? { tone: 'pos' as Tone, text: tt.alignBullish, note: tt.alignBullishNote }
      : signals.alignment === 'bearish'
        ? { tone: 'neg' as Tone, text: tt.alignBearish, note: tt.alignBearishNote }
        : { tone: 'neu' as Tone, text: tt.alignMixed, note: tt.alignMixedNote };

  const cross =
    signals.cross === 'golden'
      ? { tone: 'pos' as Tone, text: tt.crossGolden, note: tt.crossGoldenNote }
      : signals.cross === 'dead'
        ? { tone: 'neg' as Tone, text: tt.crossDead, note: tt.crossDeadNote }
        : { tone: 'neu' as Tone, text: tt.crossNone, note: tt.crossNoneNote };

  // 이격도 밴드 A — ≥110 과열(주의), ≤90 과매도(반등 여지), 그 사이 중립.
  const dispState = (d: number | null): { tone: Tone; text: string } => {
    if (d == null) return { tone: 'neu', text: tt.disparityNeutral };
    if (d >= 110) return { tone: 'neg', text: tt.disparityOverheated };
    if (d <= 90) return { tone: 'pos', text: tt.disparityOversold };
    return { tone: 'neu', text: tt.disparityNeutral };
  };
  const disparities = [
    { unit: 20, d: disparity20 },
    { unit: 60, d: disparity60 },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SigCard label={tt.alignLabel} hint={tt.alignHint} note={align.note}>
          <Pill tone={align.tone}>{align.text}</Pill>
        </SigCard>

        <SigCard label={tt.crossLabel} hint={tt.crossHint} note={cross.note}>
          <Pill tone={cross.tone}>{cross.text}</Pill>
        </SigCard>

        <SigCard label={tt.posLabel} hint={tt.posHint} note={tt.posNote}>
          <div className="w-full flex flex-col gap-2">
            {disparities.map(({ unit, d }) => {
              const s = dispState(d);
              return (
                <div key={unit} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-cb-muted">
                    {unit}
                    {tt.maUnit} {tt.disparity}{' '}
                    <b className="text-cb-foreground tabular-nums">{d == null ? '' : d.toFixed(1)}</b>
                  </span>
                  <Pill tone={s.tone}>{s.text}</Pill>
                </div>
              );
            })}
          </div>
        </SigCard>
      </div>

      <p className="text-[11.5px] text-cb-muted mt-3.5 pt-3.5 border-t border-cb-border leading-relaxed">
        {tt.disclaimer}
      </p>
    </div>
  );
};

export default TechnicalSignals;
