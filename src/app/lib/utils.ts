// Shared utility functions used across components
import { decode } from "he";
import type { EnhancedPost, Category, Post } from "./types";

export function getAuthorName(post: { author_name?: string; author_obj?: { name: string } | null }): string {
  for (const value of [post.author_name, post.author_obj?.name]) {
    const name = value?.trim();
    if (name && !/^(last\s*name|unknown(?: author)?|staff writer)$/i.test(name)) {
      return decode(name);
    }
  }
  return "Anonymous";
}

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
 * Strips HTML tags and decodes entities (&#8217; → ’) for plain-text display.
 */
export function stripHtml(html: string): string {
  return decode(html.replace(/<[^>]*>/g, ""));
}

const SITE_HOSTS = /^(?:www\.)?brownpoliticalreview\.org$/i;

function isExternalHref(href: string): boolean {
  const value = href.trim();
  if (!value || value.startsWith("#") || value.startsWith("/") || value.startsWith("?")) {
    return false;
  }
  if (/^(mailto|tel|sms):/i.test(value)) return false;
  try {
    const url = new URL(value, "https://brownpoliticalreview.org/");
    if (!/^https?:$/i.test(url.protocol)) return false;
    return !SITE_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
}

export function withExternalLinkTargets(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (full, attrs: string) => {
    const hrefMatch =
      attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i) ||
      attrs.match(/\bhref\s*=\s*([^\s>]+)/i);
    if (!hrefMatch) return full;
    const href = hrefMatch[2] ?? hrefMatch[1];
    if (!isExternalHref(href)) return full;

    let next = attrs.replace(/\s*\btarget\s*=\s*(["']).*?\1/gi, "").replace(/\s*\btarget\s*=\s*[^\s>]+/gi, "");
    next = next.replace(/\s*\brel\s*=\s*(["']).*?\1/gi, "").replace(/\s*\brel\s*=\s*[^\s>]+/gi, "");
    next += ' target="_blank" rel="noopener noreferrer"';
    return `<a${next}>`;
  });
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
export function getArticleTitle(post: Post | EnhancedPost): string {
  return typeof post.title === "object" ? post.title.rendered : post.title;
}

/**
 * Plain-text title + description for metadata / Open Graph.
 */
export function getArticlePlainMeta(post: {
  title?: { rendered: string } | string;
  excerpt?: { rendered: string } | string;
}): { title: string; description: string } {
  const title = stripHtml(
    typeof post.title === "object" ? post.title.rendered : post.title || ""
  );
  const excerpt =
    typeof post.excerpt === "object" ? post.excerpt.rendered : post.excerpt || "";
  return {
    title,
    description: stripHtml(excerpt).substring(0, 160),
  };
}

/**
 * Gets the article excerpt from a post object, handling both string and object formats
 */
export function getArticleExcerpt(post: Post | EnhancedPost): string {
  const excerpt =
    typeof post.excerpt === "object" ? post.excerpt.rendered : post.excerpt;
  return stripHtml(excerpt);
}

/**
 * Gets the featured image URL from a post object
 */
export function getFeaturedImageUrl(post: Post | EnhancedPost): string {
  return (post as EnhancedPost).featured_media_obj?.source_url || "";
}

/**
 * Generates the article link based on category and slug
 * Maps category slugs to their proper parent sections
 */
export function getArticleLink(post: { id: number; slug: string; categories_obj?: Array<{ slug: string }> }): string {
  if (post.id <= 0) return "#";

  // Define category to parent section mappings
  const categoryMappings: { [key: string]: string } = {
    // United States subsections
    education: "united-states",
    elections: "united-states",
    environment: "united-states",
    "foreign-policy": "united-states",
    health: "united-states",
    housing: "united-states",
    law: "united-states",
    "security-and-defense-usa": "united-states",

    // World subsections
    africa: "world",
    "asia-pacific": "world",
    europe: "world",
    "latin-america": "world",
    "middle-east": "world",
    "south-america": "world",

    // Multimedia subsections
    bpradio: "multimedia",
    data: "multimedia",
    media: "multimedia",

    // Interviews subsections
    "professor-podcasts": "interviews",
    "rhode-island-interviews": "interviews",
    "ri-interviews": "interviews",
    "us-interviews": "interviews",
    "congress-interviews": "interviews",
    "world-interviews": "interviews",

    // Culture subsections
    arts: "culture",
    gender: "culture",
    "health-culture": "culture",
    "lgbtq-politics": "culture",
    race: "culture",
    religion: "culture",
    science: "culture",
    technology: "culture",

    // Magazine
    magazine: "magazine",
  };

  const sections = ["magazine", "multimedia", "interviews", "united-states", "world", "culture"];
  const aliases: Record<string, string> = { usa: "united-states", mag: "magazine" };
  const slugs = (post.categories_obj || []).map(({ slug }) => aliases[slug] || slug);
  const section = sections.find((name) => slugs.includes(name))
    || sections.find((name) => slugs.some((slug) => categoryMappings[slug] === name))
    || "world";
  const subsection = slugs.filter((slug) => slug !== section && categoryMappings[slug] === section).sort()[0];
  return `/${section}${subsection ? `/${subsection}` : ""}/article/${encodeURIComponent(post.slug)}`;
}

/**
 * Deduplicates articles across multiple sections based on category priority
 * Each article appears only in the first matching section (in priority order)
 *
 * @param sectionsData Array of {categorySlug, posts} to deduplicate
 * @returns Array of deduplicated sections with the same structure
 *
 * @example
 * const sections = [
 *   { categorySlug: "usa", posts: [...] },
 *   { categorySlug: "world", posts: [...] }
 * ];
 * const deduped = deduplicateArticlesBySections(sections);
 * // Articles tagged with both "usa" and "world" only appear in "usa" section
 */
export function deduplicateArticlesBySections(
  sectionsData: Array<{ categorySlug: string; posts: EnhancedPost[] }>
): Array<{ categorySlug: string; posts: EnhancedPost[] }> {
  const usedPostIds = new Set<number>();

  return sectionsData.map((section) => {
    const dedupedPosts = section.posts.filter((post) => {
      if (usedPostIds.has(post.id)) {
        return false;
      }
      usedPostIds.add(post.id);
      return true;
    });

    return {
      categorySlug: section.categorySlug,
      posts: dedupedPosts,
    };
  });
}

/**
 * Filters posts by a specific category slug, ensuring the category is in their categories_obj
 * Useful for enforcing that articles render under a specific category section
 */
export function filterPostsByCategory(
  posts: EnhancedPost[],
  categorySlug: string
): EnhancedPost[] {
  return posts.filter((post) =>
    post.categories_obj?.some((cat: Category) => cat.slug === categorySlug)
  );
}


export function uniqueArticles<T extends { id: number }>(...groups: T[][]): T[] {
  const seen = new Set<number>();
  return groups.flat().filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

export function formatArchiveDate(value: string): string {
  const day = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!day) return "";
  const date = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).toUpperCase();
}
