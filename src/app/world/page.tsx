import React from "react";
import { Metadata } from "next";
import { getPostBySlug, getCategoryBySlug } from "@/app/lib/wordpress";
import NavigationBar from "@/app/components/NavigationBar/NavigationBar";
import Footer from "@/app/components/Footer/Footer";
import ArticleRenderer from "@/app/components/ArticleRenderer/ArticleRenderer";

// This type helps TypeScript understand the params structure
type ArticleParams = {
  params: {
    category: string;
    slug: string;
  };
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: ArticleParams): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Article Not Found - Brown Political Review",
    };
  }

  // Strip HTML tags from excerpt for meta description
  const excerptText = post.excerpt?.rendered
    ? post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, "")
    : "";

  return {
    title: `${post.title.rendered} - Brown Political Review`,
    description:
      excerptText || `Read "${post.title.rendered}" on Brown Political Review`,
    openGraph: {
      title: post.title.rendered,
      description: excerptText,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
  };
}

// Main page component
export default async function ArticlePage({ params }: ArticleParams) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div>
        <NavigationBar />
        <div className="container mt-7 mb-7">
          <h1>Article Not Found</h1>
          <p>
            The article you are looking for does not exist or has been removed.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // Fetch the category info
  //   const category = await getCategoryBySlug(params.category);

  return (
    <div>
      <NavigationBar />
      <main className="pt-7">
        <ArticleRenderer post={post} />
      </main>
      <Footer />
    </div>
  );
}
