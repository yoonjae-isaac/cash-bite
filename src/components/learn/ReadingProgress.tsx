'use client';

import { useEffect, useState } from 'react';

/** 글 상단 읽기 진행 바 — 스크롤 비율. */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[3px] bg-cb-point z-[100] transition-[width] duration-100 motion-reduce:transition-none"
      style={{ width: `${pct}%` }}
      aria-hidden
    />
  );
}
