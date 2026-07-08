'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ARTICLES,
  LEARN_CATEGORIES,
  LEARN_CATEGORY_LABEL,
  type LearnCategory,
} from '../../domain/learn/articles';
import CategoryPill from './CategoryPill';

const Dot = () => <span className="w-[3px] h-[3px] rounded-full bg-current opacity-60" />;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors',
        active
          ? 'bg-cb-accent text-cb-on-accent border-cb-accent'
          : 'bg-cb-surface text-cb-muted border-cb-border hover:text-cb-foreground hover:border-cb-accent/40',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/** 학습 게시판 목록 — 카테고리 필터 + featured + 카드 그리드. 표시 전용(카드 클릭 → 상세 route). */
export default function LearnBoard() {
  const [filter, setFilter] = useState<'all' | LearnCategory>('all');
  const featured = ARTICLES.find((a) => a.featured);
  const rest = ARTICLES.filter((a) => a !== featured);
  const show = (cat: LearnCategory) => filter === 'all' || cat === filter;

  return (
    <div className="max-w-[1040px] mx-auto">
      <div className="text-xs font-extrabold tracking-[0.12em] uppercase text-cb-point">Learn</div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2.5 mb-2 text-cb-foreground">
        투자, 하나씩 배우기
      </h1>
      <p className="text-cb-muted text-base max-w-[56ch] leading-relaxed">
        주식이 처음이라도 괜찮아요. 개념 하나, 원칙 하나씩 짧고 쉽게. 읽고 나면 바로 계산기로 연습해 보세요.
      </p>

      <div className="flex flex-wrap gap-2 my-6">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          전체
        </Chip>
        {LEARN_CATEGORIES.map((c) => (
          <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {LEARN_CATEGORY_LABEL[c]}
          </Chip>
        ))}
      </div>

      {featured && show(featured.category) && (
        <Link
          href={`/learn/${featured.slug}`}
          className="group grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] rounded-[22px] overflow-hidden border border-cb-border bg-cb-surface hover:-translate-y-0.5 transition-all duration-300 shadow-[var(--cb-shadow-elevated)]"
        >
          <div className="p-7 flex flex-col gap-3.5 order-2 md:order-1">
            <div>
              <CategoryPill category={featured.category} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight leading-snug text-cb-foreground group-hover:text-cb-accent transition-colors">
              {featured.title}
            </h2>
            <p className="text-cb-muted text-[15px] leading-relaxed">{featured.excerpt}</p>
            <div className="mt-auto flex items-center gap-2.5 text-xs text-cb-muted">
              <span className="font-bold text-cb-foreground/80">AntsUp 에디터</span>
              <Dot />
              {featured.readMin}분
              <Dot />
              {featured.date}
            </div>
          </div>
          <div
            className="min-h-[180px] flex items-center justify-center order-1 md:order-2"
            style={{
              background:
                'radial-gradient(120% 120% at 80% 10%, color-mix(in srgb, var(--cb-point) 30%, transparent), transparent 60%), linear-gradient(150deg, var(--cb-bg), var(--cb-surface))',
            }}
          >
            <div className="text-[72px] font-brand font-extrabold tracking-tighter leading-none">
              <span className="text-cb-foreground">Ants</span>
              <span className="text-cb-point">Up</span>
            </div>
          </div>
        </Link>
      )}

      <div className="flex items-center gap-2.5 mt-10 mb-3.5">
        <span className="text-[13px] font-extrabold tracking-[0.06em] uppercase text-cb-muted/70">최신 글</span>
        <span className="flex-1 border-t border-cb-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rest.filter((a) => show(a.category)).map((a) => (
          <Link
            key={a.slug}
            href={`/learn/${a.slug}`}
            className="group glass-panel p-5 flex flex-col gap-2.5 min-h-[172px] hover:-translate-y-0.5 hover:border-cb-accent/35 transition-all duration-300"
          >
            <div>
              <CategoryPill category={a.category} />
            </div>
            <h3 className="text-[17px] font-bold leading-snug text-cb-foreground group-hover:text-cb-accent transition-colors">
              {a.title}
            </h3>
            <p className="text-cb-muted text-[13.5px] leading-relaxed line-clamp-2">{a.excerpt}</p>
            <div className="mt-auto flex items-center gap-2.5 text-xs text-cb-muted">
              <span>{a.readMin}분</span>
              <Dot />
              <span>{a.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
