'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cashbite-consent';

type Gtag = (...args: unknown[]) => void;

// Google consent mode v2 업데이트 — layout 의 기본값(denied) 스크립트에서 정의한 window.gtag 사용.
function updateConsent(granted: boolean): void {
  const w = window as unknown as { gtag?: Gtag };
  if (typeof w.gtag !== 'function') return;
  const v = granted ? 'granted' : 'denied';
  w.gtag('consent', 'update', {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
}

/**
 * 쿠키·광고 동의 배너(경량 CMP) — 최초 방문 시 노출. 선택은 localStorage 에 저장하고
 * consent mode 로 전달(재방문 시 저장값 자동 적용). AdSense·GA 정책 요건 대비.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    if (stored === 'granted') {
      updateConsent(true);
      return;
    }
    if (stored === 'denied') {
      updateConsent(false);
      return;
    }
    setVisible(true);
  }, []);

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    } catch {
      /* ignore */
    }
    updateConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 md:p-4">
      <div className="w-full max-w-[1280px] mx-auto glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="flex-1 text-xs md:text-sm text-cb-muted leading-relaxed">
          이 사이트는 방문 분석과 광고를 위해 쿠키를 사용합니다. 자세한 내용은{' '}
          <Link href="/privacy" className="text-cb-accent hover:underline">
            개인정보처리방침
          </Link>
          을 참고하세요.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-cb-border text-cb-muted hover:text-cb-foreground transition-colors"
          >
            거부
          </button>
          <button
            onClick={() => choose(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cb-accent text-cb-on-accent hover:bg-cb-accent-hover transition-colors"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
