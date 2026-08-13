import { Sparkles } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { splitAnalysis, toQuarterLabel, type GuruAnalysis } from '../../domain/guru/types';

/**
 * 거장 분기 리포트 / 시장 요약 본문.
 * 백엔드 프롬프트 계약상 첫 문단이 제목이며, 계약이 깨진 응답은 전체가 본문으로 렌더된다.
 */
const GuruAiReport = ({
  analysis,
  title,
  note,
}: {
  analysis: GuruAnalysis;
  title: string;
  note: string;
}) => {
  const t = useLanguageStore((s) => s.t);
  const { headline, body } = splitAnalysis(analysis.summary);
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cb-accent/15 px-2.5 py-1 text-[11px] font-bold text-cb-accent">
          <Sparkles className="h-3 w-3" />
          {title}
        </span>
        <span className="text-xs text-cb-muted">
          {t.gurus.asOfLabel} {toQuarterLabel(analysis.reportDate)}
        </span>
      </div>

      {headline && (
        <h2 className="mb-3 text-lg font-bold leading-snug text-cb-foreground md:text-xl">
          {headline}
        </h2>
      )}

      <div className="space-y-3 text-sm leading-relaxed text-cb-foreground/90">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <p className="mt-4 border-t border-cb-border pt-3 text-[11px] text-cb-muted">{note}</p>
    </section>
  );
};

export default GuruAiReport;
