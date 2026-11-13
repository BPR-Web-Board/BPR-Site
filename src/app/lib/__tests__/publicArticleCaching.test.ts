import { NextRequest } from "next/server";
import { GET } from "../../api/related-posts/route";
import { getPostsByCategory, getAllCategories } from "../wordpress";
import { enhancePreviewPosts } from "../enhancePost";

jest.mock("../wordpress", () => ({
  getPostsByCategory: jest.fn(),
  getAllCategories: jest.fn(),
}));
jest.mock("../enhancePost", () => ({ enhancePreviewPosts: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAllCategories).mockResolvedValue([]);
});

test("public related posts are CDN cached while browsers must recheck", async () => {
  jest.mocked(getPostsByCategory).mockResolvedValue([{ id: 1 }, { id: 2 }] as never);
  jest.mocked(enhancePreviewPosts).mockResolvedValue([{ id: 2 }] as never);
  const response = await GET(new NextRequest("http://localhost/api/related-posts?categoryId=3&excludePostId=1"));
  expect(await response.json()).toEqual({ posts: [{ id: 2 }] });
  expect(enhancePreviewPosts).toHaveBeenCalledWith([{ id: 2 }], []);
  expect(response.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
  expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe("max-age=60, stale-while-revalidate=60");
});

test("empty public results are cached", async () => {
  jest.mocked(getPostsByCategory).mockResolvedValue([]);
  const response = await GET(new NextRequest("http://localhost/api/related-posts?categoryId=3"));
  expect(await response.json()).toEqual({ posts: [] });
  expect(response.headers.has("Vercel-CDN-Cache-Control")).toBe(true);
});

test("validation and upstream errors never receive public cache headers", async () => {
  const invalid = await GET(new NextRequest("http://localhost/api/related-posts"));
  expect(invalid.status).toBe(400);
  expect(invalid.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
  jest.mocked(getPostsByCategory).mockRejectedValue(new Error("upstream unavailable"));
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const failed = await GET(new NextRequest("http://localhost/api/related-posts?categoryId=3"));
    expect(failed.status).toBe(500);
    expect(failed.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
  } finally {
    log.mockRestore();
  }
});
