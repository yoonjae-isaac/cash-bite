import { create } from 'zustand';
import type { PageId } from '../domain/i18n/types';

interface PageState {
  page: PageId;
  navigate: (page: PageId) => void;
}

export const usePageStore = create<PageState>()((set) => ({
  page: 'home',
  navigate: (page) => set({ page }),
}));
