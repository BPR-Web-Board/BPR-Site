import { api, getAllCategories, resetWordPressCircuit } from "../wordpress";
import { cache } from "../cache";

beforeEach(async () => {
  jest.restoreAllMocks();
  resetWordPressCircuit();
  await cache.clear();
});
afterEach(() => jest.restoreAllMocks());

test("loads every category page and caches only the complete result", async () => {
  const request = jest.spyOn(api, "get")
    .mockResolvedValueOnce({ data: [{ id: 1, slug: "world" }], status: 200, statusText: "OK", config: { url: "/wp-json/wp/v2/categories" }, headers: { "x-wp-totalpages": "2" } })
    .mockResolvedValueOnce({ data: [{ id: 2, slug: "education" }], status: 200, statusText: "OK", config: { url: "/wp-json/wp/v2/categories" }, headers: { "x-wp-totalpages": "2" } });
  const categories = await getAllCategories();
  expect(categories.map(category => category.id)).toEqual([1, 2]);
  expect(request).toHaveBeenNthCalledWith(2, "/wp-json/wp/v2/categories", { params: { per_page: 100, page: 2 } });
  expect(await getAllCategories()).toEqual(categories);
  expect(request).toHaveBeenCalledTimes(2);
});

test("does not cache a partial taxonomy when a later page fails", async () => {
  const request = jest.spyOn(api, "get")
    .mockResolvedValueOnce({ data: [{ id: 1 }], status: 200, statusText: "OK", config: { url: "/wp-json/wp/v2/categories" }, headers: { "x-wp-totalpages": "2" } })
    .mockRejectedValueOnce(new Error("upstream failure"))
    .mockResolvedValueOnce({ data: [{ id: 3 }], status: 200, statusText: "OK", config: { url: "/wp-json/wp/v2/categories" }, headers: { "x-wp-totalpages": "1" } });
  // Soft-fail for page renders; failed attempts are not cached
  expect(await getAllCategories()).toEqual([]);
  expect(await getAllCategories()).toEqual([{ id: 3 }]);
  expect(request).toHaveBeenCalledTimes(3);
});
