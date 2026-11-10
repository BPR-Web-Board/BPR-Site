# WordPress API Developer Guide

This guide provides a comprehensive overview of the WordPress API functions library. It's designed to help developers quickly understand and use the WordPress API wrapper without having to read through all the function implementations and type definitions.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Core WordPress Objects](#core-wordpress-objects)
- [Posts API](#posts-api)
- [Categories API](#categories-api)
- [Tags API](#tags-api)
- [Pages API](#pages-api)
- [Authors API](#authors-api)
- [Media API](#media-api)
- [Composite Functions](#composite-functions)
- [Magazine issues, palettes & article tags](#magazine-issues-palettes--article-tags)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Overview

This library provides a TypeScript wrapper around the WordPress REST API, making it easy to fetch and interact with WordPress content. It handles the API requests and response parsing, and provides strongly-typed objects for WordPress content types like posts, categories, tags, and authors.

## Getting Started

### Installation

Make sure you have axios installed in your project:

```bash
npm install axios
```

### Configuration

The Next.js frontend is served from Vercel on `brownpoliticalreview.org`. WordPress (the CMS / REST API) lives on the DigitalOcean droplet and is reached at **`https://cms.brownpoliticalreview.org/`**.

Set `WORDPRESS_URL` to that CMS host — not the public site domain — or local and production fetches will hit Next.js instead of WordPress:

```bash
# .env.local (local) and Vercel Project → Environment Variables (Preview + Production)
WORDPRESS_URL=https://cms.brownpoliticalreview.org/
```

```typescript
// Or set it programmatically before importing the API
process.env.WORDPRESS_URL = "https://cms.brownpoliticalreview.org/";
import * as wpApi from "./lib/wordpress";
```

If `WORDPRESS_URL` is unset, the library falls back to `https://brownpoliticalreview.org/`, which no longer serves `/wp-json` after the Vercel cutover. Always set the CMS URL explicitly.

Quick check that the API is reachable:

```bash
curl -s https://cms.brownpoliticalreview.org/wp-json/ | head
# → JSON with "name":"Brown Political Review"
```

## Core WordPress Objects

The API works with the following WordPress objects:

### Post

Represents a WordPress post or article.

Key properties:

- `id`: Unique identifier for the post
- `title.rendered`: The post title
- `content.rendered`: The post content in HTML
- `excerpt.rendered`: Short excerpt of the post
- `slug`: URL-friendly name of the post
- `date`: Publication date
- `author`: ID of the post author
- `featured_media`: ID of the featured image
- `categories`: Array of category IDs
- `tags`: Array of tag IDs

### Category

Represents a content category.

Key properties:

- `id`: Unique identifier
- `name`: Category name
- `slug`: URL-friendly name
- `description`: Category description
- `count`: Number of posts in this category

### Tag

Represents a content tag.

Key properties:

- `id`: Unique identifier
- `name`: Tag name
- `slug`: URL-friendly name
- `description`: Tag description
- `count`: Number of posts with this tag

### Author

Represents a content author.

Key properties:

- `id`: Unique identifier
- `name`: Author's name
- `slug`: URL-friendly name
- `description`: Author bio
- `avatar_urls`: Object containing avatar URLs at different sizes

### FeaturedMedia

Represents a media item (usually an image).

Key properties:

- `id`: Unique identifier
- `source_url`: URL to the media file
- `media_details`: Contains dimensions, file info, and different sizes
- `alt_text`: Alternative text for the image

## Posts API

### Get All Posts

Retrieves a list of posts.

```typescript
import { getAllPosts } from "./lib/wordpress";

// Get all posts (limited to 30 by default)
const posts = await getAllPosts();

// Get posts with filters
const filteredPosts = await getAllPosts({
  author: "5", // Filter by author ID
  tag: "3", // Filter by tag ID
  category: "1", // Filter by category ID
});
```

### Get Post by ID

Retrieves a single post by its ID.

```typescript
import { getPostById } from "./lib/wordpress";

const post = await getPostById(123);
console.log(post.title.rendered); // "Post Title"
```

### Get Post by Slug

Retrieves a single post by its slug.

```typescript
import { getPostBySlug } from "./lib/wordpress";

const post = await getPostBySlug("hello-world");
console.log(post.id); // 123
```

## Categories API

### Get All Categories

Retrieves a list of all categories.

```typescript
import { getAllCategories } from "./lib/wordpress";

const categories = await getAllCategories();
// categories is an array of Category objects
```

### Get Category by ID

Retrieves a single category by its ID.

```typescript
import { getCategoryById } from "./lib/wordpress";

const category = await getCategoryById(5);
console.log(category.name); // "News"
```

### Get Category by Slug

Retrieves a single category by its slug.

```typescript
import { getCategoryBySlug } from "./lib/wordpress";

const category = await getCategoryBySlug("news");
console.log(category.id); // 5
```

### Get Posts by Category

Retrieves all posts in a specific category.

```typescript
import { getPostsByCategory } from "./lib/wordpress";

const posts = await getPostsByCategory(5); // Get posts from category with ID 5
// posts is an array of Post objects
```

## Tags API

### Get All Tags

Retrieves a list of all tags.

```typescript
import { getAllTags } from "./lib/wordpress";

const tags = await getAllTags();
// tags is an array of Tag objects
```

### Get Tag by ID

Retrieves a single tag by its ID.

```typescript
import { getTagById } from "./lib/wordpress";

const tag = await getTagById(3);
console.log(tag.name); // "Politics"
```

### Get Tag by Slug

Retrieves a single tag by its slug.

```typescript
import { getTagBySlug } from "./lib/wordpress";

const tag = await getTagBySlug("politics");
console.log(tag.id); // 3
```

### Get Posts by Tag

Retrieves all posts with a specific tag.

```typescript
import { getPostsByTag } from "./lib/wordpress";

const posts = await getPostsByTag(3); // Get posts with tag ID 3
// posts is an array of Post objects
```

### Get Tags by Post

Retrieves all tags associated with a specific post.

```typescript
import { getTagsByPost } from "./lib/wordpress";

const tags = await getTagsByPost(123); // Get tags for post with ID 123
// tags is an array of Tag objects
```

## Pages API

### Get All Pages

Retrieves a list of all pages.

```typescript
import { getAllPages } from "./lib/wordpress";

const pages = await getAllPages();
// pages is an array of Page objects
```

### Get Page by ID

Retrieves a single page by its ID.

```typescript
import { getPageById } from "./lib/wordpress";

const page = await getPageById(10);
console.log(page.title.rendered); // "About Us"
```

### Get Page by Slug

Retrieves a single page by its slug.

```typescript
import { getPageBySlug } from "./lib/wordpress";

const page = await getPageBySlug("about-us");
console.log(page.id); // 10
```

## Authors API

### Get All Authors

Retrieves a list of all authors.

```typescript
import { getAllAuthors } from "./lib/wordpress";

const authors = await getAllAuthors();
// authors is an array of Author objects
```

### Get Author by ID

Retrieves a single author by ID.

```typescript
import { getAuthorById } from "./lib/wordpress";

const author = await getAuthorById(5);
console.log(author.name); // "Jane Doe"
```

### Get Author by Slug

Retrieves a single author by slug.

```typescript
import { getAuthorBySlug } from "./lib/wordpress";

const author = await getAuthorBySlug("jane-doe");
console.log(author.id); // 5
```

### Get Posts by Author

Retrieves all posts by a specific author.

```typescript
import { getPostsByAuthor } from "./lib/wordpress";

const posts = await getPostsByAuthor(5); // Get posts by author with ID 5
// posts is an array of Post objects
```

## Media API

### Get Featured Media by ID

Retrieves a media item by ID (usually used for featured images).

```typescript
import { getFeaturedMediaById } from "./lib/wordpress";

const media = await getFeaturedMediaById(10);
console.log(media.source_url); // URL to the image
console.log(media.alt_text); // Alt text for the image
```

## Composite Functions

These functions combine multiple API calls for convenience.

### Get Posts by Author Slug

Retrieves all posts by an author, using the author's slug instead of ID.

```typescript
import { getPostsByAuthorSlug } from "./lib/wordpress";

const posts = await getPostsByAuthorSlug("jane-doe");
// posts is an array of Post objects
```

### Get Posts by Category Slug

Retrieves all posts in a category, using the category's slug instead of ID.

```typescript
import { getPostsByCategorySlug } from "./lib/wordpress";

const posts = await getPostsByCategorySlug("news");
// posts is an array of Post objects
```

### Get Posts by Tag Slug

Retrieves all posts with a tag, using the tag's slug instead of ID.

```typescript
import { getPostsByTagSlug } from "./lib/wordpress";

const posts = await getPostsByTagSlug("politics");
// posts is an array of Post objects
```

## Common Use Cases

### Fetching a Post with Author, Categories, and Featured Image

```typescript
import {
  getPostById,
  getAuthorById,
  getCategoryById,
  getFeaturedMediaById,
} from "./lib/wordpress";

async function getCompletePost(postId) {
  // Fetch the post
  const post = await getPostById(postId);

  // Fetch the author
  const author = await getAuthorById(post.author);

  // Fetch categories
  const categories = await Promise.all(
    post.categories.map((categoryId) => getCategoryById(categoryId))
  );

  // Fetch featured image if it exists
  let featuredImage = null;
  if (post.featured_media > 0) {
    featuredImage = await getFeaturedMediaById(post.featured_media);
  }

  // Return complete post object
  return {
    ...post,
    authorData: author,
    categoriesData: categories,
    featuredImageData: featuredImage,
  };
}

// Usage
const completePost = await getCompletePost(123);
```

```typescript
import { getAllPosts, getAuthorById, getCategoryById } from "./lib/wordpress";

async function getBlogHomepage() {
  // Get latest posts
  const posts = await getAllPosts();

  // Get author and primary category for each post
  const postsWithMeta = await Promise.all(
    posts.map(async (post) => {
      const author = await getAuthorById(post.author);

      // Get the first category (primary)
      let primaryCategory = null;
      if (post.categories.length > 0) {
        primaryCategory = await getCategoryById(post.categories[0]);
      }

      return {
        ...post,
        authorData: author,
        primaryCategory,
      };
    })
  );

  return postsWithMeta;
}

// Usage
const blogPosts = await getBlogHomepage();
```

## Error Handling

All API functions use async/await and return promises, so you can use standard JavaScript error handling:

```typescript
import { getPostById } from "./lib/wordpress";

try {
  const post = await getPostById(123);
  // Process post
} catch (error) {
  if (error.response && error.response.status === 404) {
    console.error("Post not found");
  } else {
    console.error("Error fetching post:", error.message);
  }
}
```

## Magazine issues, palettes & article tags

Magazine editions are **not** a separate WP post type. They are parsed from WordPress content, then linked to posts via **tags**. Theme colors flow into CSS variables used by `globals.css` (see `guides/styles.md`).

### Where issue data comes from

`getIssueArchiveSources()` (`src/app/lib/wordpress.ts`) loads:

1. The page with slug `issues-archive` (and embedded featured media)
2. Every post in the `issues-archive` category (paginated)

Each source’s HTML/text is parsed by `parseIssueSource` / `parseIssues` in `src/app/lib/issues.ts`.

### CMS fields (per issue block)

Editors put labeled lines in the archive page/post body (first colon splits key/value):

| Field | Purpose |
|--------|---------|
| `Title:` | Issue title |
| `Published:` | `YYYY-MM-DD` |
| `PDF:` | Link to the flipbook PDF |
| `Background-Color:` | Hex page surface (e.g. `#3d4660`) |
| `Text-Color:` | Hex ink (e.g. `#da9985`) |
| `Cover:` | Optional cover image URL |
| `Issue-Tag:` | Tag slug **or** numeric tag id that marks articles in this issue |

If `Issue-Tag` is omitted, the code derives a slug from the title, e.g. `BPR Spring 2026 Issue 2` → `bpr-spring2026-issue2` (`issueTagFromTitle`).

Defaults when colors are missing: paper `#fffefa` / ink `#0d0b00` (`DEFAULT_ISSUE_BACKGROUND` / `DEFAULT_ISSUE_COLOR`).

### Issue palette → site styles

`getIssueThemeCss(issue)` builds CSS only when WordPress set **custom** background and text (not the site defaults):

```css
:root[data-theme="issue"]{
  --surface:…;
  --foreground:…;
  --text-primary:…;
  --text-secondary:…;
  --text-muted:…;
  --surface-muted:color-mix(…);
  /* hover, skeleton, divider also remapped */
}
```

Magazine layouts (`magazine/(home)`, `magazine/issues/[issue]`) add class `issue-edition` and inject that CSS. The client sets `document.documentElement.dataset.theme = "issue"` on those pages so components using `--surface` / `--foreground` pick up the palette. Light/dark/issue cycling is handled in the nav; see `guides/styles.md` → Themes.

### How articles belong to an issue (tags)

1. In WordPress, create a tag whose **slug** matches `Issue-Tag` (e.g. `bpr-spring2026-issue2`), or use a numeric tag id in the issue block.
2. Assign that tag to every article that appears in the print/online issue.
3. `getIssuePosts(issueTag)` loads all posts with that tag (paginated) for the issue page.
4. On a single article, `findIssueForPost` / `getArticleMagazineMeta` (`src/app/lib/articleIssue.ts`) compare the post’s tag IDs to each issue’s `issueTag` (resolve string slugs via `getTagBySlug`) and return `{ slug, heading }` for kickers / “from the issue” UI.
5. Special features use the fixed tag slug `special-feature` (`SPECIAL_FEATURE_TAG`).

**Checklist for editors**

- Issue block has `Issue-Tag` (or a title that generates the expected `bpr-…` slug)
- Matching WP tag exists and is applied to each article
- Optional: `Background-Color` + `Text-Color` for a custom magazine look

### Related API helpers

| Helper | Role |
|--------|------|
| `getIssueArchiveSources()` | Raw WP pages/posts for the archive |
| `parseIssues(sources)` | Structured `Issue[]` (newest first) |
| `getIssuePosts(tag)` | Posts for one issue tag |
| `getIssueThemeCss(issue)` | Palette CSS string or `""` |
| `formatIssueHeading(title)` | Display title like `Spring 2026 · Issue 2` |
| `getArticleMagazineMeta(post)` | Issue ref + special-feature flag for an article |

## Testing

### Mock Tests

This library comes with comprehensive mock tests to validate API functionality without making actual API requests.

To run the mock tests:

```bash
npm test
```

### Integration Tests

Integration tests are available to test against a real WordPress site.

To run integration tests:

```bash
# Set WordPress URL if needed
export WORDPRESS_URL="https://your-wordpress-site.com"

# Enable integration tests
export INTEGRATION_TESTS=true

# Run tests
npm test
```

---

This guide covers the core functionality of the WordPress API wrapper. For more detailed information about the WordPress REST API itself, refer to the [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/).
