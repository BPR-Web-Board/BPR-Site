import React from "react";
import { Post, Author, Category, FeaturedMedia } from "@/lib/wordpress.d";
import ArticlePreview from "./ArticlePreview";

type ListArticlePreviewProps = {
  post: Post;
  author?: Author;
  category?: Category;
  featuredMedia?: FeaturedMedia;
  className?: string;
};

const ListArticlePreview: React.FC<ListArticlePreviewProps> = ({
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
      variant="list"
      showExcerpt={true}
      showAuthor={true}
      showDate={true}
      showCategory={false}
    />
  );
};

export default ListArticlePreview;
