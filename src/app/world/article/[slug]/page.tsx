import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ArticleView from "../../../components/ArticleView/ArticleView";
import {
  getPostBySlug,
  getPostsByCategorySlug,
  getAllCategories,
} from "../../../lib/wordpress";
import { enhancePosts } from "../../../lib/enhancePost";
import { EnhancedPost } from "../../../lib/types";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    const title =
      typeof post.title === "object" ? post.title.rendered : post.title;
    const excerpt =
      typeof post.excerpt === "object" ? post.excerpt.rendered : post.excerpt;

    // Strip HTML from excerpt for description
    const description = excerpt.replace(/<[^>]*>/g, "").substring(0, 160);

    return {
      title: `${title} - Brown Political Review`,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
      },
    };
  } catch {
    return {
      title: "Article Not Found - Brown Political Review",
      description: "The requested article could not be found.",
    };
  }
}

export default async function WorldArticlePage({ params }: PageProps) {
  try {
    const { slug } = await params;

    // Fetch post and categories in parallel
    const [post, categories] = await Promise.all([
      getPostBySlug(slug),
      getAllCategories(),
    ]);

    if (!post) {
      notFound();
    }

    // Enhance the main post with batch fetching
    const [enhancedPost] = await enhancePosts([post], categories);

    // Fetch related posts from the same category
    let relatedPosts: EnhancedPost[] = [];
    if (enhancedPost.categories_obj && enhancedPost.categories_obj.length > 0) {
      try {
        const categorySlug = enhancedPost.categories_obj[0].slug;
        const categoryPosts = await getPostsByCategorySlug(categorySlug);

        // Filter out the current post and limit to 4
        const filteredPosts = categoryPosts
          .filter((p) => p.id !== post.id)
          .slice(0, 4);

        // Use batch enhancement for related posts (fixes N+1 problem)
        relatedPosts = await enhancePosts(filteredPosts, categories);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      }
    }

    return (
      <div className="page-container">
        <main className="main-content">
          <ArticleView post={enhancedPost} relatedPosts={relatedPosts} />
        </main>
        {/* Footer removed to prevent duplicates */}
      </div>
    );
  } catch (error) {
    console.error("Error loading article:", error);
    notFound();
  }
}
