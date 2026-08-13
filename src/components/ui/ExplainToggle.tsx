'use client';

import { useId, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

/**
 * 데이터 옆에 붙는 인라인 설명 토글 — "이 숫자, 어떻게 읽나요?".
 * InfoHint(짧은 용어 팝오버)와 달리 문단 길이의 맥락을 접었다 펴는 용도.
 */
const ExplainToggle = ({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-cb-muted hover:text-cb-foreground transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="mt-2 rounded-lg border border-cb-border bg-[var(--cb-row-bg)] p-3 text-xs leading-relaxed text-cb-muted"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default ExplainToggle;
