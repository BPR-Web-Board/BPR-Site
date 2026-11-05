import React from "react";
import { EnhancedPost } from "../../lib/types";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";

interface ArticleGridProps {
  posts: EnhancedPost[];
  categoryName?: string;
  maxArticles?: number;
}

export default function ArticleGrid({ posts, categoryName = "Articles", maxArticles = 4 }: ArticleGridProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(maxArticles)));
  return <FourArticleGrid posts={articles} categoryName={categoryName} columns={2}
    numberOfRows={Math.ceil(articles.length / 2)} className="width-constrained" />;
}
