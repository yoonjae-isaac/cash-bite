import { Fragment, type ReactNode } from 'react';
import type { ArticleBlock } from '../../domain/learn/articles';

// **강조** 를 <strong> 로 렌더 (콘텐츠는 자체 정적 데이터 — HTML 주입 없음).
function inline(text: string): ReactNode {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-cb-foreground">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** 학습 글 본문 — 구조화 블록을 가독성 있는 프로즈로 렌더(서버 컴포넌트, 풀 SSR). */
export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="text-[17px] leading-[1.85] text-cb-foreground">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'lead':
            return (
              <p key={i} className="text-[19px] leading-[1.75] font-medium mb-7">
                {inline(b.text)}
              </p>
            );
          case 'h2':
            return (
              <h2 key={i} className="text-[22px] font-extrabold tracking-tight mt-10 mb-3 text-cb-foreground">
                {inline(b.text)}
              </h2>
            );
          case 'p':
            return (
              <p key={i} className="mb-[18px] text-cb-foreground/90">
                {inline(b.text)}
              </p>
            );
          case 'callout':
            return (
              <div
                key={i}
                className="my-6 border-l-[3px] border-cb-point bg-cb-point/10 rounded-r-xl px-[18px] py-4 text-[15.5px] leading-relaxed text-cb-foreground/90"
              >
                {inline(b.text)}
              </div>
            );
          case 'ul':
            return (
              <ul key={i} className="mb-[18px] flex flex-col gap-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="relative pl-5 text-cb-foreground/90">
                    <span className="absolute left-0.5 top-[11px] w-1.5 h-1.5 rounded-full bg-cb-point" />
                    {inline(it)}
                  </li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
