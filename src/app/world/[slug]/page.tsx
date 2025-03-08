import { Metadata } from "next";
import ArticlePage from "@/components/Article/ArticlePage";
import {
  getPostBySlug,
  getAuthorById,
  getFeaturedMediaById,
  getAllPosts,
  getCategoryById,
  getCategoryBySlug,
} from "@/lib/wordpress";
import { notFound } from "next/navigation";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;

  try {
    const post = await getPostBySlug(slug);

    return {
      title: `${post.title.rendered} | World News | Brown Political Review`,
      description: post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 160),
      openGraph: {
        title: post.title.rendered,
        description: post.excerpt.rendered
          .replace(/<[^>]+>/g, "")
          .slice(0, 160),
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
        section: "World",
      },
    };
  } catch (error) {
    return {
      title: "Article Not Found | World News | Brown Political Review",
    };
  }
}

export default async function WorldArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  try {
    // Fetch the post data
    const post = await getPostBySlug(slug);

    // Ensure this post belongs to the World category
    const worldCategory = await getCategoryBySlug("world");

    // // Check if the post belongs to the World category
    // const isWorldArticle = post.categories.includes(worldCategory.id);

    // // If not in World category, return 404
    // if (!isWorldArticle) {
    //   notFound();
    // }

    // Fetch the author data
    const author = await getAuthorById(post.author);

    // Fetch the featured media if it exists
    let featuredMedia = undefined;
    if (post.featured_media > 0) {
      featuredMedia = await getFeaturedMediaById(post.featured_media);
    }

    // Fetch related posts from the same World category
    const relatedPosts = await getAllPosts({
      category: worldCategory.id.toString(),
    });

    // Remove the current post from related posts
    const filteredRelatedPosts = relatedPosts
      .filter((relatedPost) => relatedPost.id !== post.id)
      .slice(0, 3); // Limit to 3 related posts

    // Fetch categories data
    const categories = await Promise.all(
      post.categories.map((categoryId) => getCategoryById(categoryId))
    );

    return (
      <main>
        <ArticlePage
          post={post}
          author={author}
          featuredMedia={featuredMedia}
          relatedPosts={filteredRelatedPosts}
          categories={categories}
        />
      </main>
    );
  } catch (error) {
    console.error("Failed to fetch world article data:", error);
    notFound();
  }
}
