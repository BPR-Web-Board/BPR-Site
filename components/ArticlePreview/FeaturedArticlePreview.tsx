import React from "react";
import { Post, Author, Category, FeaturedMedia } from "@/lib/wordpress.d";
import ArticlePreview from "./ArticlePreview";

type FeaturedArticlePreviewProps = {
  post: Post;
  author?: Author;
  category?: Category;
  featuredMedia?: FeaturedMedia;
  className?: string;
};

const FeaturedArticlePreview: React.FC<FeaturedArticlePreviewProps> = ({
  post,
  author,
  category,
  featuredMedia,
  className,
}) => {
  return (
    <ArticlePreview
      post={post}
      author={author}
      category={category}
      featuredMedia={featuredMedia}
      className={className}
      variant="featured"
      showExcerpt={true}
      showAuthor={true}
      showDate={true}
      showCategory={true}
    />
  );
};

export default FeaturedArticlePreview;
