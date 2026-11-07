// Description: WordPress API functions
// Used to fetch data from a WordPress site using the WordPress REST API
// Types are imported from `wp.d.ts`

import axios from "axios";
import type { IssueSource } from "./issues";

import { Post, Category, Tag, Page, Author, FeaturedMedia } from "./types";
import { withCache } from "./cache";

// WordPress Config

const baseUrl =
  process.env.WORDPRESS_URL || "https://brownpoliticalreview.org/";

// Create axios instance with default config
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 25000,
});

const WP_CIRCUIT_COOLDOWN_MS = 30_000;
let wpCircuitOpenUntil = 0;

export function resetWordPressCircuit() {
  wpCircuitOpenUntil = 0;
}

function isWordPressTransportError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; response?: unknown; isAxiosError?: boolean };
  if (!err.isAxiosError && !("config" in err)) return false;
  const code = err.code;
  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ERR_NETWORK" ||
    err.response == null
  );
}

api.interceptors.request.use((config) => {
  if (Date.now() < wpCircuitOpenUntil) {
    const error = new Error("WordPress unavailable (circuit open)") as Error & {
      code: string;
      config: typeof config;
      isAxiosError: true;
      response: undefined;
    };
    error.code = "ECONNABORTED";
    error.config = config;
    error.isAxiosError = true;
    error.response = undefined;
    throw error;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    wpCircuitOpenUntil = 0;
    return response;
  },
  (error) => {
    if (isWordPressTransportError(error)) {
      wpCircuitOpenUntil = Date.now() + WP_CIRCUIT_COOLDOWN_MS;
    }
    return Promise.reject(error);
  }
);

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  POSTS: 30 * 60 * 1000, // 30 minutes (increased from 5 for better cache hit rate)
  CATEGORIES: 60 * 60 * 1000, // 1 hour (categories change infrequently)
  TAGS: 60 * 60 * 1000, // 1 hour
  PAGES: 60 * 60 * 1000, // 1 hour
  AUTHORS: 2 * 60 * 60 * 1000, // 2 hours (authors rarely change)
  MEDIA: 2 * 60 * 60 * 1000, // 2 hours (media rarely changes)
};

const LIST_POST_PARAMS = {
  _embed: "author,wp:featuredmedia",
  _fields: [
    "id",
    "date",
    "date_gmt",
    "modified",
    "modified_gmt",
    "slug",
    "status",
    "type",
    "link",
    "title",
    "excerpt",
    "author",
    "featured_media",
    "format",
    "categories",
    "tags",
    "meta",
    "guid",
    "_links",
    "_embedded",
  ].join(","),
};

function normalizeListPost(post: Post): Post {
  return {
    ...post,
    content: post.content || { rendered: "", protected: false },
    excerpt: post.excerpt || { rendered: "", protected: false },
    categories: post.categories || [],
    tags: post.tags || [],
    meta: post.meta || {},
  };
}

// WordPress Functions

const fetchAllPosts = withCache(
  "getAllPosts",
  async (filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
    per_page?: number;
    page?: number;
    offset?: number;
    search?: string;
  }): Promise<Post[]> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: {
        ...LIST_POST_PARAMS,
        per_page: filterParams?.per_page || 30,
        page: filterParams?.page,
        offset: filterParams?.offset,
        author: filterParams?.author,
        tags: filterParams?.tag,
        categories: filterParams?.category,
        search: filterParams?.search,
      },
    });
    return (data || []).map(normalizeListPost);
  },
  CACHE_TTL.POSTS
);

export const getAllPosts = async (filterParams?: {
  author?: string;
  tag?: string;
  category?: string;
  per_page?: number;
  page?: number;
  offset?: number;
  search?: string;
}): Promise<Post[]> => {
  try {
    return await fetchAllPosts(filterParams);
  } catch (error) {
    console.warn("Failed to fetch posts:", error);
    return [];
  }
};

export const getPostById = withCache(
  "getPostById",
  async (id: number): Promise<Post> => {
    const { data } = await api.get<Post>(`/wp-json/wp/v2/posts/${id}`);
    return data;
  },
  CACHE_TTL.POSTS
);

export const getPostBySlug = withCache(
  "getPostBySlug",
  async (slug: string): Promise<Post> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { slug, _embed: "author,wp:featuredmedia" },
    });
    return data[0];
  },
  CACHE_TTL.POSTS
);

const fetchAllCategories = withCache(
  "getAllCategories",
  async (): Promise<Category[]> => {
    const categories: Category[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const response = await api.get<Category[]>("/wp-json/wp/v2/categories", {
        params: { per_page: 100, page },
      });
      categories.push(...response.data);
      totalPages = Number(response.headers?.["x-wp-totalpages"] || 1);
      page++;
    } while (page <= totalPages);
    return categories;
  },
  CACHE_TTL.CATEGORIES
);

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    return await fetchAllCategories();
  } catch (error) {
    console.warn("Failed to fetch categories:", error);
    return [];
  }
};

export const getCategoryById = withCache(
  "getCategoryById",
  async (id: number): Promise<Category> => {
    const { data } = await api.get<Category>(`/wp-json/wp/v2/categories/${id}`);
    return data;
  },
  CACHE_TTL.CATEGORIES
);

export const getCategoryBySlug = withCache(
  "getCategoryBySlug",
  async (slug: string): Promise<Category | null> => {
    try {
      const { data } = await api.get<Category[]>("/wp-json/wp/v2/categories", {
        params: { slug },
      });
      if (!data || data.length === 0) {
        console.warn(`Category with slug "${slug}" not found`);
        return null;
      }
      return data[0];
    } catch (error) {
      console.warn(`Failed to fetch category "${slug}":`, error);
      return null;
    }
  },
  CACHE_TTL.CATEGORIES
);

export const getPostsByCategory = withCache(
  "getPostsByCategory",
  async (categoryId: number): Promise<Post[]> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { ...LIST_POST_PARAMS, categories: categoryId },
    });
    return (data || []).map(normalizeListPost);
  },
  CACHE_TTL.POSTS
);

export const getPostsByTag = withCache(
  "getPostsByTag",
  async (tagId: number): Promise<Post[]> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { tags: tagId },
    });
    return data;
  },
  CACHE_TTL.POSTS
);

export const getTagsByPost = withCache(
  "getTagsByPost",
  async (postId: number): Promise<Tag[]> => {
    const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags", {
      params: { post: postId },
    });
    return data;
  },
  CACHE_TTL.TAGS
);

export const getAllTags = withCache(
  "getAllTags",
  async (): Promise<Tag[]> => {
    const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags");
    return data;
  },
  CACHE_TTL.TAGS
);

export const getTagById = withCache(
  "getTagById",
  async (id: number): Promise<Tag> => {
    const { data } = await api.get<Tag>(`/wp-json/wp/v2/tags/${id}`);
    return data;
  },
  CACHE_TTL.TAGS
);

export const getTagBySlug = withCache(
  "getTagBySlug",
  async (slug: string): Promise<Tag> => {
    const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags", {
      params: { slug },
    });
    return data[0];
  },
  CACHE_TTL.TAGS
);

export const getAllPages = withCache(
  "getAllPages",
  async (): Promise<Page[]> => {
    const { data } = await api.get<Page[]>("/wp-json/wp/v2/pages");
    return data;
  },
  CACHE_TTL.PAGES
);

export const getPageById = withCache(
  "getPageById",
  async (id: number): Promise<Page> => {
    const { data } = await api.get<Page>(`/wp-json/wp/v2/pages/${id}`);
    return data;
  },
  CACHE_TTL.PAGES
);

export const getPageBySlug = withCache(
  "getPageBySlug",
  async (slug: string): Promise<Page> => {
    const { data } = await api.get<Page[]>("/wp-json/wp/v2/pages", {
      params: { slug },
    });
    return data[0];
  },
  CACHE_TTL.PAGES
);

export const getAllAuthors = withCache(
  "getAllAuthors",
  async (): Promise<Author[]> => {
    const { data } = await api.get<Author[]>("/wp-json/wp/v2/users");
    return data;
  },
  CACHE_TTL.AUTHORS
);

export const getAuthorById = withCache(
  "getAuthorById",
  async (id: number): Promise<Author> => {
    const { data } = await api.get<Author>(`/wp-json/wp/v2/users/${id}`);
    return data;
  },
  CACHE_TTL.AUTHORS
);

export const getAuthorBySlug = withCache(
  "getAuthorBySlug",
  async (slug: string): Promise<Author> => {
    const { data } = await api.get<Author[]>("/wp-json/wp/v2/users", {
      params: { slug },
    });
    return data[0];
  },
  CACHE_TTL.AUTHORS
);

export const getPostsByAuthor = withCache(
  "getPostsByAuthor",
  async (authorId: number): Promise<Post[]> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { author: authorId },
    });
    return data;
  },
  CACHE_TTL.POSTS
);

export const getPostsByAuthorSlug = withCache(
  "getPostsByAuthorSlug",
  async (authorSlug: string): Promise<Post[]> => {
    const author = await getAuthorBySlug(authorSlug);
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { author: author.id },
    });
    return data;
  },
  CACHE_TTL.POSTS
);

export const getPostsByCategorySlug = withCache(
  "getPostsByCategorySlug",
  async (
    categorySlug: string,
    options?: {
      per_page?: number;
      page?: number;
      offset?: number;
    }
  ): Promise<Post[]> => {
    try {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) {
        return [];
      }
      const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
        params: {
          ...LIST_POST_PARAMS,
          categories: category.id,
          per_page: options?.per_page || 20,
          page: options?.page,
          offset: options?.offset,
        },
      });
      return (data || []).map(normalizeListPost);
    } catch (error) {
      console.warn(
        `Failed to fetch posts for category "${categorySlug}":`,
        error
      );
      return [];
    }
  },
  CACHE_TTL.POSTS
);

export const getPostsByTagSlug = withCache(
  "getPostsByTagSlug",
  async (tagSlug: string): Promise<Post[]> => {
    const tag = await getTagBySlug(tagSlug);
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: { tags: tag.id },
    });
    return data;
  },
  CACHE_TTL.POSTS
);

export const getFeaturedMediaById = withCache(
  "getFeaturedMediaById",
  async (id: number): Promise<FeaturedMedia> => {
    const { data } = await api.get<FeaturedMedia>(`/wp-json/wp/v2/media/${id}`);
    return data;
  },
  CACHE_TTL.MEDIA
);

// Batch fetch functions for optimization

/**
 * Batch fetch multiple authors by IDs
 * More efficient than individual getAuthorById calls
 */
export const getAuthorsByIds = withCache(
  "getAuthorsByIds",
  async (ids: number[]): Promise<Author[]> => {
    if (ids.length === 0) return [];

    // WordPress REST API supports 'include' parameter for batch fetching
    const { data } = await api.get<Author[]>("/wp-json/wp/v2/users", {
      params: {
        include: ids.join(","),
        per_page: 100, // Supports up to 100 items
      },
    });
    return data;
  },
  CACHE_TTL.AUTHORS
);

/**
 * Batch fetch multiple media items by IDs
 * More efficient than individual getFeaturedMediaById calls
 */
export const getMediaByIds = withCache(
  "getMediaByIds",
  async (ids: number[]): Promise<FeaturedMedia[]> => {
    if (ids.length === 0) return [];

    // WordPress REST API supports 'include' parameter for batch fetching
    const { data } = await api.get<FeaturedMedia[]>("/wp-json/wp/v2/media", {
      params: {
        include: ids.join(","),
        per_page: 100, // Supports up to 100 items
      },
    });
    return data;
  },
  CACHE_TTL.MEDIA
);

export const getPostContentByIds = withCache(
  "getPostContentByIds",
  async (ids: number[]): Promise<Array<Pick<Post, "id" | "content">>> => {
    if (ids.length === 0) return [];
    const unique = [...new Set(ids.filter((id) => Number.isSafeInteger(id) && id > 0))];
    if (!unique.length) return [];
    const posts: Array<Pick<Post, "id" | "content">> = [];
    for (let i = 0; i < unique.length; i += 100) {
      const chunk = unique.slice(i, i + 100);
      const { data } = await api.get<Array<Pick<Post, "id" | "content">>>("/wp-json/wp/v2/posts", {
        params: {
          include: chunk.join(","),
          per_page: chunk.length,
          _fields: "id,content",
        },
      });
      posts.push(...(data || []));
    }
    return posts;
  },
  CACHE_TTL.POSTS
);

/**
 * Search posts by keyword
 */
export const searchPosts = withCache(
  "searchPosts",
  async (
    searchTerm: string,
    options?: {
      per_page?: number;
      page?: number;
    }
  ): Promise<Post[]> => {
    const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: {
        ...LIST_POST_PARAMS,
        search: searchTerm,
        per_page: options?.per_page || 20,
        page: options?.page || 1,
      },
    });
    return (data || []).map(normalizeListPost);
  },
  CACHE_TTL.POSTS
);

export const getIssueArchiveSources = withCache(
  "getIssueArchiveSources",
  async (): Promise<IssueSource[]> => {
    const [archive, categories] = await Promise.all([
      api.get<IssueSource[]>("/wp-json/wp/v2/pages", { params: { slug: "issues-archive", _embed: "wp:featuredmedia" } }),
      api.get<Category[]>("/wp-json/wp/v2/categories", { params: { slug: "issues-archive" } }),
    ]);
    const sources = [...archive.data];
    const category = categories.data[0];
    if (category) {
      let page = 1;
      let totalPages = 1;
      do {
        const response = await api.get<IssueSource[]>("/wp-json/wp/v2/posts", {
          params: { categories: category.id, per_page: 100, page, _embed: "wp:featuredmedia" },
        });
        sources.push(...response.data);
        totalPages = Number(response.headers["x-wp-totalpages"] || 1);
        page++;
      } while (page <= totalPages);
    }
    return sources;
  },
  CACHE_TTL.POSTS
);


export const getIssuePosts = withCache(
  "getIssuePosts",
  async (identifier: string | number): Promise<Post[]> => {
    let tagId: number;
    if (typeof identifier === "number") {
      if (!Number.isSafeInteger(identifier) || identifier < 1) return [];
      tagId = identifier;
    } else {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(identifier)) return [];
      const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags", { params: { slug: identifier } });
      if (!data[0]) return [];
      tagId = data[0].id;
    }
    const posts = new Map<number, Post>();
    let page = 1;
    let totalPages = 1;
    do {
      const response = await api.get<Post[]>("/wp-json/wp/v2/posts", {
        params: { ...LIST_POST_PARAMS, tags: tagId, per_page: 100, page, orderby: "date", order: "desc" },
      });
      for (const post of response.data) if (post.tags?.includes(tagId)) posts.set(post.id, normalizeListPost(post));
      totalPages = Number(response.headers["x-wp-totalpages"] || 1);
      page++;
    } while (page <= totalPages);
    return [...posts.values()].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0) || b.id - a.id);
  },
  CACHE_TTL.POSTS
);
