'use client';

import { useState } from 'react';

const SIZE = { sm: 'h-7 w-7 text-[10px]', md: 'h-10 w-10 text-xs' } as const;

/**
 * 종목 로고 — 목록에서 티커를 눈으로 빠르게 구분하기 위한 표식.
 *
 * 로고는 외부 CDN(Finnhub) 이미지라 없거나 깨질 수 있어, 실패하면 티커 앞 글자 배지로 대체한다.
 * next/image 대신 <img> 를 쓰는 이유: 원격 호스트를 remotePatterns 에 고정하지 않기 위해서다
 * (제공자가 바뀌어도 설정 변경 없이 동작).
 */
const TickerLogo = ({
  symbol,
  src,
  size = 'md',
}: {
  symbol: string;
  src?: string;
  size?: keyof typeof SIZE;
}) => {
  const [failed, setFailed] = useState(false);
  const box = `${SIZE[size]} shrink-0 rounded-md`;

  if (!src || failed) {
    // 라틴 문자는 2글자(AAPL→AA), 한글·일본어는 1글자가 읽기 좋다.
    const head = /^[A-Za-z]/.test(symbol) ? symbol.slice(0, 2).toUpperCase() : symbol.slice(0, 1);
    return (
      <span
        className={`${box} grid place-items-center bg-cb-accent/12 font-bold text-cb-accent`}
        aria-hidden
      >
        {head}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${box} bg-white/90 object-contain p-1`}
    />
  );
};

export default TickerLogo;
