import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft } from 'lucide-react';
import {
  ARTICLE_SLUGS,
  getArticle,
  getArticles,
  getArticleSeo,
  LEARN_CATEGORY_LABEL,
  LEARN_UI,
  pickL,
  readMinLabel,
  type Lang,
} from '@/domain/learn/articles';
import {
  localeMetadata,
  localePath,
  PAGE_SEO,
  SITE_URL,
  SITE_NAME,
  type Locale,
} from '@/config/site';
import JsonLd from '@/components/app/JsonLd';
import ArticleBody from '@/components/learn/ArticleBody';
import CategoryPill from '@/components/learn/CategoryPill';
import ReadingProgress from '@/components/learn/ReadingProgress';

const Dot = () => <span className="w-[3px] h-[3px] rounded-full bg-cb-muted" />;
const HOME_LABEL: Record<Locale, string> = { ko: '홈', en: 'Home', ja: 'ホーム' };
const INLANG: Record<Locale, string> = { ko: 'ko', en: 'en', ja: 'ja' };

export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const seo = getArticleSeo(slug);
  if (!seo) {
    return {};
  }
  return localeMetadata({
    locale: locale as Locale,
    path: `/learn/${slug}`,
    title: seo.title,
    description: seo.excerpt,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const lang = locale as Lang;
  const article = getArticle(slug, lang);
  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    inLanguage: INLANG[locale],
    datePublished: article.date.replace(/\./g, '-'),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${localePath(locale, `/learn/${slug}`)}`,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: HOME_LABEL[locale], item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: PAGE_SEO['/learn'].title[locale], item: `${SITE_URL}${localePath(locale, '/learn')}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}${localePath(locale, `/learn/${slug}`)}` },
    ],
  };
  const related = getArticles(lang)
    .filter((x) => x.slug !== slug && x.category === article.category)
    .slice(0, 2);
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
          <ChevronLeft className="w-3.5 h-3.5" /> {pickL(LEARN_UI.backToList, lang)}
        </Link>
        <div className="text-xs text-cb-muted/70 mb-3.5">
          <span className="text-cb-muted">{pickL(LEARN_UI.crumb, lang)}</span> › {pickL(LEARN_CATEGORY_LABEL[article.category], lang)}
        </div>
        <div>
          <CategoryPill category={article.category} lang={lang} />
        </div>
        <h1 className="text-[26px] md:text-[38px] font-extrabold tracking-tight leading-tight mt-3 mb-4 text-cb-foreground text-balance">
          {article.title}
        </h1>
        <div className="flex items-center gap-2.5 text-[13px] text-cb-muted pb-5 border-b border-cb-border mb-7">
          <span className="font-bold text-cb-foreground">{pickL(LEARN_UI.editor, lang)}</span>
          <Dot />
          {article.date}
          <Dot />
          {readMinLabel(article.readMin, lang)}
        </div>

        <ArticleBody blocks={article.body} />

        {tools.length > 0 && (
          <div className="my-8 rounded-2xl border border-cb-border bg-[var(--cb-input-bg)] p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold text-cb-muted">{pickL(LEARN_UI.relatedCalc, lang)}</div>
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
              {pickL(LEARN_UI.calcCta, lang)}
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 mt-10 mb-3.5">
              <span className="text-[13px] font-extrabold tracking-[0.06em] uppercase text-cb-muted/70">
                {pickL(LEARN_UI.readTogether, lang)}
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
                    {pickL(LEARN_CATEGORY_LABEL[r.category], lang)}
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
            {pickL(LEARN_UI.comments, lang)}
            <span className="text-[11px] font-extrabold text-cb-muted bg-[var(--cb-input-bg)] border border-cb-border rounded-full px-2 py-0.5">
              {pickL(LEARN_UI.comingSoon, lang)}
            </span>
          </h3>
          <div className="border border-dashed border-cb-border rounded-2xl p-[18px] text-center text-cb-muted text-[13.5px]">
            {pickL(LEARN_UI.commentsPlaceholder, lang)}
          </div>
        </div>
      </article>
    </>
  );
}
