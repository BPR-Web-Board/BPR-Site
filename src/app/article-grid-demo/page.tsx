import React from "react";
import ArticleLayout from "../components/ArticleLayout";
import ArticleGrid from "../components/ArticleGrid";
import { enhancePosts } from "../lib/enhancePost";
import { getPostsByCategorySlug, getAllCategories } from "../lib/wordpress";

const usaPosts = await getPostsByCategorySlug("usa", 10);
const categories = await getAllCategories();
const enhancedUsaPosts = await enhancePosts(usaPosts, categories);

export default function ArticleLayoutDemo() {
  return (
    <div className="article-layout-demo-page">
      <ArticleGrid posts={enhancedUsaPosts} categoryName="USA" />
    </div>
  );
}
