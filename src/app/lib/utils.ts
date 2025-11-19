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
 * Maps category slugs to their proper parent sections
 */
export function getArticleLink(post: any): string {
  if (post.id <= 0) return "#";

  const categorySlug = post.categories_obj?.[0]?.slug || "world";

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

  // Get parent section, default to the category slug itself if no mapping
  const parentSection = categoryMappings[categorySlug] || categorySlug;

  // For parent sections (united-states, world, interviews, multimedia, magazine), use section/article/slug
  // For subsections, use parent/subsection/article/slug
  if (parentSection === categorySlug) {
    // This is a parent section
    return `/${categorySlug}/article/${post.slug}`;
  } else {
    // This is a subsection, use parent/subsection/article/slug
    return `/${parentSection}/${categorySlug}/article/${post.slug}`;
  }
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
  sectionsData: Array<{ categorySlug: string; posts: any[] }>
): Array<{ categorySlug: string; posts: any[] }> {
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
  posts: any[],
  categorySlug: string
): any[] {
  return posts.filter((post) =>
    post.categories_obj?.some((cat: any) => cat.slug === categorySlug)
  );
}
