import { EnhancedPost } from "../../lib/types";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";

interface ArticleSpotlightProps {
  title: string;
  posts: EnhancedPost[];
  maxArticles?: number;
}

export default function ArticleSpotlight({ title, posts, maxArticles = 5 }: ArticleSpotlightProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(maxArticles)));
  return <FourArticleGrid posts={articles} categoryName={title}
    numberOfRows={Math.ceil(articles.length / 4)} className="width-constrained" />;
}
