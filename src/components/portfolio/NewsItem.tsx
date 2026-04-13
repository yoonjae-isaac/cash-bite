
import type { NewsArticle } from '../../domain/portfolio/detailTypes';
import { useHeadlineTranslation } from '../../application/translation/useHeadlineTranslation';

interface Props {
  article: NewsArticle;
}

const NewsItem = ({ article }: Props) => {
  const { text, isTranslating } = useHeadlineTranslation(article.headline, article.id);

  const date = new Date(article.datetime * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border-b border-cb-border last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-semibold text-cb-muted uppercase tracking-wide">
          {article.source}
        </span>
        <span className="text-[10px] text-cb-muted/60">·</span>
        <span className="text-[10px] text-cb-muted/60">{date}</span>
      </div>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs text-cb-foreground font-medium leading-snug hover:text-cb-accent transition-colors line-clamp-2 ${
          isTranslating ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {text}
      </a>
    </div>
  );
};

export default NewsItem;
