import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPostsByCategorySlug,
  getAllCategories,
} from "../../lib/wordpress";
import { enhancePosts, enhancePreviewPosts } from "../../lib/enhancePost";
import { getArticleMagazineMeta } from "../../lib/articleIssue";
import type { EnhancedPost } from "../../lib/types";
import ArticleView from "./ArticleView";

export default async function ArticlePageContent({
  slug,
  relatedCategorySlug,
}: {
  slug: string;
  relatedCategorySlug?: string;
}) {
  const [post, categories] = await Promise.all([
    getPostBySlug(slug),
    getAllCategories(),
  ]);

  if (!post) notFound();

  const [enhancedPost] = await enhancePosts([post], categories);
  const { issue, specialFeature } = await getArticleMagazineMeta(enhancedPost);

  let relatedPosts: EnhancedPost[] = [];
  const relatedSlug =
    relatedCategorySlug ||
    enhancedPost.categories_obj?.[0]?.slug;

  if (relatedSlug) {
    try {
      const categoryPosts = await getPostsByCategorySlug(relatedSlug);
      relatedPosts = await enhancePreviewPosts(
        categoryPosts.filter((entry) => entry.id !== post.id).slice(0, 4),
        categories
      );
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  }

  return (
    <div className="page-container">
      <main className="main-content">
        <ArticleView
          post={enhancedPost}
          relatedPosts={relatedPosts}
          issue={issue}
          specialFeature={specialFeature}
        />
      </main>
    </div>
  );
}
