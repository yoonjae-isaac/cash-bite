interface SkeletonProps {
  className?: string;
}

/** 펄스 스켈레톤 박스 — 콘텐츠 형태(라인/카드)에 맞춰 크기를 className 으로 조합해 사용. */
const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div
    className={['animate-pulse rounded bg-cb-muted/15', className].filter(Boolean).join(' ')}
    aria-hidden
  />
);

export default Skeleton;
