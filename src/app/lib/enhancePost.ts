import { getFeaturedMediaById, getAuthorById } from "./wordpress";
import { Post, Category, EnhancedPost } from "./types";

/**
 * Enhances a single post with additional data (featured media, author info, categories)
 */
export async function enhancePost(
  post: Post,
  categories?: Category[]
): Promise<EnhancedPost> {
  // Get featured media
  let featured_media_obj = null;
  if (post.featured_media && typeof post.featured_media === "number") {
    try {
      featured_media_obj = await getFeaturedMediaById(post.featured_media);
    } catch (error) {
      console.error("Error fetching featured media:", error);
    }
  }

  // Get author info
  let author_obj = null;
  let author_name = "LASTNAME";
  if (post.author && typeof post.author === "number") {
    try {
      author_obj = await getAuthorById(post.author);
      author_name = author_obj.name;
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }

  // Match categories
  let categories_obj: Category[] = [];
  if (categories && post.categories && post.categories.length > 0) {
    categories_obj = categories.filter((cat) =>
      post.categories.includes(cat.id)
    );
  }

  return {
    ...post,
    featured_media_obj,
    author_obj,
    author_name,
    categories_obj,
  };
}

/**
 * Enhances multiple posts with additional data
 */
export async function enhancePosts(
  posts: Post[],
  categories?: Category[]
): Promise<EnhancedPost[]> {
  return Promise.all(posts.map((post) => enhancePost(post, categories)));
}
