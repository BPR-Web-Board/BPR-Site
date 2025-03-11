import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as wpApi from "../lib/wordpress";

// We need to mock the specific axios instance used in our WordPress API module
// First, import the api instance (we'll need to export it in wordpress.ts)
import { api } from "../lib/wordpress";

// Create mock for the specific axios instance
const mock = new MockAdapter(api);

// Sample mock data
const mockPost = {
  id: 1,
  title: { rendered: "Test Post" },
  content: { rendered: "<p>Test content</p>", protected: false },
  excerpt: { rendered: "<p>Test excerpt</p>", protected: false },
  date: "2023-01-01T12:00:00",
  slug: "test-post",
  status: "publish",
  categories: [1, 2],
  tags: [3, 4],
};

const mockCategory = {
  id: 1,
  name: "Test Category",
  slug: "test-category",
  description: "Test category description",
  count: 5,
  link: "https://brownpoliticalreview.org/category/test-category",
  taxonomy: "category",
  parent: 0,
  meta: [],
};

const mockTag = {
  id: 3,
  name: "Test Tag",
  slug: "test-tag",
  description: "Test tag description",
  count: 3,
  link: "https://brownpoliticalreview.org/tag/test-tag",
  taxonomy: "post_tag",
  meta: [],
};

const mockAuthor = {
  id: 5,
  name: "Test Author",
  slug: "test-author",
  description: "Test author bio",
  url: "https://testauthor.com",
  link: "https://brownpoliticalreview.org/author/test-author",
  avatar_urls: { "96": "https://secure.gravatar.com/avatar/test" },
  meta: [],
};

const mockMedia = {
  id: 10,
  date: "2023-01-01T10:00:00",
  slug: "test-image",
  type: "attachment",
  link: "https://brownpoliticalreview.org/test-image",
  title: { rendered: "Test Image" },
  author: 5,
  alt_text: "Test image alt text",
  media_type: "image",
  mime_type: "image/jpeg",
  media_details: {
    width: 800,
    height: 600,
    file: "2023/01/test-image.jpg",
    sizes: {
      thumbnail: {
        file: "test-image-150x150.jpg",
        width: 150,
        height: 150,
        mime_type: "image/jpeg",
        source_url:
          "https://brownpoliticalreview.org/wp-content/uploads/2023/01/test-image-150x150.jpg",
      },
    },
  },
  source_url:
    "https://brownpoliticalreview.org/wp-content/uploads/2023/01/test-image.jpg",
};

describe("WordPress API", () => {
  beforeAll(() => {
    // Configure mock responses
    // Posts
    mock.onGet("/wp-json/wp/v2/posts").reply((config) => {
      // Check for query parameters to return appropriate responses
      const params = config.params || {};

      if (params.slug === "test-post") {
        return [200, [mockPost]];
      }

      if (params.author === "5" || params.author === 5) {
        return [200, [mockPost]];
      }

      if (params.categories === 1) {
        return [200, [mockPost]];
      }

      if (params.tags === 3) {
        return [200, [mockPost]];
      }

      // Default response for all posts
      return [200, [mockPost]];
    });

    // Single post
    mock.onGet(/\/wp-json\/wp\/v2\/posts\/\d+/).reply(200, mockPost);

    // Categories
    mock.onGet("/wp-json/wp/v2/categories").reply(200, [mockCategory]);
    mock.onGet(/\/wp-json\/wp\/v2\/categories\/\d+/).reply(200, mockCategory);
    mock
      .onGet("/wp-json/wp/v2/categories", { params: { slug: "test-category" } })
      .reply(200, [mockCategory]);

    // Tags
    mock.onGet("/wp-json/wp/v2/tags").reply(200, [mockTag]);
    mock.onGet(/\/wp-json\/wp\/v2\/tags\/\d+/).reply(200, mockTag);
    mock
      .onGet("/wp-json/wp/v2/tags", { params: { slug: "test-tag" } })
      .reply(200, [mockTag]);
    mock
      .onGet("/wp-json/wp/v2/tags", { params: { post: 1 } })
      .reply(200, [mockTag]);

    // Authors
    mock.onGet("/wp-json/wp/v2/users").reply(200, [mockAuthor]);
    mock.onGet(/\/wp-json\/wp\/v2\/users\/\d+/).reply(200, mockAuthor);
    mock
      .onGet("/wp-json/wp/v2/users", { params: { slug: "test-author" } })
      .reply(200, [mockAuthor]);

    // Media
    mock.onGet(/\/wp-json\/wp\/v2\/media\/\d+/).reply(200, mockMedia);
  });

  afterEach(() => {
    mock.resetHistory();
  });

  afterAll(() => {
    mock.restore();
  });

  // Posts tests
  test("getAllPosts returns posts array", async () => {
    const posts = await wpApi.getAllPosts();
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
    expect(posts[0].title.rendered).toBe("Test Post");
  });

  test("getAllPosts with filters", async () => {
    const posts = await wpApi.getAllPosts({
      author: "5",
      category: "1",
      tag: "3",
    });
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  test("getPostById returns post", async () => {
    const post = await wpApi.getPostById(1);
    expect(post.id).toBe(1);
    expect(post.title.rendered).toBe("Test Post");
  });

  test("getPostBySlug returns post", async () => {
    const post = await wpApi.getPostBySlug("test-post");
    expect(post.id).toBe(1);
    expect(post.slug).toBe("test-post");
  });

  // Categories tests
  test("getAllCategories returns categories array", async () => {
    const categories = await wpApi.getAllCategories();
    expect(categories).toBeInstanceOf(Array);
    expect(categories[0].id).toBe(1);
    expect(categories[0].name).toBe("Test Category");
  });

  test("getCategoryById returns category", async () => {
    const category = await wpApi.getCategoryById(1);
    expect(category.id).toBe(1);
    expect(category.name).toBe("Test Category");
  });

  test("getCategoryBySlug returns category", async () => {
    const category = await wpApi.getCategoryBySlug("test-category");
    expect(category.id).toBe(1);
    expect(category.slug).toBe("test-category");
  });

  test("getPostsByCategory returns posts array", async () => {
    const posts = await wpApi.getPostsByCategory(1);
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  // Tags tests
  test("getAllTags returns tags array", async () => {
    const tags = await wpApi.getAllTags();
    expect(tags).toBeInstanceOf(Array);
    expect(tags[0].id).toBe(3);
    expect(tags[0].name).toBe("Test Tag");
  });

  test("getTagById returns tag", async () => {
    const tag = await wpApi.getTagById(3);
    expect(tag.id).toBe(3);
    expect(tag.name).toBe("Test Tag");
  });

  test("getTagBySlug returns tag", async () => {
    const tag = await wpApi.getTagBySlug("test-tag");
    expect(tag.id).toBe(3);
    expect(tag.slug).toBe("test-tag");
  });

  test("getTagsByPost returns tags array", async () => {
    const tags = await wpApi.getTagsByPost(1);
    expect(tags).toBeInstanceOf(Array);
    expect(tags[0].id).toBe(3);
  });

  test("getPostsByTag returns posts array", async () => {
    const posts = await wpApi.getPostsByTag(3);
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  // Authors tests
  test("getAllAuthors returns authors array", async () => {
    const authors = await wpApi.getAllAuthors();
    expect(authors).toBeInstanceOf(Array);
    expect(authors[0].id).toBe(5);
    expect(authors[0].name).toBe("Test Author");
  });

  test("getAuthorById returns author", async () => {
    const author = await wpApi.getAuthorById(5);
    expect(author.id).toBe(5);
    expect(author.name).toBe("Test Author");
  });

  test("getAuthorBySlug returns author", async () => {
    const author = await wpApi.getAuthorBySlug("test-author");
    expect(author.id).toBe(5);
    expect(author.slug).toBe("test-author");
  });

  test("getPostsByAuthor returns posts array", async () => {
    const posts = await wpApi.getPostsByAuthor(5);
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  // Media tests
  test("getFeaturedMediaById returns media", async () => {
    const media = await wpApi.getFeaturedMediaById(10);
    expect(media.id).toBe(10);
    expect(media.title.rendered).toBe("Test Image");
    expect(media.media_type).toBe("image");
  });

  // Composite functions tests
  test("getPostsByAuthorSlug returns posts", async () => {
    const posts = await wpApi.getPostsByAuthorSlug("test-author");
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  test("getPostsByCategorySlug returns posts", async () => {
    const posts = await wpApi.getPostsByCategorySlug("test-category");
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });

  test("getPostsByTagSlug returns posts", async () => {
    const posts = await wpApi.getPostsByTagSlug("test-tag");
    expect(posts).toBeInstanceOf(Array);
    expect(posts[0].id).toBe(1);
  });
});
