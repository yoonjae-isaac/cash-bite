import type { ElementType } from 'react';

/**
 * AntsUp 텍스트 워드마크 — Bricolage Grotesque 800(ExtraBold).
 * 'Ants' = 기본 텍스트색(--cb-foreground, 테마 대응) · 'Up' = 상승 방향색(--cb-wordmark-up).
 * 'Up' 색은 상하락 토글과 연동: 기본(상승=파랑) #378ADD, swap(상승=빨강) 시 앱의 하락→상승 빨강.
 */
export default function Wordmark({
  as: Tag = 'span',
  className = '',
}: {
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag
      className={[
        'font-wordmark font-extrabold tracking-tight leading-none text-cb-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      Ants<span className="text-cb-wordmark-up">Up</span>
    </Tag>
  );
}
