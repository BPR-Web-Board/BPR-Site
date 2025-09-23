import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Footer from "../../../components/Footer/Footer";
import ArticleView from "../../../components/ArticleView/ArticleView";
import {
  getPostBySlug,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getPostsByCategorySlug,
} from "../../../lib/wordpress";
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
  } catch (error) {
    return {
      title: "Article Not Found - Brown Political Review",
      description: "The requested article could not be found.",
    };
  }
}

async function enhancePost(post: any): Promise<EnhancedPost> {
  let featured_media_obj = null;
  let author_obj = null;
  let author_name = "STAFF WRITER";
  let categories_obj = [];

  // Fetch featured media
  if (post.featured_media && typeof post.featured_media === "number") {
    try {
      featured_media_obj = await getFeaturedMediaById(post.featured_media);
    } catch (error) {
      console.error("Error fetching featured media:", error);
    }
  }

  // Fetch author info
  if (post.author && typeof post.author === "number") {
    try {
      author_obj = await getAuthorById(post.author);
      author_name = author_obj.name;
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }

  // Fetch category info
  if (post.categories && Array.isArray(post.categories)) {
    try {
      categories_obj = await Promise.all(
        post.categories.map((catId: number) => getCategoryById(catId))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  return {
    ...post,
    featured_media_obj,
    author_obj,
    author_name,
    categories_obj,
  };
}

export default async function WorldArticlePage({ params }: PageProps) {
  try {
    const { slug } = await params;
    // Fetch the post by slug
    const post = await getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Enhance the post with additional data
    const enhancedPost = await enhancePost(post);

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

        // Enhance related posts
        relatedPosts = await Promise.all(
          filteredPosts.map(async (p) => {
            let featured_media_obj = null;
            if (p.featured_media && typeof p.featured_media === "number") {
              try {
                featured_media_obj = await getFeaturedMediaById(
                  p.featured_media
                );
              } catch {}
            }
            return { ...p, featured_media_obj };
          })
        );
      } catch (error) {
        console.error("Error fetching related posts:", error);
      }
    }

    return (
      <div className="page-container">
        <NavigationBar />
        <main className="main-content">
          <ArticleView post={enhancedPost} relatedPosts={relatedPosts} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error loading article:", error);
    notFound();
  }
}
