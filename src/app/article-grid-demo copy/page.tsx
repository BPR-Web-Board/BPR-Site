import React from "react";
import ArticleLayout from "../components/ArticleLayout";

export default function ArticleLayoutDemo() {
  return (
    <div className="article-layout-demo-page">
      <ArticleLayout categorySlug="usa" className="demo-layout" />
    </div>
  );
}
