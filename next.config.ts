import type { NextConfig } from 'next';

// 프론트만 이전 — 백엔드(NestJS/Railway)는 무변경. API 는 클라이언트에서 직접 호출.
// 이미지: 기존과 동일하게 순수 <img> 사용(next/image 미도입) → images 설정 불필요.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
