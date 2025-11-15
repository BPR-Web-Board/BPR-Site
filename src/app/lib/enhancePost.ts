import {
  getFeaturedMediaById,
  getAuthorById,
  getAuthorsByIds,
  getMediaByIds,
} from "./wordpress";
import { Post, Category, EnhancedPost, Author, FeaturedMedia } from "./types";

/**
 * Enhances a single post with additional data (featured media, author info, categories)
 * Note: For multiple posts, use enhancePosts() which is more efficient with batch fetching
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
 * Enhances multiple posts with additional data using optimized batch fetching
 * This solves the N+1 problem by fetching all authors and media in 2 requests
 * instead of 2 requests per post
 */
export async function enhancePosts(
  posts: Post[],
  categories?: Category[]
): Promise<EnhancedPost[]> {
  if (posts.length === 0) return [];

  // Extract unique author IDs and media IDs
  const authorIds = new Set<number>();
  const mediaIds = new Set<number>();

  posts.forEach((post) => {
    if (post.author && typeof post.author === "number") {
      authorIds.add(post.author);
    }
    if (post.featured_media && typeof post.featured_media === "number") {
      mediaIds.add(post.featured_media);
    }
  });

  // Batch fetch all authors and media in parallel
  const [authors, mediaItems] = await Promise.all([
    authorIds.size > 0
      ? getAuthorsByIds(Array.from(authorIds)).catch((error) => {
          console.error("Error batch fetching authors:", error);
          return [] as Author[];
        })
      : Promise.resolve([] as Author[]),
    mediaIds.size > 0
      ? getMediaByIds(Array.from(mediaIds)).catch((error) => {
          console.error("Error batch fetching media:", error);
          return [] as FeaturedMedia[];
        })
      : Promise.resolve([] as FeaturedMedia[]),
  ]);

  // Create lookup maps for O(1) access
  const authorMap = new Map<number, Author>();
  authors.forEach((author) => authorMap.set(author.id, author));

  const mediaMap = new Map<number, FeaturedMedia>();
  mediaItems.forEach((media) => mediaMap.set(media.id, media));

  // Enhance all posts using the lookup maps
  return posts.map((post) => {
    // Get author info from map
    let author_obj = null;
    let author_name = "LASTNAME";
    if (post.author && typeof post.author === "number") {
      author_obj = authorMap.get(post.author) || null;
      if (author_obj) {
        author_name = author_obj.name;
      }
    }

    // Get featured media from map
    let featured_media_obj = null;
    if (post.featured_media && typeof post.featured_media === "number") {
      featured_media_obj = mediaMap.get(post.featured_media) || null;
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
  });
}
