import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoHintProps {
  /** 접근성 이름 (예: "13F 설명") */
  label: string;
  /** 표시할 초보자용 설명 */
  content: string;
  className?: string;
}

/**
 * 인라인 용어 설명 — `?` 아이콘에 hover(데스크톱)·tap(모바일)으로 팝오버 노출.
 * 초보자 대상 용어(13F·Put/Call·YoY 등)에 곁들여 이탈을 줄인다.
 */
const InfoHint = ({ label, content, className = '' }: InfoHintProps) => {
  const [open, setOpen] = useState(false);
  return (
    <span className={['relative inline-flex align-middle', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center text-cb-muted/70 hover:text-cb-accent transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-1.5 w-56 max-w-[70vw] -translate-x-1/2 rounded-lg border border-cb-border bg-cb-surface p-2.5 text-left text-[11px] font-normal normal-case leading-relaxed tracking-normal text-cb-foreground shadow-xl shadow-[var(--cb-shadow-soft)] whitespace-normal"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default InfoHint;
