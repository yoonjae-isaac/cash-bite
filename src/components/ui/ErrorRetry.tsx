import { RotateCcw } from 'lucide-react';

interface ErrorRetryProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  className?: string;
}

/** 에러 + 재시도 버튼 — 데이터 로딩 실패 화면 공통. */
const ErrorRetry = ({ message, retryLabel, onRetry, className = '' }: ErrorRetryProps) => (
  <div className={['glass-panel rounded-xl p-8 text-center', className].filter(Boolean).join(' ')}>
    <p className="text-cb-negative mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cb-accent text-cb-on-accent text-sm font-semibold hover:bg-cb-accent-hover transition-colors"
    >
      <RotateCcw className="w-4 h-4" />
      {retryLabel}
    </button>
  </div>
);

export default ErrorRetry;
