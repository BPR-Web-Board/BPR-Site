import { EnhancedPost } from "../../lib/types";
import ArticleLayout from "../ArticleLayout/ArticleLayout";

export interface ArticleSplitShowcaseProps {
  posts: EnhancedPost[];
  sectionTitle?: string;
  highlightIndex?: number;
  maxSecondary?: number;
  mainPlacement?: "left" | "right";
  className?: string;
}

export default function ArticleSplitShowcase({ posts, sectionTitle, highlightIndex = 0,
  maxSecondary = 6, mainPlacement = "left", className = "" }: ArticleSplitShowcaseProps) {
  if (!posts?.length) return null;
  const index = Math.min(Math.max(0, Math.floor(highlightIndex)), posts.length - 1);
  const articles = [posts[index], ...posts.filter((_, i) => i !== index).slice(0, Math.max(0, Math.floor(maxSecondary)))];
  return <ArticleLayout posts={articles} categoryName={sectionTitle}
    className={`${mainPlacement === "right" ? "feature-on-right" : ""} ${className}`} />;
}
