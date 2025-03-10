/**
 * Integration tests for WordPress API
 *
 * These tests make actual API calls to a WordPress site.
 * To run these tests:
 * 1. Set WORDPRESS_URL environment variable to your WordPress site URL
 * 2. Make sure your WordPress site has REST API enabled
 * 3. Run with: INTEGRATION_TESTS=true npm test
 */

import * as wpApi from "../lib/wordpress";

// Only run these tests if explicitly enabled
console.log(process.env.INTEGRATION_TESTS);
const runIntegrationTests = process.env.INTEGRATION_TESTS === "true";

// Skip all tests if integration tests are disabled
const testRunner = runIntegrationTests ? describe : describe.skip;

// Set longer timeout since we're making real API calls
jest.setTimeout(10000);

testRunner("WordPress API Integration Tests", () => {
  // Store IDs for reuse across tests
  let postId: number;
  let categoryId: number;
  let tagId: number;
  let authorId: number;
  let mediaId: number;

  // Helper function to check post structure
  const validatePostStructure = (post: any) => {
    expect(post).toHaveProperty("id");
    expect(post).toHaveProperty("title.rendered");
    expect(post).toHaveProperty("content.rendered");
    expect(post).toHaveProperty("excerpt.rendered");
    expect(post).toHaveProperty("slug");
    expect(post).toHaveProperty("date");
  };

  // Test Posts API
  describe("Posts API", () => {
    test("getAllPosts returns valid posts", async () => {
      const posts = await wpApi.getAllPosts();

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);

      // Save first post ID for later tests
      postId = posts[0].id;

      // Validate post structure
      validatePostStructure(posts[0]);
    });

    test("getPostById returns valid post", async () => {
      // Skip if we don't have a post ID
      if (!postId) {
        console.warn("Skipping getPostById test - no post ID available");
        return;
      }

      const post = await wpApi.getPostById(postId);
      expect(post.id).toBe(postId);
      validatePostStructure(post);
    });

    test("getPostBySlug returns valid post", async () => {
      // Skip if we don't have a post ID
      if (!postId) {
        console.warn("Skipping getPostBySlug test - no post ID available");
        return;
      }

      // First get a post to get its slug
      const post = await wpApi.getPostById(postId);
      const slug = post.slug;

      // Then get post by slug
      const postBySlug = await wpApi.getPostBySlug(slug);
      expect(postBySlug.id).toBe(postId);
      validatePostStructure(postBySlug);
    });
  });

  // Test Categories API
  describe("Categories API", () => {
    test("getAllCategories returns valid categories", async () => {
      const categories = await wpApi.getAllCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Save first category ID for later tests
      categoryId = categories[0].id;

      // Validate category structure
      expect(categories[0]).toHaveProperty("id");
      expect(categories[0]).toHaveProperty("name");
      expect(categories[0]).toHaveProperty("slug");
    });

    test("getCategoryById returns valid category", async () => {
      // Skip if we don't have a category ID
      if (!categoryId) {
        console.warn(
          "Skipping getCategoryById test - no category ID available"
        );
        return;
      }

      const category = await wpApi.getCategoryById(categoryId);
      expect(category.id).toBe(categoryId);
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
    });

    test("getPostsByCategory returns valid posts", async () => {
      // Skip if we don't have a category ID
      if (!categoryId) {
        console.warn(
          "Skipping getPostsByCategory test - no category ID available"
        );
        return;
      }

      const posts = await wpApi.getPostsByCategory(categoryId);
      expect(Array.isArray(posts)).toBe(true);

      // Some categories might not have posts, so only validate if there are posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });
  });

  // Test Tags API
  describe("Tags API", () => {
    test("getAllTags returns valid tags", async () => {
      const tags = await wpApi.getAllTags();

      expect(Array.isArray(tags)).toBe(true);

      // Some sites might not have tags
      if (tags.length > 0) {
        // Save first tag ID for later tests
        tagId = tags[0].id;

        // Validate tag structure
        expect(tags[0]).toHaveProperty("id");
        expect(tags[0]).toHaveProperty("name");
        expect(tags[0]).toHaveProperty("slug");
      } else {
        console.warn("No tags found in the WordPress site");
      }
    });

    test("getTagById returns valid tag", async () => {
      // Skip if we don't have a tag ID
      if (!tagId) {
        console.warn("Skipping getTagById test - no tag ID available");
        return;
      }

      const tag = await wpApi.getTagById(tagId);
      expect(tag.id).toBe(tagId);
      expect(tag).toHaveProperty("name");
      expect(tag).toHaveProperty("slug");
    });

    test("getPostsByTag returns valid posts", async () => {
      // Skip if we don't have a tag ID
      if (!tagId) {
        console.warn("Skipping getPostsByTag test - no tag ID available");
        return;
      }

      const posts = await wpApi.getPostsByTag(tagId);
      expect(Array.isArray(posts)).toBe(true);

      // Some tags might not have posts, so only validate if there are posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });
  });

  // Test Authors API
  describe("Authors API", () => {
    test("getAllAuthors returns valid authors", async () => {
      const authors = await wpApi.getAllAuthors();

      expect(Array.isArray(authors)).toBe(true);
      expect(authors.length).toBeGreaterThan(0);

      // Save first author ID for later tests
      authorId = authors[0].id;

      // Validate author structure
      expect(authors[0]).toHaveProperty("id");
      expect(authors[0]).toHaveProperty("name");
      expect(authors[0]).toHaveProperty("slug");
    });

    test("getAuthorById returns valid author", async () => {
      // Skip if we don't have an author ID
      if (!authorId) {
        console.warn("Skipping getAuthorById test - no author ID available");
        return;
      }

      const author = await wpApi.getAuthorById(authorId);
      expect(author.id).toBe(authorId);
      expect(author).toHaveProperty("name");
      expect(author).toHaveProperty("slug");
    });

    test("getPostsByAuthor returns valid posts", async () => {
      // Skip if we don't have an author ID
      if (!authorId) {
        console.warn("Skipping getPostsByAuthor test - no author ID available");
        return;
      }

      const posts = await wpApi.getPostsByAuthor(authorId);
      expect(Array.isArray(posts)).toBe(true);

      // Some authors might not have posts, so only validate if there are posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });
  });

  // Test Media API
  describe("Media API", () => {
    // This test depends on posts having featured media
    test("getFeaturedMediaById returns valid media", async () => {
      // First, we need to find a post with featured media
      const posts = await wpApi.getAllPosts();

      // Find first post with featured media
      const postWithMedia = posts.find((post) => post.featured_media > 0);

      if (!postWithMedia) {
        console.warn(
          "Skipping getFeaturedMediaById test - no post with featured media found"
        );
        return;
      }

      mediaId = postWithMedia.featured_media;

      const media = await wpApi.getFeaturedMediaById(mediaId);
      expect(media.id).toBe(mediaId);
      expect(media).toHaveProperty("media_type");
      expect(media).toHaveProperty("source_url");
    });
  });

  // Test composite functions
  describe("Composite Functions", () => {
    test("getPostsByAuthorSlug returns valid posts", async () => {
      // Skip if we don't have an author ID
      if (!authorId) {
        console.warn(
          "Skipping getPostsByAuthorSlug test - no author ID available"
        );
        return;
      }

      // First get an author to get its slug
      const author = await wpApi.getAuthorById(authorId);
      const slug = author.slug;

      const posts = await wpApi.getPostsByAuthorSlug(slug);
      expect(Array.isArray(posts)).toBe(true);

      // The author might not have posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });

    test("getPostsByCategorySlug returns valid posts", async () => {
      // Skip if we don't have a category ID
      if (!categoryId) {
        console.warn(
          "Skipping getPostsByCategorySlug test - no category ID available"
        );
        return;
      }

      // First get a category to get its slug
      const category = await wpApi.getCategoryById(categoryId);
      const slug = category.slug;

      const posts = await wpApi.getPostsByCategorySlug(slug);
      expect(Array.isArray(posts)).toBe(true);

      // The category might not have posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });

    test("getPostsByTagSlug returns valid posts", async () => {
      // Skip if we don't have a tag ID
      if (!tagId) {
        console.warn("Skipping getPostsByTagSlug test - no tag ID available");
        return;
      }

      // First get a tag to get its slug
      const tag = await wpApi.getTagById(tagId);
      const slug = tag.slug;

      const posts = await wpApi.getPostsByTagSlug(slug);
      expect(Array.isArray(posts)).toBe(true);

      // The tag might not have posts
      if (posts.length > 0) {
        validatePostStructure(posts[0]);
      }
    });
  });
});
