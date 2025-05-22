import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getPostsByCategory,
  getAllTags,
  getTagById,
  getTagBySlug,
  getPostsByTag,
  getAllPages,
  getPageById,
  getPageBySlug,
  getAllAuthors,
  getAuthorById,
  getAuthorBySlug,
  getPostsByAuthor,
  getPostsByAuthorSlug,
  getPostsByCategorySlug,
  getPostsByTagSlug,
  getFeaturedMediaById,
  api,
} from "../wordpress";
import { Post, Category, Tag, Page, Author, FeaturedMedia } from "../types";

// Helper function to create mock post data
const createMockPost = (id: number): Post => ({
  id,
  date: "2024-03-20T12:00:00",
  date_gmt: "2024-03-20T12:00:00",
  guid: { rendered: `https://brownpoliticalreview.org/?p=${id}` },
  modified: "2024-03-20T12:00:00",
  modified_gmt: "2024-03-20T12:00:00",
  slug: `test-post-${id}`,
  status: "publish",
  type: "post",
  link: `https://brownpoliticalreview.org/test-post-${id}`,
  title: { rendered: `Test Post ${id}` },
  content: { rendered: "<p>Test content</p>", protected: false },
  excerpt: { rendered: "<p>Test excerpt</p>", protected: false },
  author: 1,
  featured_media: 1,
  format: "standard",
  meta: {},
  categories: [1],
  tags: [1],
});

const createMockFeaturedMedia = (id: number): FeaturedMedia => ({
  id,
  date: "2024-03-20T12:00:00",
  slug: `test-media-${id}`,
  type: "attachment",
  link: `https://brownpoliticalreview.org/test-media-${id}`,
  title: { rendered: `Test Media ${id}` },
  author: 1,
  caption: { rendered: "Test caption" },
  alt_text: "Test alt text",
  media_type: "image",
  mime_type: "image/jpeg",
  media_details: {
    width: 800,
    height: 600,
    file: "test-image.jpg",
    sizes: {
      thumbnail: {
        file: "test-image-150x150.jpg",
        width: 150,
        height: 150,
        mime_type: "image/jpeg",
        source_url: "https://brownpoliticalreview.org/test-image-150x150.jpg",
      },
    },
  },
  source_url: "https://brownpoliticalreview.org/test-image.jpg",
});

describe("WordPress API Functions (Mocked)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Post Functions", () => {
    it("should fetch all posts", async () => {
      const mockPosts = [createMockPost(1), createMockPost(2)];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPosts,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getAllPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0]).toHaveProperty("id");
      expect(posts[0]).toHaveProperty("title.rendered");
      expect(posts[0]).toHaveProperty("content.rendered");
      expect(posts[0]).toHaveProperty("featured_media");
    });
    it("should fetch post by ID", async () => {
      const mockPost = createMockPost(1);
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPost,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const post = await getPostById(1);
      expect(post.id).toBe(1);
      expect(post.slug).toBe("test-post-1");
    });
    it("should fetch post by slug", async () => {
      const mockPost = createMockPost(1);
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: [mockPost],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const post = await getPostBySlug("test-post-1");
      expect(post.slug).toBe("test-post-1");
    });
    it("should fetch posts with filters", async () => {
      const mockPosts = [createMockPost(1)];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPosts,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getAllPosts({ author: "1", category: "1", tag: "1" });
      expect(posts).toHaveLength(1);
    });
  });

  describe("Category Functions", () => {
    it("should fetch all categories", async () => {
      const mockCategories: Category[] = [
        {
          id: 1,
          count: 5,
          description: "Test category",
          link: "https://brownpoliticalreview.org/category/test",
          name: "Test Category",
          slug: "test-category",
          taxonomy: "category",
          parent: 0,
          meta: [],
        },
      ];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockCategories,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const categories = await getAllCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0]).toHaveProperty("id");
      expect(categories[0]).toHaveProperty("name");
      expect(categories[0]).toHaveProperty("slug");
    });
    it("should fetch posts by category", async () => {
      const mockPosts = [createMockPost(1)];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPosts,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getPostsByCategory(1);
      expect(posts).toHaveLength(1);
      expect(posts[0].categories).toContain(1);
    });
  });

  describe("Tag Functions", () => {
    it("should fetch all tags", async () => {
      const mockTags: Tag[] = [
        {
          id: 1,
          count: 3,
          description: "Test tag",
          link: "https://brownpoliticalreview.org/tag/test",
          name: "Test Tag",
          slug: "test-tag",
          taxonomy: "post_tag",
          meta: [],
        },
      ];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockTags,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const tags = await getAllTags();
      expect(tags).toHaveLength(1);
      expect(tags[0]).toHaveProperty("id");
      expect(tags[0]).toHaveProperty("name");
      expect(tags[0]).toHaveProperty("slug");
    });
    it("should fetch posts by tag", async () => {
      const mockPosts = [createMockPost(1)];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPosts,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getPostsByTag(1);
      expect(posts).toHaveLength(1);
      expect(posts[0].tags).toContain(1);
    });
  });

  describe("Author Functions", () => {
    it("should fetch all authors", async () => {
      const mockAuthors: Author[] = [
        {
          id: 1,
          name: "Test Author",
          url: "https://brownpoliticalreview.org/author/test",
          description: "Test author bio",
          link: "https://brownpoliticalreview.org/author/test",
          slug: "test-author",
          avatar_urls: {
            "24": "https://brownpoliticalreview.org/avatar-24.jpg",
            "48": "https://brownpoliticalreview.org/avatar-48.jpg",
            "96": "https://brownpoliticalreview.org/avatar-96.jpg",
          },
          meta: [],
        },
      ];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockAuthors,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const authors = await getAllAuthors();
      expect(authors).toHaveLength(1);
      expect(authors[0]).toHaveProperty("id");
      expect(authors[0]).toHaveProperty("name");
      expect(authors[0]).toHaveProperty("slug");
    });
    it("should fetch posts by author", async () => {
      const mockPosts = [createMockPost(1)];
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockPosts,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getPostsByAuthor(1);
      expect(posts).toHaveLength(1);
      expect(posts[0].author).toBe(1);
    });
  });

  describe("Featured Media Functions", () => {
    it("should fetch featured media by ID", async () => {
      const mockMedia = createMockFeaturedMedia(1);
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: mockMedia,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const media = await getFeaturedMediaById(1);
      expect(media.id).toBe(1);
      expect(media.media_type).toBe("image");
      expect(media.media_details).toHaveProperty("sizes");
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      jest.spyOn(api, "get").mockRejectedValueOnce(new Error("API Error"));
      await expect(getAllPosts()).rejects.toThrow("API Error");
    });
    it("should handle empty responses", async () => {
      jest.spyOn(api, "get").mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/mock-url" },
      });
      const posts = await getAllPosts();
      expect(posts).toHaveLength(0);
    });
  });
});

// --- INTEGRATION TESTS (REAL DATA) ---
describe("WordPress API Functions (Integration, Real Data)", () => {
  // These tests hit the real endpoint and may fail if the API is down or data changes
  // Remove or comment out .skip to enable
  describe("Live API", () => {
    it("should fetch real posts with required fields", async () => {
      const posts = await getAllPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
      const post = posts[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("title.rendered");
      expect(post).toHaveProperty("content.rendered");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("categories");
      expect(post).toHaveProperty("tags");
      expect(typeof post.slug).toBe("string");
      expect(typeof post.title.rendered).toBe("string");
    });
    it("should fetch real categories", async () => {
      const categories = await getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty("id");
      expect(categories[0]).toHaveProperty("slug");
      expect(categories[0]).toHaveProperty("name");
    });
    it("should fetch real authors", async () => {
      const authors = await getAllAuthors();
      expect(Array.isArray(authors)).toBe(true);
      expect(authors.length).toBeGreaterThan(0);
      expect(authors[0]).toHaveProperty("id");
      expect(authors[0]).toHaveProperty("slug");
      expect(authors[0]).toHaveProperty("name");
    });
    it("should fetch featured media for a real post if available", async () => {
      const posts = await getAllPosts();
      const postWithMedia = posts.find(
        (p) => p.featured_media && typeof p.featured_media === "number"
      );
      if (!postWithMedia) return;
      const media = await getFeaturedMediaById(postWithMedia.featured_media);
      expect(media).toHaveProperty("id");
      expect(media).toHaveProperty("media_type");
      expect(media).toHaveProperty("source_url");
    });
  });
});
