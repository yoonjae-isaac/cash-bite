import { create } from 'zustand';
import type { PageId } from '../domain/i18n/types';

// 복리·배당포트폴리오·물타기 비활성 — 라우팅 유효 페이지에서 제외 (딥링크는 home 폴백)
const VALID_PAGES: PageId[] = ['home', 'news', 'gurus', 'stock', 'macro', 'persona', 'calendar'];

function getPageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '') as PageId;
  return VALID_PAGES.includes(hash) ? hash : 'home';
}

// 최초 로드 시 해시에서 페이지를 읽어 history 상태를 설정
const initialPage = getPageFromHash();
history.replaceState({ page: initialPage }, '', '#' + initialPage);

interface PageState {
  page: PageId;
  navigate: (page: PageId) => void;
}

export const usePageStore = create<PageState>()((set) => ({
  page: initialPage,
  navigate: (page) => {
    history.pushState({ page }, '', '#' + page);
    set({ page });
  },
}));

// 브라우저 뒤로/앞으로 버튼 처리
window.addEventListener('popstate', (e) => {
  const page = (e.state?.page as PageId) ?? getPageFromHash();
  const validPage = VALID_PAGES.includes(page) ? page : 'home';
  usePageStore.setState({ page: validPage });
});
