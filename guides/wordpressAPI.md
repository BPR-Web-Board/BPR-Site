# WordPress API Integration Guide

This document provides a detailed breakdown of the TypeScript types and functions used to interact with the WordPress REST API. It covers the types defined in `wordpress.d.ts` and the functions in `wordpress.ts`, explaining the purpose of each and how to use them effectively for the Brown Poltical Review.

---

## Table of Contents

- [Introduction](#introduction)
- [Type Definitions (`wordpress.d.ts`)](#type-definitions-wordpressdts)
  - [Post](#post)
  - [Category](#category)
  - [Tag](#tag)
  - [Page](#page)
  - [Author](#author)
  - [FeaturedMedia](#featuredmedia)
  - [Additional Types](#additional-types)
- [WordPress API Functions (`wordpress.ts`)](#wordpress-api-functions-wordpressts)
  - [Configuration](#configuration)
  - [Utility Functions](#utility-functions)
  - [Fetching Posts](#fetching-posts)
  - [Fetching Categories](#fetching-categories)
  - [Fetching Tags](#fetching-tags)
  - [Fetching Pages](#fetching-pages)
  - [Fetching Authors](#fetching-authors)
  - [Fetching Featured Media](#fetching-featured-media)
- [Using the API Functions](#using-the-api-functions)
  - [Example: Fetching and Displaying a Post](#example-fetching-and-displaying-a-post)
- [Conclusion](#conclusion)

---

## Introduction

The WordPress REST API allows developers to interact with WordPress content programmatically. This guide explains the TypeScript types that define the structure of WordPress data and the functions that fetch this data using the REST API. Understanding these will help you integrate WordPress content seamlessly into your applications.

---

## Type Definitions (`wordpress.d.ts`)

TypeScript declaration files (`.d.ts`) define the shapes of data objects, enabling type checking and IntelliSense in your code editor. Below are the key types and their attributes.

### Post

Represents a blog post in WordPress.

```typescript
export type Post = {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  sticky: boolean;
  template: string;
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  meta: any[];
  categories: number[];
  tags: number[];
};
```

**Attributes Explained:**

- `id`: Unique identifier for the post.
- `date`: The date the post was published (local time).
- `date_gmt`: The date the post was published (GMT).
- `guid`: Globally unique identifier.
  - `rendered`: The GUID value.
- `modified`: The date the post was last modified (local time).
- `modified_gmt`: The date the post was last modified (GMT).
- `slug`: URL-friendly name of the post.
- `status`: Publication status (e.g., "publish", "draft").
- `type`: Post type (usually "post").
- `link`: URL to the post on the website.
- `title`: The title of the post.
  - `rendered`: HTML-rendered title.
- `content`: The content body of the post.
  - `rendered`: HTML-rendered content.
  - `protected`: Indicates if the content is password-protected.
- `excerpt`: A summary or excerpt of the post.
  - `rendered`: HTML-rendered excerpt.
  - `protected`: Indicates if the excerpt is password-protected.
- `author`: ID of the author who wrote the post.
- `featured_media`: ID of the featured image/media.
- `comment_status`: Commenting status ("open" or "closed").
- `ping_status`: Pingback status ("open" or "closed").
- `sticky`: Indicates if the post is sticky (pinned).
- `template`: The theme template file used.
- `format`: The format of the post (e.g., "standard", "gallery").
- `meta`: Meta fields attached to the post.
- `categories`: Array of category IDs.
- `tags`: Array of tag IDs.

### Category

Represents a category assigned to posts.

```typescript
export type Category = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "category";
  parent: number;
  meta: any[];
};
```

**Attributes Explained:**

- `id`: Unique identifier for the category.
- `count`: Number of posts in the category.
- `description`: Description of the category.
- `link`: URL to the category page.
- `name`: Display name of the category.
- `slug`: URL-friendly name.
- `taxonomy`: Type of taxonomy (always "category" for categories).
- `parent`: ID of the parent category (if any).
- `meta`: Meta fields associated with the category.

### Tag

Represents a tag assigned to posts.

```typescript
export type Tag = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "post_tag";
  meta: any[];
};
```

**Attributes Explained:**

- Similar to `Category`, but `taxonomy` is "post_tag".

### Page

Represents a static page in WordPress.

```typescript
export type Page = {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  template: string;
  meta: any[];
};
```

**Attributes Explained:**

- Similar to `Post`, with additional fields:
  - `parent`: ID of the parent page.
  - `menu_order`: Order of the page in menus.

### Author

Represents a user who authors content.

```typescript
export type Author = {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: { [key: string]: string };
  meta: any[];
};
```

**Attributes Explained:**

- `id`: Unique identifier for the author.
- `name`: Display name of the author.
- `url`: URL of the author's website or profile.
- `description`: Biographical information.
- `link`: URL to the author's page.
- `slug`: URL-friendly name.
- `avatar_urls`: Object containing avatar images of various sizes.
- `meta`: Meta fields associated with the author.

### FeaturedMedia

Represents media items, such as images.

```typescript
export type FeaturedMedia = {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  caption: { rendered: string };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  source_url: string;
};
```

**Attributes Explained:**

- `id`, `date`, `slug`, `link`, `title`, `author`: Standard attributes.
- `caption`: Caption for the media.
  - `rendered`: HTML-rendered caption.
- `alt_text`: Alternative text for the media.
- `media_type`: Type of media (e.g., "image").
- `mime_type`: MIME type (e.g., "image/jpeg").
- `media_details`: Details about the media.
  - `width`, `height`: Dimensions.
  - `file`: File name.
  - `sizes`: Various sizes of the media.
- `source_url`: Direct URL to the media file.

### Additional Types

- **BlockType**, **EditorBlock**, **TemplatePart**, **SearchResult**: These types are used for more advanced features like block editing, templates, and search results. They are defined similarly, with attributes pertinent to their functionality.

---

## WordPress API Functions (`wordpress.ts`)

These functions fetch data from a WordPress site using the REST API. They use the types defined in `wordpress.d.ts` for strong typing.

### Configuration

```typescript
const baseUrl = process.env.WORDPRESS_URL;

function getUrl(path: string, query?: Record<string, any>) {
  const params = query ? querystring.stringify(query) : null;
  const baseUrl = "https://brownpoliticalreview.org/";
  return `${baseUrl}${path}${params ? `?${params}` : ""}`;
}
```

- **`baseUrl`**: The base URL of the WordPress site.
- **`getUrl`**: Constructs the full API endpoint URL with query parameters.

### Utility Functions

- **Importing Modules**:

  ```typescript
  import querystring from "query-string";
  import {
    Post,
    Category,
    Tag,
    Page,
    Author,
    FeaturedMedia,
  } from "./wordpress.d";
  ```

### Fetching Posts

- **Get All Posts**:

  ```typescript
  export async function getAllPosts(filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
  }): Promise<Post[]> {
    const url = getUrl("/wp-json/wp/v2/posts", {
      per_page: 30,
      author: filterParams?.author,
      tags: filterParams?.tag,
      categories: filterParams?.category,
    });
    const response = await fetch(url);
    const posts: Post[] = await response.json();
    return posts;
  }
  ```

  - **Purpose**: Fetches all posts, optionally filtering by author, tag, or category.
  - **Parameters**: `filterParams` may include `author`, `tag`, `category` IDs as strings.
  - **Returns**: An array of `Post` objects.

- **Get Post by ID**:

  ```typescript
  export async function getPostById(id: number): Promise<Post> {
    const url = getUrl(`/wp-json/wp/v2/posts/${id}`);
    const response = await fetch(url);
    const post: Post = await response.json();
    return post;
  }
  ```

  - **Purpose**: Fetches a post by its unique ID.

- **Get Post by Slug**:

  ```typescript
  export async function getPostBySlug(slug: string): Promise<Post> {
    const url = getUrl("/wp-json/wp/v2/posts", { slug });
    const response = await fetch(url);
    const post: Post[] = await response.json();
    return post[0];
  }
  ```

  - **Purpose**: Fetches a post using its slug (URL-friendly name).

- **Get Posts by Category ID**:

  ```typescript
  export async function getPostsByCategory(
    categoryId: number
  ): Promise<Post[]> {
    const url = getUrl("/wp-json/wp/v2/posts", { categories: categoryId });
    const response = await fetch(url);
    const posts: Post[] = await response.json();
    return posts;
  }
  ```

  - **Purpose**: Fetches posts belonging to a specific category.

- **Get Posts by Tag ID**:

  ```typescript
  export async function getPostsByTag(tagId: number): Promise<Post[]> {
    const url = getUrl("/wp-json/wp/v2/posts", { tags: tagId });
    const response = await fetch(url);
    const posts: Post[] = await response.json();
    return posts;
  }
  ```

### Fetching Categories

- **Get All Categories**:

  ```typescript
  export async function getAllCategories(): Promise<Category[]> {
    const url = getUrl("/wp-json/wp/v2/categories");
    const response = await fetch(url);
    const categories: Category[] = await response.json();
    return categories;
  }
  ```

- **Get Category by ID**:

  ```typescript
  export async function getCategoryById(id: number): Promise<Category> {
    const url = getUrl(`/wp-json/wp/v2/categories/${id}`);
    const response = await fetch(url);
    const category: Category = await response.json();
    return category;
  }
  ```

- **Get Category by Slug**:

  ```typescript
  export async function getCategoryBySlug(slug: string): Promise<Category> {
    const url = getUrl("/wp-json/wp/v2/categories", { slug });
    const response = await fetch(url);
    const category: Category[] = await response.json();
    return category[0];
  }
  ```

### Fetching Tags

- **Get All Tags**:

  ```typescript
  export async function getAllTags(): Promise<Tag[]> {
    const url = getUrl("/wp-json/wp/v2/tags");
    const response = await fetch(url);
    const tags: Tag[] = await response.json();
    return tags;
  }
  ```

- **Get Tag by ID**:

  ```typescript
  export async function getTagById(id: number): Promise<Tag> {
    const url = getUrl(`/wp-json/wp/v2/tags/${id}`);
    const response = await fetch(url);
    const tag: Tag = await response.json();
    return tag;
  }
  ```

- **Get Tag by Slug**:

  ```typescript
  export async function getTagBySlug(slug: string): Promise<Tag> {
    const url = getUrl("/wp-json/wp/v2/tags", { slug });
    const response = await fetch(url);
    const tag: Tag[] = await response.json();
    return tag[0];
  }
  ```

### Fetching Pages

- **Get All Pages**:

  ```typescript
  export async function getAllPages(): Promise<Page[]> {
    const url = getUrl("/wp-json/wp/v2/pages");
    const response = await fetch(url);
    const pages: Page[] = await response.json();
    return pages;
  }
  ```

- **Get Page by ID**:

  ```typescript
  export async function getPageById(id: number): Promise<Page> {
    const url = getUrl(`/wp-json/wp/v2/pages/${id}`);
    const response = await fetch(url);
    const page: Page = await response.json();
    return page;
  }
  ```

- **Get Page by Slug**:

  ```typescript
  export async function getPageBySlug(slug: string): Promise<Page> {
    const url = getUrl("/wp-json/wp/v2/pages", { slug });
    const response = await fetch(url);
    const page: Page[] = await response.json();
    return page[0];
  }
  ```

### Fetching Authors

- **Get All Authors**:

  ```typescript
  export async function getAllAuthors(): Promise<Author[]> {
    const url = getUrl("/wp-json/wp/v2/users");
    const response = await fetch(url);
    const authors: Author[] = await response.json();
    return authors;
  }
  ```

- **Get Author by ID**:

  ```typescript
  export async function getAuthorById(id: number): Promise<Author> {
    const url = getUrl(`/wp-json/wp/v2/users/${id}`);
    const response = await fetch(url);
    const author: Author = await response.json();
    return author;
  }
  ```

- **Get Author by Slug**:

  ```typescript
  export async function getAuthorBySlug(slug: string): Promise<Author> {
    const url = getUrl("/wp-json/wp/v2/users", { slug });
    const response = await fetch(url);
    const author: Author[] = await response.json();
    return author[0];
  }
  ```

### Fetching Featured Media

- **Get Featured Media by ID**:

  ```typescript
  export async function getFeaturedMediaById(
    id: number
  ): Promise<FeaturedMedia> {
    const url = getUrl(`/wp-json/wp/v2/media/${id}`);
    const response = await fetch(url);
    const featuredMedia: FeaturedMedia = await response.json();
    return featuredMedia;
  }
  ```

---

## Using the API Functions

Below is an example of how to use these functions in your application.

### Example: Fetching and Displaying a Post

**Objective**: Fetch a post by its slug and display its title, content, and author name.

```typescript
import { getPostBySlug, getAuthorById } from "./wordpress";

// Function to display a post
async function displayPost(slug: string) {
  try {
    // Fetch the post by slug
    const post = await getPostBySlug(slug);

    // Extract post details
    const { title, content, author: authorId } = post;

    // Fetch the author's details
    const author = await getAuthorById(authorId);

    // Display the post
    console.log("Title:", title.rendered);
    console.log("Author:", author.name);
    console.log("Content:", content.rendered);
  } catch (error) {
    console.error("Error fetching post:", error);
  }
}

// Usage
displayPost("example-post-slug");
```

**Explanation**:

1. **Import Necessary Functions**: Import `getPostBySlug` and `getAuthorById` from the API functions.

2. **Fetch the Post**:

   - Call `getPostBySlug(slug)` to fetch the post data.
   - Destructure the `title`, `content`, and `author` ID from the post.

3. **Fetch the Author**:

   - Use `getAuthorById(authorId)` to get the author's details.

4. **Display the Post**:

   - Use `console.log` to print the post's title, author's name, and content.
   - Note that `title.rendered` and `content.rendered` contain the HTML-rendered strings.

**Handling HTML Content**:

- The `rendered` fields contain HTML content. When displaying this content in a web page, ensure you handle it safely to avoid XSS vulnerabilities.
- In frameworks like React, use `dangerouslySetInnerHTML` cautiously.

**Example in React**:

```jsx
import React, { useEffect, useState } from "react";
import { getPostBySlug, getAuthorById, Post } from "./wordpress";

function PostComponent({ slug }) {
  const [post, setPost] = (useState < Post) | (null > null);
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const postData = await getPostBySlug(slug);
        setPost(postData);

        const authorData = await getAuthorById(postData.author);
        setAuthorName(authorData.name);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }

    fetchPost();
  }, [slug]);

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <h1>{post.title.rendered}</h1>
      <p>By {authorName}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </div>
  );
}

export default PostComponent;
```

---

## Conclusion

This guide provides an overview of how to work with the WordPress REST API using TypeScript. By understanding the data types and functions provided, you can efficiently fetch and display WordPress content within your applications.

**Tips**:

- **Error Handling**: Always include error handling when working with asynchronous functions.
- **Pagination**: The WordPress REST API supports pagination. Adjust your queries accordingly if you need to handle large datasets.
- **Caching**: Consider caching responses to improve performance and reduce API calls.
- **Security**: Be mindful of security, especially when rendering HTML content from external sources.

---

Happy coding!
