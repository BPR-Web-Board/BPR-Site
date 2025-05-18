// Description: WordPress API functions
// Used to fetch data from a WordPress site using the WordPress REST API
// Types are imported from `wp.d.ts`

import axios from "axios";

import {
  Post,
  Category,
  Tag,
  Page,
  Author,
  FeaturedMedia,
} from "./wordpress.d";

// WordPress Config

const baseUrl =
  process.env.WORDPRESS_URL || "https://brownpoliticalreview.org/";

// Create axios instance with default config
export const api = axios.create({
  baseURL: baseUrl,
});

function getUrl(path: string, query?: Record<string, any>) {
  return path;
}

// WordPress Functions

export async function getAllPosts(filterParams?: {
  author?: string;
  tag?: string;
  category?: string;
}): Promise<Post[]> {
  console.log("filterParams", filterParams);
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: {
      per_page: 30,
      author: filterParams?.author,
      tags: filterParams?.tag,
      categories: filterParams?.category,
    },
  });
  return data;
}

export async function getPostById(id: number): Promise<Post> {
  const { data } = await api.get<Post>(`/wp-json/wp/v2/posts/${id}`);
  return data;
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { slug },
  });
  return data[0];
}

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/wp-json/wp/v2/categories");
  return data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const { data } = await api.get<Category>(`/wp-json/wp/v2/categories/${id}`);
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await api.get<Category[]>("/wp-json/wp/v2/categories", {
    params: { slug },
  });
  return data[0];
}

export async function getPostsByCategory(categoryId: number): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { categories: categoryId },
  });
  return data;
}

export async function getPostsByTag(tagId: number): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { tags: tagId },
  });
  return data;
}

export async function getTagsByPost(postId: number): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags", {
    params: { post: postId },
  });
  return data;
}

export async function getAllTags(): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags");
  return data;
}

export async function getTagById(id: number): Promise<Tag> {
  const { data } = await api.get<Tag>(`/wp-json/wp/v2/tags/${id}`);
  return data;
}

export async function getTagBySlug(slug: string): Promise<Tag> {
  const { data } = await api.get<Tag[]>("/wp-json/wp/v2/tags", {
    params: { slug },
  });
  return data[0];
}

export async function getAllPages(): Promise<Page[]> {
  const { data } = await api.get<Page[]>("/wp-json/wp/v2/pages");
  return data;
}

export async function getPageById(id: number): Promise<Page> {
  const { data } = await api.get<Page>(`/wp-json/wp/v2/pages/${id}`);
  return data;
}

export async function getPageBySlug(slug: string): Promise<Page> {
  const { data } = await api.get<Page[]>("/wp-json/wp/v2/pages", {
    params: { slug },
  });
  return data[0];
}

export async function getAllAuthors(): Promise<Author[]> {
  const { data } = await api.get<Author[]>("/wp-json/wp/v2/users");
  return data;
}

export async function getAuthorById(id: number): Promise<Author> {
  const { data } = await api.get<Author>(`/wp-json/wp/v2/users/${id}`);
  return data;
}

export async function getAuthorBySlug(slug: string): Promise<Author> {
  const { data } = await api.get<Author[]>("/wp-json/wp/v2/users", {
    params: { slug },
  });
  return data[0];
}

export async function getPostsByAuthor(authorId: number): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { author: authorId },
  });
  return data;
}

export async function getPostsByAuthorSlug(
  authorSlug: string
): Promise<Post[]> {
  const author = await getAuthorBySlug(authorSlug);
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { author: author.id },
  });
  return data;
}

export async function getPostsByCategorySlug(
  categorySlug: string
): Promise<Post[]> {
  const category = await getCategoryBySlug(categorySlug);
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { categories: category.id },
  });
  return data;
}

export async function getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
  const tag = await getTagBySlug(tagSlug);
  const { data } = await api.get<Post[]>("/wp-json/wp/v2/posts", {
    params: { tags: tag.id },
  });
  return data;
}

export async function getFeaturedMediaById(id: number): Promise<FeaturedMedia> {
  const { data } = await api.get<FeaturedMedia>(`/wp-json/wp/v2/media/${id}`);
  return data;
}
