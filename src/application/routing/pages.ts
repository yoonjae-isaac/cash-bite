import type { PageId } from '../../domain/i18n/types';

/**
 * PageId → 실제 경로 매핑. 해시 라우팅(usePageStore) 제거 후 Next 파일 라우팅과 <Link> 에서 사용.
 * 숨김 유틸(portfolio·compound·averaging)은 라우트 미생성이지만 라벨/타입 호환을 위해 매핑은 유지.
 */
export const PATH_OF: Record<PageId, string> = {
  home: '/',
  portfolio: '/portfolio',
  compound: '/compound',
  averaging: '/averaging',
  news: '/news',
  gurus: '/gurus',
  consensus: '/consensus',
  macro: '/macro',
  stock: '/stock',
  persona: '/persona',
  calendar: '/calendar',
};
