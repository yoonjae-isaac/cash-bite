'use client';

import { RefreshCw } from 'lucide-react';

/**
 * 모바일 전용 새로고침 FAB — 모든 페이지 우측 하단 고정 노출.
 * 데스크톱(md+)에서는 숨김. 클릭 시 현재 페이지를 다시 로드.
 */
export default function MobileRefreshButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label="새로고침"
      className="md:hidden fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cb-border bg-cb-surface text-cb-foreground shadow-[var(--cb-shadow-elevated)] transition-transform active:scale-95"
    >
      <RefreshCw className="h-5 w-5" />
    </button>
  );
}
