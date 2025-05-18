import { Post, Author, Category, FeaturedMedia } from "./types";
import {
  api, // Import the configured API instance
  getAllPosts,
  getAuthorById,
  getFeaturedMediaById,
  getCategoryById,
} from "./wordpress";

// Define meta property type more specifically to match possible structures
type PostMeta =
  | any[]
  | {
      [key: string]: any;
      illustrator?: string;
      _illustrator?: string;
      illustrator_name?: string;
    };

export interface EnhancedPost extends Omit<Post, "meta"> {
  meta?: PostMeta;
  author_name?: string;
  author_obj?: Author | null;
  illustrator?: string;
  featured_media_obj?: FeaturedMedia | null;
  categories_obj?: Category[];
}

/**
 * Gets posts with enhanced data (author, featured media, etc.)
 */
export async function getEnhancedPosts(
  filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
  },
  limit: number = 10
): Promise<EnhancedPost[]> {
  try {
    console.log("Fetching enhanced posts with params:", filterParams);

    // Use the existing WordPress functions that are working
    const posts = await getAllPosts(filterParams);
    console.log(`Retrieved ${posts?.length || 0} basic posts from WordPress`);

    if (!posts || posts.length === 0) {
      console.log("No posts returned from WordPress API");
      return [];
    }

    // Limit to requested number
    const limitedPosts = posts.slice(0, limit);

    // Enhance each post with additional data
    const enhancedPosts: EnhancedPost[] = await Promise.all(
      limitedPosts.map(async (post): Promise<EnhancedPost> => {
        // Initialize the enhanced post with original data
        const enhancedPost: EnhancedPost = { ...post };

        // Get author data
        try {
          if (post.author) {
            const author = await getAuthorById(post.author);
            enhancedPost.author_obj = author;
            enhancedPost.author_name = author?.name;
          }
        } catch (error) {
          console.error(`Error fetching author for post ${post.id}:`, error);
          enhancedPost.author_obj = null;
        }

        // Get featured media
        try {
          if (post.featured_media) {
            const media = await getFeaturedMediaById(post.featured_media);
            enhancedPost.featured_media_obj = media;

            // Extract illustrator from media caption if available
            if (media?.caption?.rendered) {
              const captionText = media.caption.rendered;
              const match = captionText.match(/illustration\s+by\s+([^\.]+)/i);
              if (match) {
                enhancedPost.illustrator = match[1].trim();
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching media for post ${post.id}:`, error);
          enhancedPost.featured_media_obj = null;
        }

        // Extract illustrator from meta if not already found
        if (!enhancedPost.illustrator && post.meta) {
          // Handle both array and object meta formats
          if (Array.isArray(post.meta)) {
            const illustratorMeta = post.meta.find(
              (m) => m.key === "illustrator" || m.key === "_illustrator"
            );
            if (illustratorMeta) {
              enhancedPost.illustrator = illustratorMeta.value;
            }
          } else if (typeof post.meta === "object" && post.meta !== null) {
            // Use type assertion here to ensure TypeScript knows the type
            const metaObject = post.meta as Record<string, any>;
            enhancedPost.illustrator =
              metaObject.illustrator ||
              metaObject._illustrator ||
              metaObject.illustrator_name;
          }
        }

        // Get category data
        try {
          if (post.categories && post.categories.length > 0) {
            const categoriesPromises = post.categories.map((catId) =>
              getCategoryById(catId).catch(() => null)
            );
            const categories = await Promise.all(categoriesPromises);
            enhancedPost.categories_obj = categories.filter(
              Boolean
            ) as Category[];
          }
        } catch (error) {
          console.error(
            `Error fetching categories for post ${post.id}:`,
            error
          );
          enhancedPost.categories_obj = [];
        }

        return enhancedPost;
      })
    );

    return enhancedPosts;
  } catch (error) {
    // More detailed error logging
    console.error("Error in getEnhancedPosts:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

/**
 * Get a specific post with all enhanced data
 */
export async function getEnhancedPostBySlug(
  slug: string
): Promise<EnhancedPost | null> {
  try {
    const posts = await getEnhancedPosts({ category: slug }, 1);
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error(`Error fetching enhanced post by slug "${slug}":`, error);
    return null;
  }
}
