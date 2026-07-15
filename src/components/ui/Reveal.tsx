'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 등장 지연(ms) — 스태거용. */
  delay?: number;
}

/** 접근성: 모션 최소화 선호 시 애니메이션 없이 즉시 노출. */
const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ioSupported = (): boolean => typeof IntersectionObserver !== 'undefined';

/**
 * 스크롤 리빌 — 뷰포트 진입 시 opacity/transform 으로 1회 등장.
 * IntersectionObserver + CSS transition 조합(별도 애니메이션 라이브러리 없음).
 * 모션 최소화 선호·IO 미지원 환경에서는 즉시 노출(정적 폴백).
 *
 * SSR: 서버와 첫 클라 렌더가 항상 동일하도록 초기 visible=false 로 고정하고,
 * 폴백(모션 최소화·IO 미지원) 판정은 이펙트(클라 전용)로 옮긴다 → 하이드레이션 미스매치 방지.
 */
const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return; // 이미 등장 완료
    // 폴백: 모션 최소화 선호·IO 미지원 → 즉시 노출(모션은 CSS motion-reduce 로 억제).
    if (reducedMotion() || !ioSupported()) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // 이미 뷰포트 안이면 즉시 노출 — 탭(클라이언트) 네비게이션으로 진입 시 IO 초기 콜백이
    // 누락/지연되어 스크롤 전까지 안 보이는 문제 방지. 아래-접힘 요소만 IO 로 스크롤 노출.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={[
        'transition-all duration-700 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export default Reveal;
