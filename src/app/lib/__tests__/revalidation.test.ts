import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { POST } from "../../api/revalidate/route";
import { cache } from "../cache";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
const originalSecret = process.env.REVALIDATION_SECRET;
beforeEach(async () => { await cache.clear(); jest.clearAllMocks(); process.env.REVALIDATION_SECRET = "test-secret"; });
afterAll(() => { if (originalSecret === undefined) delete process.env.REVALIDATION_SECRET; else process.env.REVALIDATION_SECRET = originalSecret; });

test("post webhook clears both listing and spotlight data and revalidates nested routes", async () => {
  await cache.set("getAllPosts", {}, ["old post"]);
  await cache.set("spotlight:World:2", {}, ["old spotlight"]);
  await cache.set("getAllCategories", {}, ["retained taxonomy"]);
  const response = await POST(new NextRequest("http://localhost/api/revalidate?secret=test-secret&type=posts", { method: "POST" }));
  expect(response.status).toBe(200);
  expect(await cache.get("getAllPosts", {})).toBeNull();
  expect(await cache.get("spotlight:World:2", {})).toBeNull();
  expect(await cache.get("getAllCategories", {})).toEqual(["retained taxonomy"]);
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  await cache.set("getPageBySlug", { slug: "masthead" }, ["old masthead"]);
  const pageResponse = await POST(new NextRequest("http://localhost/api/revalidate?secret=test-secret&type=pages", { method: "POST" }));
  expect(pageResponse.status).toBe(200);
  expect(await cache.get("getPageBySlug", { slug: "masthead" })).toBeNull();
  expect(await cache.get("getAllCategories", {})).toEqual(["retained taxonomy"]);
});

test("an invalid webhook token cannot clear data", async () => {
  await cache.set("getAllPosts", {}, ["retained"]);
  const response = await POST(new NextRequest("http://localhost/api/revalidate?secret=wrong&type=posts", { method: "POST" }));
  expect(response.status).toBe(401);
  expect(await cache.get("getAllPosts", {})).toEqual(["retained"]);
  expect(revalidatePath).not.toHaveBeenCalled();
});
