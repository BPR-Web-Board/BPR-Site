import { useState, useEffect } from "react";
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  getAuthorById,
  getFeaturedMediaById,
  getCategoryById,
  getTagById,
} from "@/lib/wordpress";
import { Post, Author, Category, Tag, FeaturedMedia } from "@/lib/wordpress.d";

// Type for enriched post with all related data
export type EnrichedPost = {
  post: Post;
  author: Author;
  categories: Category[];
  tags: Tag[];
  featuredMedia?: FeaturedMedia;
};

// Hook to fetch a single post with all its related data
export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Author | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPostData() {
      try {
        setLoading(true);

        // Fetch the post
        const postData = await getPostBySlug(slug);
        setPost(postData);

        // Fetch the author
        const authorData = await getAuthorById(postData.author);
        setAuthor(authorData);

        // Fetch the categories
        const categoriesData = await Promise.all(
          postData.categories.map((categoryId) => getCategoryById(categoryId))
        );
        setCategories(categoriesData);

        // Fetch the tags
        if (postData.tags && postData.tags.length > 0) {
          const tagsData = await Promise.all(
            postData.tags.map((tagId) => getTagById(tagId))
          );
          setTags(tagsData);
        }

        // Fetch the featured media if it exists
        if (postData.featured_media && postData.featured_media > 0) {
          const mediaData = await getFeaturedMediaById(postData.featured_media);
          setFeaturedMedia(mediaData);
        }

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setLoading(false);
      }
    }

    if (slug) {
      fetchPostData();
    }
  }, [slug]);

  return { post, author, categories, tags, featuredMedia, loading, error };
}

// Hook to fetch posts by category with enriched data
export function usePostsByCategory(categoryId: number, limit: number = 10) {
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategoryPosts() {
      try {
        setLoading(true);

        // Fetch posts by category
        const postsData = await getAllPosts({
          category: categoryId.toString(),
        });
        const limitedPosts = postsData.slice(0, limit);

        // Enrich each post with related data
        const enrichedPosts = await Promise.all(
          limitedPosts.map(async (post) => {
            const author = await getAuthorById(post.author);

            const categories = await Promise.all(
              post.categories.map((categoryId) => getCategoryById(categoryId))
            );

            const tags =
              post.tags && post.tags.length > 0
                ? await Promise.all(post.tags.map((tagId) => getTagById(tagId)))
                : [];

            const featuredMedia =
              post.featured_media && post.featured_media > 0
                ? await getFeaturedMediaById(post.featured_media)
                : undefined;

            return {
              post,
              author,
              categories,
              tags,
              featuredMedia,
            };
          })
        );

        setPosts(enrichedPosts);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchCategoryPosts();
    }
  }, [categoryId, limit]);

  return { posts, loading, error };
}

// Hook to fetch latest posts across all categories
export function useLatestPosts(limit: number = 10) {
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        setLoading(true);

        // Fetch latest posts
        const postsData = await getAllPosts();
        const limitedPosts = postsData.slice(0, limit);

        // Enrich each post with related data
        const enrichedPosts = await Promise.all(
          limitedPosts.map(async (post) => {
            const author = await getAuthorById(post.author);

            const categories = await Promise.all(
              post.categories.map((categoryId) => getCategoryById(categoryId))
            );

            const tags =
              post.tags && post.tags.length > 0
                ? await Promise.all(post.tags.map((tagId) => getTagById(tagId)))
                : [];

            const featuredMedia =
              post.featured_media && post.featured_media > 0
                ? await getFeaturedMediaById(post.featured_media)
                : undefined;

            return {
              post,
              author,
              categories,
              tags,
              featuredMedia,
            };
          })
        );

        setPosts(enrichedPosts);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setLoading(false);
      }
    }

    fetchLatestPosts();
  }, [limit]);

  return { posts, loading, error };
}
