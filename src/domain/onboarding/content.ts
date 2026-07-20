import raw from './onboarding.json';
import { L, type Loc } from '../tools/catalog';
import type { OnboardingContent, StepId } from './types';

/**
 * 주린이 온보딩 콘텐츠 — 국내 전용(한국어).
 *
 * 원본(SSOT)은 레포 루트 `/beginner-onboarding` 패키지다.
 * 이 파일 옆의 `onboarding.json`·`types.ts` 는 앱이 빌드에 소비하는 **동기화 사본**이며,
 * 콘텐츠 수정은 패키지에서 하고 `onboarding.json`(+ 필요 시 `types.ts`)만 이 위치로 복사해 맞춘다.
 * 스핀오프 시 패키지만 들어내면 되도록, 콘텐츠는 앱 컴포넌트에 하드코딩하지 않는다.
 */
export const ONBOARDING = raw as OnboardingContent;

/** 여정 단계 id 순서 (진행도 계산·라우팅에 사용). */
export const STEP_IDS: StepId[] = ONBOARDING.journey.map((j) => j.id);

/** 헤더 네비 라벨. 국내 전용이라 실제로는 ko 로케일에서만 노출된다. */
export const ONBOARDING_NAV: Loc = L('주린이 온보딩', 'Start Here', '株の始め方');
export const ONBOARDING_PATH = '/onboarding';

/** 단계 하단 크로스링크(`crosslink.to`) → 실제 앱 route 매핑. 없으면 링크 숨김. */
export const CROSSLINK_PATH: Record<string, string> = {
  'market-news': '/news',
  'stock-analysis': '/stock',
  'guru-portfolio': '/gurus',
};
