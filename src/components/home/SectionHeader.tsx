import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/** 홈 데이터 섹션 공통 헤더 — 제목 + 한 줄 설명 + 해당 페이지로 보내는 링크. */
const SectionHeader = ({
  icon,
  title,
  desc,
  href,
  linkLabel,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  href: string;
  linkLabel: string;
  meta?: string;
}) => (
  <div className="mb-3 flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-base font-bold text-cb-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-cb-accent">{icon}</span>
          {title}
        </span>
        {meta && <span className="text-[11px] font-medium text-cb-muted">{meta}</span>}
      </h3>
      {desc && <p className="mt-0.5 truncate text-xs text-cb-muted">{desc}</p>}
    </div>
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-cb-accent transition-colors hover:text-cb-accent-hover"
    >
      {linkLabel}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

export default SectionHeader;
