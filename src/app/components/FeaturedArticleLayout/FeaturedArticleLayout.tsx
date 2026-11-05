import { EnhancedPost } from "../../lib/types";
import ArticleLayout from "../ArticleLayout/ArticleLayout";

interface FeaturedArticleLayoutProps {
  title: string;
  posts: EnhancedPost[];
  maxArticles?: number;
  featuredIndex?: number;
}

export default function FeaturedArticleLayout({ title, posts, maxArticles = 7, featuredIndex = 0 }: FeaturedArticleLayoutProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(maxArticles)));
  if (!articles.length) return null;
  const index = Math.min(Math.max(0, Math.floor(featuredIndex)), articles.length - 1);
  return <ArticleLayout posts={[articles[index], ...articles.filter((_, i) => i !== index)]} categoryName={title} />;
}
