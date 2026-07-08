import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ARTICLES, getArticle, LEARN_CATEGORY_LABEL } from '../../../src/domain/learn/articles';
import { pageMetadata, SITE_URL, SITE_NAME } from '../../../src/config/site';
import JsonLd from '../../../src/components/app/JsonLd';
import ArticleBody from '../../../src/components/learn/ArticleBody';
import CategoryPill from '../../../src/components/learn/CategoryPill';
import ReadingProgress from '../../../src/components/learn/ReadingProgress';

const Dot = () => <span className="w-[3px] h-[3px] rounded-full bg-cb-muted" />;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return {};
  }
  return pageMetadata({ title: article.title, description: article.excerpt, path: `/learn/${slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    inLanguage: 'ko',
    datePublished: article.date.replace(/\./g, '-'),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/learn/${slug}`,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '투자 배우기', item: `${SITE_URL}/learn` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/learn/${slug}` },
    ],
  };
  const related = ARTICLES.filter((x) => x.slug !== slug && x.category === article.category).slice(0, 2);
  const tools = article.relatedTools ?? [];

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumb} />
      <ReadingProgress />

      <article className="max-w-[720px] mx-auto">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-cb-muted hover:text-cb-foreground transition-colors mb-5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> 목록으로
        </Link>
        <div className="text-xs text-cb-muted/70 mb-3.5">
          <span className="text-cb-muted">학습</span> › {LEARN_CATEGORY_LABEL[article.category]}
        </div>
        <div>
          <CategoryPill category={article.category} />
        </div>
        <h1 className="text-[26px] md:text-[38px] font-extrabold tracking-tight leading-tight mt-3 mb-4 text-cb-foreground text-balance">
          {article.title}
        </h1>
        <div className="flex items-center gap-2.5 text-[13px] text-cb-muted pb-5 border-b border-cb-border mb-7">
          <span className="font-bold text-cb-foreground">AntsUp 에디터</span>
          <Dot />
          {article.date}
          <Dot />
          {article.readMin}분
        </div>

        <ArticleBody blocks={article.body} />

        {tools.length > 0 && (
          <div className="my-8 rounded-2xl border border-cb-border bg-[var(--cb-input-bg)] p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold text-cb-muted">관련 계산기</div>
              <div className="font-bold mt-1 text-cb-foreground">{tools[0].label}</div>
              {tools[1] && (
                <Link
                  href={`/tools/${tools[1].slug}`}
                  className="inline-block mt-1 text-xs font-semibold text-cb-point hover:underline"
                >
                  + {tools[1].label}
                </Link>
              )}
            </div>
            <Link
              href={`/tools/${tools[0].slug}`}
              className="px-4 py-2.5 rounded-lg text-[13px] font-bold bg-cb-point text-white whitespace-nowrap"
            >
              계산하기 →
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 mt-10 mb-3.5">
              <span className="text-[13px] font-extrabold tracking-[0.06em] uppercase text-cb-muted/70">
                함께 읽으면 좋아요
              </span>
              <span className="flex-1 border-t border-cb-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/learn/${r.slug}`}
                  className="border border-cb-border rounded-2xl p-4 bg-cb-surface hover:border-cb-accent/35 transition-colors"
                >
                  <div className="text-[11px] text-cb-muted/70 font-bold">
                    {LEARN_CATEGORY_LABEL[r.category]}
                  </div>
                  <div className="text-[14.5px] font-bold mt-1.5 leading-snug text-cb-foreground">
                    {r.title}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-10 pt-6 border-t border-cb-border">
          <h3 className="text-[15px] font-bold flex items-center gap-2 text-cb-foreground mb-3">
            댓글
            <span className="text-[11px] font-extrabold text-cb-muted bg-[var(--cb-input-bg)] border border-cb-border rounded-full px-2 py-0.5">
              준비 중
            </span>
          </h3>
          <div className="border border-dashed border-cb-border rounded-2xl p-[18px] text-center text-cb-muted text-[13.5px]">
            댓글 기능은 곧 열립니다. 지금은 읽기 전용이에요.
          </div>
        </div>
      </article>
    </>
  );
}
