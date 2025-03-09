import React from "react";
import { Post, Author, Category, FeaturedMedia } from "@/lib/wordpress.d";
import ArticlePreview from "./ArticlePreview";

type StandardArticlePreviewProps = {
  post: Post;
  author?: Author;
  category?: Category;
  featuredMedia?: FeaturedMedia;
  className?: string;
};

const StandardArticlePreview: React.FC<StandardArticlePreviewProps> = ({
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
      variant="standard"
      showExcerpt={false}
      showAuthor={true}
      showDate={false}
      showCategory={true}
    />
  );
};

export default StandardArticlePreview;
