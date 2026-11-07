import { EnhancedPost } from "../../lib/types";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";

const COLUMNS = 4;

interface ArticleSpotlightProps {
  title: string;
  posts: EnhancedPost[];
  maxArticles?: number;
}

export default function ArticleSpotlight({ title, posts, maxArticles = 4 }: ArticleSpotlightProps) {
  const capped = (posts || []).slice(0, Math.max(0, Math.floor(maxArticles)));
  const articles =
    capped.length <= COLUMNS
      ? capped
      : capped.slice(0, Math.floor(capped.length / COLUMNS) * COLUMNS);

  return (
    <FourArticleGrid
      posts={articles}
      categoryName={title}
      numberOfRows={Math.max(1, Math.ceil(articles.length / COLUMNS))}
      className="width-constrained"
    />
  );
}
