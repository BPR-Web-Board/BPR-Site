import type { EnhancedPost } from "./types";

/**
 * PageContentManager ensures that the same article is never rendered twice on the same page.
 * Each page should create its own instance to track article usage across all components.
 *
 * Features:
 * - Tracks used article IDs to prevent duplicates
 * - Works with existing cache layer (doesn't bypass it)
 * - Returns empty arrays if insufficient unique articles are available
 * - Provides utilities for combining and filtering article pools
 *
 * @example
 * ```typescript
 * const contentManager = new PageContentManager();
 *
 * // Select articles for hero - will mark them as used
 * const heroArticles = contentManager.selectArticles(culturePosts, 5);
 *
 * // Select articles for carousel - automatically filters out hero articles
 * const carouselArticles = contentManager.selectArticles(culturePosts, 4);
 *
 * // Combine multiple sources and get unique articles
 * const poolArticles = contentManager.selectFromMultipleSources(
 *   [artsPosts, culturePosts, sciencePosts],
 *   8
 * );
 * ```
 */
export class PageContentManager {
  private usedArticleIds: Set<number> = new Set();

  /**
   * Selects up to `count` articles from the pool, excluding already-used articles.
   * Marks selected articles as used to prevent duplication in subsequent selections.
   *
   * @param pool - Array of enhanced posts to select from
   * @param count - Maximum number of articles to select
   * @param options - Optional configuration
   * @returns Array of selected articles (empty if insufficient unique articles)
   */
  selectArticles(
    pool: EnhancedPost[],
    count: number,
    options: {
      /** If true, returns partial results even if fewer than `count` articles are available */
      allowPartial?: boolean;
      /** If provided, only select articles matching this predicate */
      filter?: (post: EnhancedPost) => boolean;
    } = {}
  ): EnhancedPost[] {
    const { allowPartial = false, filter } = options;

    // Filter out already-used articles and apply custom filter if provided
    const availableArticles = pool.filter((post) => {
      if (this.usedArticleIds.has(post.id)) return false;
      if (filter && !filter(post)) return false;
      return true;
    });

    // If we don't have enough articles and partial results aren't allowed, return empty array
    if (availableArticles.length < count && !allowPartial) {
      return [];
    }

    // Select the requested number of articles (or all available if fewer)
    const selected = availableArticles.slice(0, count);

    // Mark selected articles as used
    selected.forEach((post) => this.usedArticleIds.add(post.id));

    return selected;
  }

  /**
   * Combines multiple article sources into a unique pool, then selects articles.
   * Useful for creating "pool" sections that draw from multiple categories.
   *
   * @param sources - Array of article arrays to combine
   * @param count - Number of articles to select from the combined pool
   * @param options - Optional configuration
   * @returns Array of selected articles (empty if insufficient unique articles)
   */
  selectFromMultipleSources(
    sources: EnhancedPost[][],
    count: number,
    options: {
      allowPartial?: boolean;
      filter?: (post: EnhancedPost) => boolean;
    } = {}
  ): EnhancedPost[] {
    // Combine all sources into a single pool, removing duplicates within the sources
    const combinedPool = this.combineUniquePosts(...sources);

    // Select from the combined pool
    return this.selectArticles(combinedPool, count, options);
  }

  /**
   * Combines multiple article arrays into a single array with no duplicates.
   * Does not mark articles as used - use selectArticles() for that.
   *
   * @param lists - Article arrays to combine
   * @returns Combined array with unique articles
   */
  combineUniquePosts(...lists: EnhancedPost[][]): EnhancedPost[] {
    const seen = new Set<number>();
    const combined: EnhancedPost[] = [];

    lists.forEach((list) => {
      list.forEach((post) => {
        if (!seen.has(post.id) && !this.usedArticleIds.has(post.id)) {
          seen.add(post.id);
          combined.push(post);
        }
      });
    });

    return combined;
  }

  /**
   * Returns the primary array if it has unused articles, otherwise tries fallbacks in order.
   * Useful for ensuring content is available even if preferred category is empty.
   * Does not mark articles as used - use selectArticles() for that.
   *
   * @param primary - Preferred article source
   * @param fallbacks - Fallback sources to try if primary is empty
   * @returns First non-empty array (filtered for unused articles)
   */
  ensureContent(
    primary: EnhancedPost[],
    ...fallbacks: EnhancedPost[][]
  ): EnhancedPost[] {
    // Filter out used articles from primary
    const availablePrimary = primary.filter(
      (post) => !this.usedArticleIds.has(post.id)
    );

    if (availablePrimary.length > 0) {
      return availablePrimary;
    }

    // Try each fallback in order
    for (const fallback of fallbacks) {
      const availableFallback = fallback.filter(
        (post) => !this.usedArticleIds.has(post.id)
      );
      if (availableFallback.length > 0) {
        return availableFallback;
      }
    }

    return [];
  }

  /**
   * Checks if an article has already been used on this page.
   */
  isUsed(postId: number): boolean {
    return this.usedArticleIds.has(postId);
  }

  /**
   * Gets the count of articles that have been used on this page.
   */
  getUsedCount(): number {
    return this.usedArticleIds.size;
  }

  /**
   * Manually mark articles as used without selecting them.
   * Useful for articles that are rendered through other means.
   */
  markAsUsed(posts: EnhancedPost[]): void {
    posts.forEach((post) => this.usedArticleIds.add(post.id));
  }

  /**
   * Resets the used articles tracker. Use with caution.
   */
  reset(): void {
    this.usedArticleIds.clear();
  }

  /**
   * Gets a filtered array of articles that haven't been used yet.
   * Does not mark them as used.
   */
  getAvailable(pool: EnhancedPost[]): EnhancedPost[] {
    return pool.filter((post) => !this.usedArticleIds.has(post.id));
  }
}
