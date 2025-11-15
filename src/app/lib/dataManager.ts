/**
 * Centralized Data Manager
 *
 * Optimizes API calls and handles intelligent article distribution
 * with deduplication across all page sections.
 *
 * Key Features:
 * - Priority-based article assignment
 * - Global deduplication
 * - Quota enforcement
 * - Smart caching utilization
 */

import { Post, EnhancedPost, Category } from './types';
import {
  getAllPosts,
  getPostsByCategorySlug,
  getAllCategories,
} from './wordpress';
import { enhancePosts } from './enhancePost';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Category priority levels (higher = more important)
 * Determines which category "claims" an article when it belongs to multiple
 */
export const CATEGORY_PRIORITIES: Record<string, number> = {
  // Top-level categories (shown on main page)
  'usa': 5,
  'world': 5,
  'culture': 4,
  'law': 4,
  'policy': 4,

  // USA subcategories
  'elections': 4,
  'education': 3,
  'environment': 3,
  'health': 3,
  'housing': 3,
  'foreign-policy': 3,
  'security-defense-usa': 3,

  // World subcategories
  'europe': 4,
  'asia-pacific': 4,
  'middle-east': 4,
  'africa': 3,
  'latin-america': 3,
  'south-america': 3,

  // Culture subcategories
  'arts': 3,
  'books': 3,
  'film': 3,
  'music': 3,

  // Default for unlisted categories
  'default': 2,
};

/**
 * Minimum article quotas per section
 * Ensures each section has enough content even with deduplication
 */
export const SECTION_QUOTAS = {
  main: {
    featured: 5,
    usa: 12,
    world: 12,
    culture: 8,
    law: 6,
  },
  category: {
    main: 20,
    subcategory: 6,
  },
};

// ============================================================================
// TYPES
// ============================================================================

export interface SectionData {
  categorySlug: string;
  posts: EnhancedPost[];
  priority: number;
}

export interface MainPageData {
  featured: EnhancedPost[];
  usa: EnhancedPost[];
  world: EnhancedPost[];
  culture: EnhancedPost[];
  law: EnhancedPost[];
  categories: Category[];
}

export interface CategoryPageData {
  main: EnhancedPost[];
  subcategories: Record<string, EnhancedPost[]>;
  categories: Category[];
}

// ============================================================================
// PRIORITY & DISTRIBUTION LOGIC
// ============================================================================

/**
 * Calculate priority score for an article-category pair
 *
 * Higher score = article belongs more to this category
 *
 * Scoring factors:
 * - Base category priority (from CATEGORY_PRIORITIES)
 * - Position bonus: +10 if it's the first category in the article
 * - Specificity bonus: +5 for subcategories vs parent categories
 */
function calculateArticleCategoryScore(
  post: Post | EnhancedPost,
  categorySlug: string,
  categoryId: number,
  allCategories: Category[]
): number {
  // Base priority from configuration
  const basePriority = CATEGORY_PRIORITIES[categorySlug] || CATEGORY_PRIORITIES['default'];

  // Position bonus: First category in array gets priority
  const categoryIndex = post.categories.indexOf(categoryId);
  const positionBonus = categoryIndex === 0 ? 10 : 0;

  // Specificity bonus: Subcategories are more specific than parents
  const category = allCategories.find(cat => cat.id === categoryId);
  const specificityBonus = category?.parent !== 0 ? 5 : 0;

  return basePriority + positionBonus + specificityBonus;
}

/**
 * Determine the primary category for an article
 *
 * Returns the category slug where this article should primarily appear
 */
export function getPrimaryCategorySlug(
  post: Post | EnhancedPost,
  allCategories: Category[]
): string | null {
  if (!post.categories || post.categories.length === 0) {
    return null;
  }

  let maxScore = -1;
  let primarySlug: string | null = null;

  for (const categoryId of post.categories) {
    const category = allCategories.find(cat => cat.id === categoryId);
    if (!category) continue;

    const score = calculateArticleCategoryScore(
      post,
      category.slug,
      categoryId,
      allCategories
    );

    if (score > maxScore) {
      maxScore = score;
      primarySlug = category.slug;
    }
  }

  return primarySlug;
}

/**
 * Check if article belongs to a category (including parent categories)
 */
function articleBelongsToCategory(
  post: Post | EnhancedPost,
  categorySlug: string,
  allCategories: Category[]
): boolean {
  const targetCategory = allCategories.find(cat => cat.slug === categorySlug);
  if (!targetCategory) return false;

  // Check direct membership
  if (post.categories.includes(targetCategory.id)) {
    return true;
  }

  // Check if article belongs to any child category
  const childCategories = allCategories.filter(cat => cat.parent === targetCategory.id);
  for (const childCat of childCategories) {
    if (post.categories.includes(childCat.id)) {
      return true;
    }
  }

  return false;
}

/**
 * Distribute articles across sections with deduplication
 *
 * Algorithm:
 * 1. Sort sections by priority (highest first)
 * 2. For each section, assign articles that:
 *    - Belong to that category
 *    - Haven't been used yet
 *    - Meet the section's quota
 * 3. Track used articles globally
 *
 * @param posts - Pool of all available posts
 * @param sections - Sections to distribute to, ordered by priority
 * @param categories - All categories for lookup
 * @returns Deduplicated section data
 */
export function distributeArticles(
  posts: EnhancedPost[],
  sections: Array<{ slug: string; quota: number; priority?: number }>,
  categories: Category[]
): Record<string, EnhancedPost[]> {
  const usedPostIds = new Set<number>();
  const result: Record<string, EnhancedPost[]> = {};

  // Sort sections by priority (higher first)
  const sortedSections = [...sections].sort((a, b) => {
    const priorityA = a.priority ?? (CATEGORY_PRIORITIES[a.slug] || CATEGORY_PRIORITIES['default']);
    const priorityB = b.priority ?? (CATEGORY_PRIORITIES[b.slug] || CATEGORY_PRIORITIES['default']);
    return priorityB - priorityA;
  });

  for (const section of sortedSections) {
    const sectionPosts: EnhancedPost[] = [];

    // Filter posts that belong to this category and haven't been used
    const eligiblePosts = posts.filter(post => {
      if (usedPostIds.has(post.id)) return false;

      // Check if this post belongs to this category
      return articleBelongsToCategory(post, section.slug, categories);
    });

    // Take up to quota
    const postsToTake = eligiblePosts.slice(0, section.quota);

    // Mark as used
    postsToTake.forEach(post => {
      usedPostIds.add(post.id);
      sectionPosts.push(post);
    });

    result[section.slug] = sectionPosts;
  }

  return result;
}

/**
 * Deduplicate articles with strict priority-based assignment
 *
 * Each article appears only once, in its highest-priority section
 */
export function deduplicateByPriority(
  sectionsData: SectionData[]
): SectionData[] {
  const usedPostIds = new Set<number>();

  // Sort by priority (highest first)
  const sorted = [...sectionsData].sort((a, b) => b.priority - a.priority);

  return sorted.map(section => ({
    ...section,
    posts: section.posts.filter(post => {
      if (usedPostIds.has(post.id)) {
        return false;
      }
      usedPostIds.add(post.id);
      return true;
    }),
  }));
}

// ============================================================================
// MAIN PAGE DATA FETCHING
// ============================================================================

/**
 * Fetch and organize data for main page
 *
 * Optimization strategy:
 * 1. Fetch global post pool (50 posts, cached)
 * 2. Fetch categories (cached for 15min)
 * 3. Distribute articles intelligently with deduplication
 *
 * API Calls: 2 (down from 6+)
 */
export async function fetchMainPageData(): Promise<MainPageData> {
  // Parallel fetch: categories + large post pool
  const [allCategories, globalPostPool] = await Promise.all([
    getAllCategories(),
    getAllPosts({ per_page: 50 }), // Larger pool for distribution
  ]);

  // Enhance all posts at once (batch optimization)
  const enhancedPool = await enhancePosts(globalPostPool, allCategories);

  // Define sections with quotas and priorities
  const sections = [
    { slug: 'usa', quota: SECTION_QUOTAS.main.usa, priority: CATEGORY_PRIORITIES['usa'] },
    { slug: 'world', quota: SECTION_QUOTAS.main.world, priority: CATEGORY_PRIORITIES['world'] },
    { slug: 'culture', quota: SECTION_QUOTAS.main.culture, priority: CATEGORY_PRIORITIES['culture'] },
    { slug: 'law', quota: SECTION_QUOTAS.main.law, priority: CATEGORY_PRIORITIES['law'] },
  ];

  // Distribute articles across sections with deduplication
  const distributed = distributeArticles(enhancedPool, sections, allCategories);

  // Featured section: top articles not yet assigned
  const usedIds = new Set<number>();
  Object.values(distributed).forEach(posts => {
    posts.forEach(post => usedIds.add(post.id));
  });

  const featured = enhancedPool
    .filter(post => !usedIds.has(post.id))
    .slice(0, SECTION_QUOTAS.main.featured);

  return {
    featured,
    usa: distributed['usa'] || [],
    world: distributed['world'] || [],
    culture: distributed['culture'] || [],
    law: distributed['law'] || [],
    categories: allCategories,
  };
}

// ============================================================================
// CATEGORY PAGE DATA FETCHING
// ============================================================================

/**
 * Fetch and organize data for a category page
 *
 * Optimization strategy:
 * 1. Fetch main category posts (30, for distribution to subcategories)
 * 2. Fetch categories for mapping
 * 3. Distribute to subcategories with quotas
 *
 * API Calls: 2-3 (down from 8-9)
 *
 * @param categorySlug - Main category slug (e.g., 'world', 'usa')
 * @param subcategories - Array of subcategory slugs
 */
export async function fetchCategoryPageData(
  categorySlug: string,
  subcategories: string[]
): Promise<CategoryPageData> {
  // Parallel fetch: categories + main category posts
  const [allCategories, mainCategoryPosts] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug(categorySlug, { per_page: 40 }), // Larger pool for subcategory distribution
  ]);

  // Enhance all posts
  const enhancedPosts = await enhancePosts(mainCategoryPosts, allCategories);

  // Build sections for subcategories
  const sections = subcategories.map(slug => ({
    slug,
    quota: SECTION_QUOTAS.category.subcategory,
    priority: CATEGORY_PRIORITIES[slug] || CATEGORY_PRIORITIES['default'],
  }));

  // Distribute to subcategories
  const distributed = distributeArticles(enhancedPosts, sections, allCategories);

  // Main section: articles not assigned to any subcategory
  const usedIds = new Set<number>();
  Object.values(distributed).forEach(posts => {
    posts.forEach(post => usedIds.add(post.id));
  });

  const mainPosts = enhancedPosts
    .filter(post => !usedIds.has(post.id))
    .slice(0, SECTION_QUOTAS.category.main);

  return {
    main: mainPosts,
    subcategories: distributed,
    categories: allCategories,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fallback: ensures minimum content for a section
 * Returns primary array if it meets quota, otherwise supplements with fallback
 */
export function ensureMinimumContent(
  primary: EnhancedPost[],
  fallback: EnhancedPost[],
  minimumCount: number
): EnhancedPost[] {
  if (primary.length >= minimumCount) {
    return primary;
  }

  const usedIds = new Set(primary.map(p => p.id));
  const supplemental = fallback.filter(p => !usedIds.has(p.id));

  return [...primary, ...supplemental].slice(0, minimumCount);
}

/**
 * Combine multiple post arrays and deduplicate
 * Useful for "pool" sections that combine multiple categories
 */
export function combineAndDeduplicate(
  ...postArrays: EnhancedPost[][]
): EnhancedPost[] {
  const seen = new Set<number>();
  const result: EnhancedPost[] = [];

  for (const posts of postArrays) {
    for (const post of posts) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        result.push(post);
      }
    }
  }

  return result;
}

/**
 * Combine multiple raw post arrays and deduplicate (for Post[] instead of EnhancedPost[])
 * @internal - used internally before enhancement
 */
function combineAndDeduplicateRaw(
  ...postArrays: Post[][]
): Post[] {
  const seen = new Set<number>();
  const result: Post[] = [];

  for (const posts of postArrays) {
    for (const post of posts) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        result.push(post);
      }
    }
  }

  return result;
}

/**
 * Get posts by multiple category slugs (OR operation)
 * Fetches and deduplicates across multiple categories
 */
export async function getPostsByMultipleCategories(
  categorySlugs: string[],
  limit: number = 20
): Promise<EnhancedPost[]> {
  const categories = await getAllCategories();

  // Fetch from each category in parallel
  const postArrays = await Promise.all(
    categorySlugs.map(slug =>
      getPostsByCategorySlug(slug, { per_page: Math.ceil(limit / categorySlugs.length) })
    )
  );

  // Flatten and deduplicate raw posts
  const combined = combineAndDeduplicateRaw(...postArrays);

  // Enhance and return
  return enhancePosts(combined.slice(0, limit), categories);
}

/**
 * Log API call statistics (useful for debugging optimization)
 */
export function logDataFetchStats(
  pageName: string,
  apiCalls: number,
  totalPosts: number,
  uniquePosts: number
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
📊 Data Fetch Stats - ${pageName}
├─ API Calls: ${apiCalls}
├─ Total Posts Fetched: ${totalPosts}
├─ Unique Posts Used: ${uniquePosts}
└─ Deduplication Rate: ${((1 - uniquePosts / totalPosts) * 100).toFixed(1)}%
    `);
  }
}
