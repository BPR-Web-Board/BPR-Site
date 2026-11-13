import React from "react";
import { fitArticlesToHeight, fitStackedSideColumns } from "../fitArticlesToHeight";
import { renderToStaticMarkup } from "react-dom/server";
import ArticleLayout from "../../components/ArticleLayout/ArticleLayout";
import FourArticleGrid from "../../components/FourArticleGrid/FourArticleGrid";
import type { EnhancedPost, Post } from "../types";
import HomePage from "../../page";
import WorldPage from "../../world/page";
import IssueArticlesPage from "../../magazine/issues/[issue]/page";
import MagazinePage from "../../magazine/(home)/page";
import AllIssuesPage from "../../magazine/(archive)/issues/page";
import ArchiveLayout from "../../magazine/(archive)/layout";
import { getAllPosts, getPostsByCategorySlug, getIssueArchiveSources, getIssuePosts } from "../wordpress";

jest.mock("../wordpress", () => ({
  getAllPosts: jest.fn().mockResolvedValue([]),
  getIssueArchiveSources: jest.fn().mockResolvedValue([]),
  getIssuePosts: jest.fn().mockResolvedValue([]),
  getAllCategories: jest.fn().mockResolvedValue([]),
  getPostsByCategorySlug: jest.fn().mockResolvedValue([]),
  getTagBySlug: jest.fn().mockResolvedValue(undefined),
  getPostContentByIds: jest.fn().mockResolvedValue([]),
}));

test("importing a page does not fetch or freeze content", () => {
  expect(getAllPosts).not.toHaveBeenCalled();
  expect(getPostsByCategorySlug).not.toHaveBeenCalled();
});

test("each page render reevaluates its data loaders", async () => {
  await expect(HomePage()).rejects.toThrow("Homepage content unavailable");
  await expect(HomePage()).rejects.toThrow("Homepage content unavailable");
  expect(getAllPosts).toHaveBeenCalledTimes(2);
  const before = jest.mocked(getPostsByCategorySlug).mock.calls.length;
  await WorldPage();
  await WorldPage();
  expect(jest.mocked(getPostsByCategorySlug).mock.calls.length - before).toBe(16);
});

test("layouts avoid duplicate cards and keep side fit counts stable", () => {
  const posts = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    slug: `layout-${index}`,
    title: {
      rendered: `${index === 0 ? "[DATA COMMENTARY] " : index === 1 ? "[Transcript] " : ""}Article ${index}`,
    },
    excerpt: { rendered: "Summary", protected: false },
    content: { rendered: "", protected: false },
    author_name: "Writer",
    date: "2026-01-01",
    categories_obj: [
      {
        id: 1,
        slug: "world",
        name: "World",
        parent: 0,
        count: 1,
        description: "",
        link: "",
        taxonomy: "category",
        meta: [],
      },
    ],
    date_gmt: "2026-01-01",
    modified: "2026-01-01",
    modified_gmt: "2026-01-01",
    guid: { rendered: "" },
    status: "publish",
    type: "post",
    link: "",
    author: 1,
    featured_media: 0,
    format: "standard",
    categories: [],
    tags: [],
  } as EnhancedPost));

  const grid = renderToStaticMarkup(
    React.createElement(FourArticleGrid, {
      posts: posts.slice(0, 4),
      numberOfRows: 1,
    })
  );
  expect(grid.match(/href="[^"]*\/article\/layout-\d+"/g)).toHaveLength(4);
  expect(grid).toContain("[DATA COMMENTARY]");

  const layout = renderToStaticMarkup(
    React.createElement(ArticleLayout, { posts: posts.slice(0, 6) })
  );
  expect(layout.match(/data-fit-id=/g)).toHaveLength(2);
  expect(layout).toContain("articles-grid count-");

  const measured = [180, 120, 170, 100, 200, 400].map((height, index) => ({
    id: index + 1,
    height,
  }));
  expect(fitArticlesToHeight(measured, 400, 16, 2)).toEqual({
    columns: [[6], [1, 5]],
    overflow: [2, 3, 4],
  });
  const taller = fitArticlesToHeight(measured, 800, 16, 2);
  expect(taller.overflow).toEqual([]);
});

test("All Issues keeps issues separate from articles and serves published WordPress content", async () => {
  const empty = renderToStaticMarkup(
    await ArchiveLayout({
      children: await AllIssuesPage({ searchParams: Promise.resolve({}) }),
    })
  );
  expect(getIssueArchiveSources).toHaveBeenCalled();
  expect(empty).toContain("No issues are available yet.");
  expect(empty).toContain('href="/magazine/archive"');
  expect(empty).toContain('href="/magazine/issues"');
  expect(empty.match(/<h1\b/g)).toHaveLength(1);
  expect(empty).not.toContain("Latest Articles");
  expect(empty).toContain(">Issues</a>");
  expect(empty).toContain(">Articles</a>");
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([
    {
      id: 1,
      date: "2026-01-01",
      title: { rendered: "Fall issue" },
      content: {
        rendered:
          "<p>Title: Fall issue<br>Published: 2026-01-01<br>PDF: https://brownpoliticalreview.org/issue.pdf</p>",
      },
    },
  ]);
  const published = renderToStaticMarkup(
    await ArchiveLayout({
      children: await AllIssuesPage({ searchParams: Promise.resolve({}) }),
    })
  );
  expect(published).toContain('href="/magazine/issues/fall-issue"');
  expect(published).toContain("Fall issue");
  expect(published).not.toContain("Magazine issues will appear here");
  expect(published).not.toContain(">PDF<");
  expect(published).not.toContain("issue-action");
});

test("sparse side columns fit vertical images without clipping text or losing articles", () => {
  const compact = { columns: [[1, 2, 3], [4, 5, 6, 7]], overflow: [8] };
  const stacked = [210, 180, 140, 300, 300, 300, 300, 120].map(
    (height, index) => ({ id: index + 1, height })
  );
  const fitted = fitStackedSideColumns(compact, stacked, 600, 16);
  expect(fitted).toEqual({
    columns: [[1, 2, 3], [4, 5, 6, 7]],
    overflow: [8],
  });
  expect(new Set([...fitted.columns.flat(), ...fitted.overflow]).size).toBe(8);
  expect(fitStackedSideColumns(compact, stacked, 1000, 16)).toEqual(compact);
  const tight = fitStackedSideColumns(compact, stacked, 400, 16);
  expect(tight.columns[0]).toEqual([1, 3]);
  expect(tight.overflow).toEqual(expect.arrayContaining([2, 8]));
});

test("Latest Articles uses the newest issue's WordPress theme colors", async () => {
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([
    {
      id: 1,
      date: "2026-01-01",
      title: { rendered: "Spring" },
      content: {
        rendered:
          "Title: Spring\nPublished: 2026-01-01\nPDF: https://files.test/spring.pdf\nBackground-Color: #abcdef\nText-Color: #112233",
      },
    },
    {
      id: 2,
      date: "2025-01-01",
      title: { rendered: "Fall" },
      content: {
        rendered:
          "Title: Fall\nPublished: 2025-01-01\nPDF: https://files.test/fall.pdf\nBackground-Color: #000000\nText-Color: #ffffff",
      },
    },
  ]);
  const html = renderToStaticMarkup(await MagazinePage());
  expect(html).toContain('class="page-container issue-edition"');
  expect(html).toContain(':root[data-theme="issue"]{');
  expect(html).toContain("--surface:#abcdef");
  expect(html).toContain("--text-primary:#112233");
  expect(html).not.toContain("--surface:#000000");
  expect(html).toContain("Prev Issues");
  expect(html).toMatch(/issue-edition-kicker[^>]*>Spring</);
});

test("issue article pages use the shared magazine layout and theme", async () => {
  const posts: Post[] = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    slug: `issue-story-${index + 1}`,
    date: `2019-01-${String((index % 28) + 1).padStart(2, "0")}`,
    date_gmt: "2019-01-01",
    modified: "2019-01-01",
    modified_gmt: "2019-01-01",
    guid: { rendered: "" },
    title: { rendered: `Issue story ${index + 1}` },
    content: { rendered: "", protected: false },
    excerpt: { rendered: "Summary", protected: false },
    status: "publish",
    type: "post",
    link: "",
    author: 0,
    featured_media: 0,
    format: "standard",
    categories: [],
    tags: [42],
    meta: {},
  }));
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([
    {
      id: 1,
      date: "2026-01-01",
      title: { rendered: "Issue" },
      content: {
        rendered:
          "Title: Test issue\nIssue-Tag: test-issue\nPublished: 2026-01-01\nPDF: https://files.test/issue.pdf\nBackground-Color: #123456\nText-Color: #fff",
      },
    },
  ]);
  jest.mocked(getIssuePosts).mockResolvedValueOnce(posts);
  const html = renderToStaticMarkup(
    await IssueArticlesPage({ params: Promise.resolve({ issue: "test-issue" }) })
  );
  expect(getIssuePosts).toHaveBeenCalledWith("test-issue");
  expect(html).toContain("--surface:#123456");
  expect(html).toContain("--text-primary:#fff");
  expect(html).toMatch(/issue-nav-link[^>]*>[\s\S]*Archive<\/a>/);
  expect(html).not.toContain(">Back</button>");
  expect(html).toContain("issue-pdf-skeleton");
  expect(html).not.toContain("explore-archive-container");
  expect(html).toContain("Issue story 12");
  expect(html).toContain("Issue story 1");
});
