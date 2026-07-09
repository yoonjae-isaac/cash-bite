import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// 로케일 인지 네비게이션 — Link/useRouter 가 현재 로케일을 자동 프리픽스, usePathname 은 로케일 제거된 경로 반환.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
