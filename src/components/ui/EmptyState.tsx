import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  className?: string;
}

/** 데이터 없음 표시 — 중앙 아이콘 + 메시지 (글래스 패널). */
const EmptyState = ({ icon, message, className = '' }: EmptyStateProps) => (
  <div
    className={[
      'glass-panel rounded-xl p-10 flex flex-col items-center gap-3 text-center',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {icon && <span className="text-cb-muted/30">{icon}</span>}
    <p className="text-sm text-cb-muted">{message}</p>
  </div>
);

export default EmptyState;
