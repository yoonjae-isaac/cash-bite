/**
 * JSON-LD 구조화 데이터 주입 — 서버 컴포넌트에서 <script type="application/ld+json"> 로 렌더.
 * (클라이언트 컴포넌트 아님 — 크롤러가 SSR HTML 에서 바로 읽음)
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
