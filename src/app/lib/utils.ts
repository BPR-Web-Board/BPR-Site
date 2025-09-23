// Shared utility functions used across components

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Truncates text to a maximum length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Gets the article title from a post object, handling both string and object formats
 */
export function getArticleTitle(post: any): string {
  return typeof post.title === "object" ? post.title.rendered : post.title;
}

/**
 * Gets the article excerpt from a post object, handling both string and object formats
 */
export function getArticleExcerpt(post: any): string {
  const excerpt =
    typeof post.excerpt === "object" ? post.excerpt.rendered : post.excerpt;
  return stripHtml(excerpt);
}

/**
 * Gets the featured image URL from a post object
 */
export function getFeaturedImageUrl(post: any): string {
  return post.featured_media_obj?.source_url || "";
}

/**
 * Generates the article link based on category and slug
 */
export function getArticleLink(post: any): string {
  if (post.id <= 0) return "#";
  return `/${post.categories_obj?.[0]?.slug || "world"}/article/${post.slug}`;
}
