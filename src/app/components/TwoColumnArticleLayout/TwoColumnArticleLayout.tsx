import { EnhancedPost } from "../../lib/types";
import { ArticleCard } from "../shared";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import "./TwoColumnArticleLayout.css";

export interface TwoColumnArticleLayoutProps {
  leftColumnTitle?: string;
  leftColumnArticles: EnhancedPost[];
  rightColumnTitle?: string;
  rightColumnArticles: EnhancedPost[];
  className?: string;
  showMainArticle?: boolean;
  fallbackArticles?: EnhancedPost[];
}

export default function TwoColumnArticleLayout({ leftColumnTitle, leftColumnArticles, rightColumnTitle,
  rightColumnArticles, className = "", showMainArticle = true, fallbackArticles = [] }: TwoColumnArticleLayoutProps) {
  const leftRaw = (leftColumnArticles || []).slice(0, 4);
  const rightRaw = (rightColumnArticles || []).slice(0, 4);
  if (!leftRaw.length && !rightRaw.length) {
    return <FourArticleGrid posts={fallbackArticles} categoryName={leftColumnTitle || rightColumnTitle}
      numberOfRows={Math.ceil(fallbackArticles.length / 4)} className={`width-constrained ${className}`} />;
  }
  if (!leftRaw.length || !rightRaw.length) {
    return <div className={`tcal-stacked-layout ${className}`}>
      {leftRaw.length > 0 && <FourArticleGrid posts={leftRaw} categoryName={leftColumnTitle} showCategoryTitle={!!leftColumnTitle} />}
      {rightRaw.length > 0 && <FourArticleGrid posts={rightRaw} categoryName={rightColumnTitle} showCategoryTitle={!!rightColumnTitle} />}
    </div>;
  }
  const pairCount = Math.min(leftRaw.length, rightRaw.length);
  const left = leftRaw.slice(0, pairCount);
  const right = rightRaw.slice(0, pairCount);
  return <section className={`two-column-article-layout section-heading-rule ${className}`}
    style={{ "--tcal-article-rows": pairCount } as React.CSSProperties}>
    {[{ title: leftColumnTitle, articles: left }, { title: rightColumnTitle, articles: right }].map((column, i) =>
      <div key={i} className="tcal-column">
        <div className="tcal-column-heading">{column.title && <h2 className="tcal-column-title">{column.title}</h2>}</div>
        <div className="tcal-column-content">
          {column.articles.map((article, index) => <ArticleCard key={article.id} article={article}
            imagePosition={showMainArticle && index === 0 ? "top" : "right"} excerptLength={200} />)}
        </div>
      </div>)}
  </section>;
}
