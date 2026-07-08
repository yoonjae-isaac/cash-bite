import { LEARN_CATEGORY_LABEL, LEARN_CATEGORY_COLOR, type LearnCategory } from '../../domain/learn/articles';

/** 카테고리 배지 — 카테고리별 색 틴트(인라인). 서버·클라 양쪽 사용. */
export default function CategoryPill({ category }: { category: LearnCategory }) {
  const color = LEARN_CATEGORY_COLOR[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold px-2.5 py-1 rounded-full"
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {LEARN_CATEGORY_LABEL[category]}
    </span>
  );
}
