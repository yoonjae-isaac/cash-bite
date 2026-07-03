import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { StockAnalysis } from '../../domain/market/types';

/** 생성 대기 상태 — 스피너 + 셔머 라인. */
export const AiLoading = () => {
  const t = useLanguageStore((s) => s.t);
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-cb-muted mb-4">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-cb-border border-t-cb-point animate-spin" />
        {t.stock.ai.loading}
      </div>
      <div className="space-y-2.5">
        {[96, 88, 92, 70].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded bg-[var(--cb-hover)] animate-pulse"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 pl-4 list-disc marker:text-cb-muted/60">
    {items.map((x, i) => (
      <li key={i} className="text-[13px] text-cb-foreground leading-relaxed">
        {x}
      </li>
    ))}
  </ul>
);

const Sec = ({
  dot,
  label,
  children,
}: {
  dot: string;
  label: string;
  children: React.ReactNode;
}) => (
  <section className="mb-4">
    <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-cb-foreground mb-2">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
      {label}
    </h4>
    {children}
  </section>
);

const SubBlock = ({ label, text }: { label: string; text: string }) => (
  <div className="mb-2 last:mb-0">
    <p className="text-[11.5px] font-bold text-cb-muted mb-0.5">{label}</p>
    <p className="text-[13px] text-cb-foreground leading-relaxed">{text}</p>
  </div>
);

const AiAnalysisPanel = ({ data }: { data: StockAnalysis }) => {
  const t = useLanguageStore((s) => s.t);
  const ai = t.stock.ai;

  return (
    <div>
      {data.summary && (
        <div
          className="rounded-xl border p-3.5 mb-4"
          style={{
            borderColor: 'color-mix(in srgb, var(--cb-point) 30%, transparent)',
            background: 'color-mix(in srgb, var(--cb-point) 10%, transparent)',
          }}
        >
          <p className="text-[11px] font-extrabold text-cb-point mb-1.5 tracking-wide">
            {ai.secSummary}
          </p>
          <p className="text-[13.5px] font-semibold text-cb-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {data.plainSummary && (
        <div className="rounded-xl border border-cb-border bg-[var(--cb-input-bg)] p-3.5 mb-4">
          <p className="text-[11px] font-extrabold text-cb-muted mb-1.5 tracking-wide">
            {ai.secPlain}
          </p>
          <p className="text-[13.5px] text-cb-foreground leading-relaxed">{data.plainSummary}</p>
        </div>
      )}

      {data.technical.length > 0 && (
        <Sec dot="var(--cb-ma5)" label={ai.secTechnical}>
          <Bullets items={data.technical} />
        </Sec>
      )}

      {(data.valuation || data.annual || data.quarterly) && (
        <Sec dot="var(--cb-point)" label={ai.secFundamental}>
          {data.valuation && <SubBlock label={ai.subValuation} text={data.valuation} />}
          {data.annual && <SubBlock label={ai.subAnnual} text={data.annual} />}
          {data.quarterly && <SubBlock label={ai.subQuarterly} text={data.quarterly} />}
        </Sec>
      )}

      {data.checkpoints.length > 0 && (
        <Sec dot="var(--cb-ma60)" label={ai.secCheckpoints}>
          <Bullets items={data.checkpoints} />
        </Sec>
      )}

      {data.disclaimer && (
        <p className="text-[11.5px] text-cb-muted border-t border-cb-border pt-3 mt-4 leading-relaxed">
          {data.disclaimer}
        </p>
      )}
    </div>
  );
};

export default AiAnalysisPanel;
