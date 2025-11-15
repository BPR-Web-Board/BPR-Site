# Data Handling Scheme Documentation

## Overview

This document describes the centralized data handling scheme implemented to optimize API calls and ensure proper deduplication across the BPR website.

## Problem Statement

### Before Optimization

**Main Page Issues:**
- Made 6+ separate API calls (getAllPosts, getAllCategories, + 4 category-specific calls)
- Manual deduplication logic scattered across pages
- Potential for duplicate articles appearing in multiple sections
- Inefficient use of caching

**Category Page Issues:**
- World page: 8 API calls (1 categories + 7 subcategories)
- USA page: 10 API calls (1 categories + 9 subcategories)
- Each subcategory fetched independently
- No intelligent distribution of articles

## Solution: Centralized Data Manager

### Architecture

```
┌─────────────────────────────────────────┐
│         Data Manager Layer              │
│     (src/app/lib/dataManager.ts)        │
├─────────────────────────────────────────┤
│  Core Functions:                        │
│  - fetchMainPageData()                  │
│  - fetchCategoryPageData(slug, subs)    │
│  - distributeArticles()                 │
│  - getPrimaryCategorySlug()             │
│  - deduplicateByPriority()              │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│    Category Priority Configuration      │
├─────────────────────────────────────────┤
│  - Priority levels (1-5)                │
│  - Article quotas per section           │
│  - Parent/child relationships           │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         Cache Layer                     │
│     (src/app/lib/cache.ts)              │
├─────────────────────────────────────────┤
│  - Redis (production)                   │
│  - In-memory (development)              │
│  - TTL-based invalidation               │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│      WordPress REST API                 │
└─────────────────────────────────────────┘
```

## Key Features

### 1. Priority-Based Article Distribution

Each category has a priority level that determines which section "claims" an article when it belongs to multiple categories:

**Priority Levels:**
- **5** - Top-level categories (USA, World)
- **4** - Important subcategories (Elections, Europe, Asia-Pacific, Middle East, Culture, Law)
- **3** - Standard subcategories (Education, Environment, Health, Africa, Latin America, etc.)
- **2** - Default for unlisted categories

**Scoring Algorithm:**
```
Priority Score = Base Priority + Position Bonus + Specificity Bonus

Where:
- Base Priority: Category's configured priority (1-5)
- Position Bonus: +10 if article's first category
- Specificity Bonus: +5 for subcategories vs parent categories
```

**Example:**
An article tagged with `[elections, usa, world]`:
- Elections: 4 (base) + 10 (first) + 5 (subcategory) = **19**
- USA: 5 (base) + 0 (not first) + 0 (parent) = **5**
- World: 5 (base) + 0 (not first) + 0 (parent) = **5**

→ Article appears in **Elections** section only

### 2. Quota System

Each section has a guaranteed minimum number of articles:

**Main Page Quotas:**
```typescript
{
  featured: 5,
  usa: 12,
  world: 12,
  culture: 8,
  law: 6,
}
```

**Category Page Quotas:**
```typescript
{
  main: 20,
  subcategory: 6,
}
```

### 3. Smart Deduplication

**Global Deduplication:**
- Tracks all used article IDs across the entire page
- Ensures no article appears twice
- Maintains priority order

**Process:**
1. Sort sections by priority (highest first)
2. For each section, assign articles that:
   - Belong to that category
   - Haven't been used yet
   - Meet the section's quota
3. Mark assigned articles as "used"

### 4. Optimized API Calls

**Main Page:**
- **Before:** 6+ API calls
- **After:** 2 API calls
- **Reduction:** ~67%

**World Page:**
- **Before:** 8 API calls
- **After:** 2 API calls
- **Reduction:** 75%

**USA Page:**
- **Before:** 10 API calls
- **After:** 2 API calls
- **Reduction:** 80%

## Usage

### Main Page

```typescript
import { fetchMainPageData, logDataFetchStats } from './lib/dataManager';

const pageData = await fetchMainPageData();

const {
  featured,      // Top articles for hero section
  usa,          // USA section articles (deduplicated)
  world,        // World section articles (deduplicated)
  culture,      // Culture section articles (deduplicated)
  law,          // Law section articles (deduplicated)
  categories,   // All categories for mapping
} = pageData;
```

### Category Pages

```typescript
import {
  fetchCategoryPageData,
  ensureMinimumContent,
  combineAndDeduplicate
} from '../lib/dataManager';

// Fetch data for a category and its subcategories
const pageData = await fetchCategoryPageData('world', [
  'europe',
  'asia-pacific',
  'middle-east',
  'africa',
  'latin-america',
  'south-america',
]);

const {
  main: worldPosts,      // Articles not in any subcategory
  subcategories,         // Subcategory articles (deduplicated)
  categories
} = pageData;

// Access subcategory posts
const europePosts = subcategories['europe'] || [];
const asiaPosts = subcategories['asia-pacific'] || [];

// Ensure minimum content with fallback
const europeSpotlight = ensureMinimumContent(
  europePosts,    // Primary source
  worldPosts,     // Fallback if primary is empty
  7               // Minimum count
).slice(0, 7);

// Combine multiple categories with deduplication
const americasPool = combineAndDeduplicate(
  latinAmericaPosts,
  southAmericaPosts,
  worldPosts
);
```

## API Reference

### Core Functions

#### `fetchMainPageData()`

Fetches and organizes data for the main page.

**Returns:** `Promise<MainPageData>`

```typescript
interface MainPageData {
  featured: EnhancedPost[];
  usa: EnhancedPost[];
  world: EnhancedPost[];
  culture: EnhancedPost[];
  law: EnhancedPost[];
  categories: Category[];
}
```

**API Calls:** 2
- `getAllCategories()` - cached for 15 minutes
- `getAllPosts({ per_page: 50 })` - cached for 5 minutes

---

#### `fetchCategoryPageData(categorySlug, subcategories)`

Fetches and organizes data for a category page.

**Parameters:**
- `categorySlug: string` - Main category slug (e.g., 'world', 'usa')
- `subcategories: string[]` - Array of subcategory slugs

**Returns:** `Promise<CategoryPageData>`

```typescript
interface CategoryPageData {
  main: EnhancedPost[];
  subcategories: Record<string, EnhancedPost[]>;
  categories: Category[];
}
```

**API Calls:** 2
- `getAllCategories()` - cached for 15 minutes
- `getPostsByCategorySlug(categorySlug, 40)` - cached for 5 minutes

---

#### `distributeArticles(posts, sections, categories)`

Distributes articles across sections with priority-based deduplication.

**Parameters:**
- `posts: EnhancedPost[]` - Pool of available posts
- `sections: Array<{ slug, quota, priority? }>` - Sections to distribute to
- `categories: Category[]` - All categories for lookup

**Returns:** `Record<string, EnhancedPost[]>`

**Example:**
```typescript
const distributed = distributeArticles(
  enhancedPosts,
  [
    { slug: 'usa', quota: 12, priority: 5 },
    { slug: 'world', quota: 12, priority: 5 },
    { slug: 'culture', quota: 8, priority: 4 },
  ],
  allCategories
);

// distributed = {
//   'usa': [...12 unique articles...],
//   'world': [...12 unique articles...],
//   'culture': [...8 unique articles...],
// }
```

---

#### `getPrimaryCategorySlug(post, categories)`

Determines the primary category for an article based on priority scoring.

**Parameters:**
- `post: Post` - The article
- `categories: Category[]` - All categories

**Returns:** `string | null` - Primary category slug

---

#### `ensureMinimumContent(primary, fallback, minimumCount)`

Ensures a section has minimum content by supplementing with fallback if needed.

**Parameters:**
- `primary: EnhancedPost[]` - Primary content source
- `fallback: EnhancedPost[]` - Fallback content source
- `minimumCount: number` - Minimum articles required

**Returns:** `EnhancedPost[]`

---

#### `combineAndDeduplicate(...postArrays)`

Combines multiple post arrays and removes duplicates.

**Parameters:**
- `...postArrays: EnhancedPost[][]` - Arrays to combine

**Returns:** `EnhancedPost[]`

---

#### `logDataFetchStats(pageName, apiCalls, totalPosts, uniquePosts)`

Logs data fetch statistics in development mode.

**Parameters:**
- `pageName: string` - Name of the page
- `apiCalls: number` - Number of API calls made
- `totalPosts: number` - Total posts fetched
- `uniquePosts: number` - Unique posts used

**Output (development only):**
```
📊 Data Fetch Stats - Main Page
├─ API Calls: 2
├─ Total Posts Fetched: 50
├─ Unique Posts Used: 37
└─ Deduplication Rate: 26.0%
```

## Configuration

### Category Priorities

Defined in `CATEGORY_PRIORITIES` object in `dataManager.ts`:

```typescript
export const CATEGORY_PRIORITIES: Record<string, number> = {
  // Top-level categories
  'usa': 5,
  'world': 5,
  'culture': 4,
  'law': 4,

  // USA subcategories
  'elections': 4,
  'education': 3,
  'environment': 3,
  // ... more

  // World subcategories
  'europe': 4,
  'asia-pacific': 4,
  // ... more

  // Default fallback
  'default': 2,
};
```

**To add a new category:**
1. Add the category slug and priority to `CATEGORY_PRIORITIES`
2. Higher number = higher priority
3. Use 5 for top-level, 4 for important subcategories, 3 for standard

### Section Quotas

Defined in `SECTION_QUOTAS` object:

```typescript
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
```

**To adjust quotas:**
1. Edit the `SECTION_QUOTAS` object
2. Main page quotas are per-section
3. Category page quotas are general guidelines

## Benefits

### Performance

1. **Reduced API Calls**
   - Main page: 67% reduction (6 → 2 calls)
   - World page: 75% reduction (8 → 2 calls)
   - USA page: 80% reduction (10 → 2 calls)

2. **Better Cache Utilization**
   - Larger single fetches leverage cache more effectively
   - Batch operations reduce N+1 queries
   - Cross-page data reuse potential

3. **Faster Page Loads**
   - Fewer network requests
   - Parallel processing where possible
   - Optimized data enhancement

### User Experience

1. **No Duplicate Articles**
   - Guaranteed unique articles across all sections
   - Cleaner, more professional appearance
   - Better content distribution

2. **Consistent Content**
   - Priority-based assignment ensures articles appear in most relevant section
   - Fallback mechanisms prevent empty sections
   - Quota system ensures minimum content

3. **Maintainability**
   - Centralized logic in `dataManager.ts`
   - Easy to adjust priorities and quotas
   - Clear documentation and examples

## Migration Guide

### Converting Existing Pages

**Before:**
```typescript
const [categories, usaPosts, worldPosts, culturePosts] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("usa", 15),
  getPostsByCategorySlug("world", 15),
  getPostsByCategorySlug("culture", 10),
]);

const [enhancedUsa, enhancedWorld, enhancedCulture] = await Promise.all([
  enhancePosts(usaPosts, categories),
  enhancePosts(worldPosts, categories),
  enhancePosts(culturePosts, categories),
]);

const sectionsData = [
  { categorySlug: "usa", posts: enhancedUsa },
  { categorySlug: "world", posts: enhancedWorld },
  { categorySlug: "culture", posts: enhancedCulture },
];

const deduplicatedSections = deduplicateArticlesBySections(sectionsData);
```

**After:**
```typescript
import { fetchMainPageData } from './lib/dataManager';

const { usa, world, culture, categories } = await fetchMainPageData();
// Data is already enhanced and deduplicated!
```

**For Category Pages:**

**Before:**
```typescript
const [categories, worldPosts, europePosts, asiaPosts] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("world", 24),
  getPostsByCategorySlug("europe", 8),
  getPostsByCategorySlug("asia-pacific", 8),
]);

const enhanced = await Promise.all([
  enhancePosts(worldPosts, categories),
  enhancePosts(europePosts, categories),
  enhancePosts(asiaPosts, categories),
]);
```

**After:**
```typescript
import { fetchCategoryPageData } from '../lib/dataManager';

const pageData = await fetchCategoryPageData('world', ['europe', 'asia-pacific']);
const { main: worldPosts, subcategories, categories } = pageData;

const europePosts = subcategories['europe'] || [];
const asiaPosts = subcategories['asia-pacific'] || [];
```

## Testing

### Verify Deduplication

1. **Check Development Logs:**
   ```
   📊 Data Fetch Stats - Main Page
   ├─ API Calls: 2
   ├─ Total Posts Fetched: 50
   ├─ Unique Posts Used: 37
   └─ Deduplication Rate: 26.0%
   ```

2. **Manual Verification:**
   - Inspect rendered page
   - Search for duplicate article IDs
   - Verify no article appears in multiple sections

3. **Priority Testing:**
   - Find an article tagged with multiple categories
   - Verify it appears in the highest-priority category only
   - Check that lower-priority sections don't show it

### Performance Testing

1. **Network Tab:**
   - Open browser DevTools → Network
   - Filter by 'wp-json'
   - Count API requests
   - Should see 2 requests for main page, 2 for category pages

2. **Cache Hit Rate:**
   - Monitor cache statistics endpoint: `/api/cache-stats`
   - Higher hit rate = better performance

## Troubleshooting

### Empty Sections

**Problem:** A section shows no articles

**Solutions:**
1. Check if quota is too high for available content
2. Verify category slug is correct
3. Check if all articles claimed by higher-priority sections
4. Use `ensureMinimumContent()` with fallback

### Duplicate Articles

**Problem:** Same article appears in multiple sections

**Solutions:**
1. Verify using data manager functions (not manual fetching)
2. Check that deduplication is enabled
3. Ensure not mixing old and new approaches

### Wrong Section Assignment

**Problem:** Article appears in unexpected section

**Solutions:**
1. Review `CATEGORY_PRIORITIES` configuration
2. Check article's category array order
3. Verify category parent/child relationships
4. Use `getPrimaryCategorySlug()` to debug assignment

## Future Enhancements

### Potential Improvements

1. **Smart Prefetching**
   - Predict next page user will visit
   - Prefetch category page data
   - Reduce perceived load time

2. **Personalization**
   - User reading history
   - Adjust priorities based on preferences
   - Filter out already-read articles

3. **A/B Testing**
   - Test different priority configurations
   - Measure engagement by section
   - Optimize quotas dynamically

4. **Real-time Updates**
   - WebSocket integration
   - Live article updates
   - Dynamic cache invalidation

5. **Analytics Integration**
   - Track deduplication rate
   - Monitor API call reduction
   - Measure cache hit rates

## Summary

The centralized data handling scheme provides:

✅ **60-80% reduction in API calls**
✅ **Guaranteed article deduplication**
✅ **Priority-based intelligent distribution**
✅ **Better cache utilization**
✅ **Maintainable, documented codebase**
✅ **Flexible configuration**
✅ **Improved user experience**

All while maintaining the same visual layout and user experience as before.
