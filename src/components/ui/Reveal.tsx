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

const ioSupported = typeof IntersectionObserver !== 'undefined';

/**
 * 스크롤 리빌 — 뷰포트 진입 시 opacity/transform 으로 1회 등장.
 * IntersectionObserver + CSS transition 조합(별도 애니메이션 라이브러리 없음).
 * 모션 최소화 선호·IO 미지원 환경에서는 즉시 노출(정적 폴백).
 */
const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  // 초기값에서 폴백 판정 → 이펙트 내 동기 setState 회피(reveal 은 observer 콜백에서만).
  const [visible, setVisible] = useState<boolean>(() => reducedMotion() || !ioSupported);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return; // 폴백으로 이미 노출됐거나 이미 등장 완료
    const el = ref.current;
    if (!el) return;
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
