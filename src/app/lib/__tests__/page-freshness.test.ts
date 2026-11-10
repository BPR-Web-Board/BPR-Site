import React from "react";
import { fitArticlesToHeight, fitStackedSideColumns } from "../fitArticlesToHeight";
import { renderToStaticMarkup } from "react-dom/server";
import ArticlePreviewGrid from "../../components/ArticlePreviewGrid/ArticlePreviewGrid";
import FourArticleGrid from "../../components/FourArticleGrid/FourArticleGrid";
import ArticleSpotlight from "../../components/ArticleSpotlight";
import ArticleGrid from "../../components/ArticleGrid/ArticleGrid";
import ArticleLayout from "../../components/ArticleLayout/ArticleLayout";
import FeaturedArticleLayout from "../../components/FeaturedArticleLayout/FeaturedArticleLayout";
import ArticleSplitShowcase from "../../components/ArticleSplitShowcase/ArticleSplitShowcase";
import TwoColumnArticleLayout from "../../components/TwoColumnArticleLayout/TwoColumnArticleLayout";
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
  await HomePage();
  await HomePage();
  expect(getAllPosts).toHaveBeenCalledTimes(2);
  const before = jest.mocked(getPostsByCategorySlug).mock.calls.length;
  await WorldPage();
  await WorldPage();
  expect(jest.mocked(getPostsByCategorySlug).mock.calls.length - before).toBe(16);
});

test("layouts adapt to sparse and uneven post counts without duplicate cards or empty rows", () => {
  const posts = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1, slug: `layout-${index}`, title: { rendered: `${index === 0 ? "[DATA COMMENTARY] " : index === 1 ? "[Transcript] " : ""}Article ${index}` },
    excerpt: { rendered: "Summary", protected: false }, content: { rendered: "", protected: false },
    author_name: "Writer", date: "2026-01-01", categories_obj: [{ id: 1, slug: "world", name: "World", parent: 0, count: 1, description: "", link: "", taxonomy: "category", meta: [] }],
    date_gmt: "2026-01-01", modified: "2026-01-01", modified_gmt: "2026-01-01", guid: { rendered: "" },
    status: "publish", type: "post", link: "", author: 1, featured_media: 0, format: "standard", categories: [], tags: [],
  } as EnhancedPost));
  const check = (element: React.ReactElement, count: number) => {
    const html = renderToStaticMarkup(element);
    expect(html).not.toContain("row-divider");
    expect(html).not.toContain("side-article-divider");
    const links = Array.from(html.matchAll(/href="[^"]*\/article\/layout-(\d+)"/g), match => match[1]);
    expect(links).toHaveLength(count);
    expect(new Set(links).size).toBe(count);
    expect(html).not.toContain("article-label-icon");
    expect(html).toContain("[DATA COMMENTARY]");
    expect(html.indexOf("Article 0")).toBeLessThan(html.indexOf("WRITER"));
    expect(html.indexOf("WRITER")).toBeLessThan(html.indexOf('class="category-pills"'));
    if (html.includes("Summary")) expect(html.indexOf('class="category-pills"')).toBeLessThan(html.indexOf("Summary"));
    if (count > 1) expect(html).toContain("[Transcript]");
    return html;
  };
  for (const count of [1, 2, 3, 4, 5, 8]) {
    check(React.createElement(ArticlePreviewGrid, { articles: posts.slice(0, count) }), count);
    check(React.createElement(ArticleGrid, { posts: posts.slice(0, count) }), Math.min(count, 4));
    check(React.createElement(ArticleLayout, { posts: posts.slice(0, count) }), count);
    check(React.createElement(FeaturedArticleLayout, { title: "Stories", posts: posts.slice(0, count) }), Math.min(count, 7));
    check(React.createElement(ArticleSplitShowcase, { posts: posts.slice(0, count) }), Math.min(count, 7));
    const html = check(React.createElement(FourArticleGrid, { posts: posts.slice(0, count), numberOfRows: 2 }), count);
    expect(html.match(/class="articles-grid count-/g)).toHaveLength(Math.ceil(count / 4));
  }
  check(React.createElement(ArticleGrid, { posts, maxArticles: 2 }), 2);
  const expandedGrid = check(React.createElement(ArticleGrid, { posts, maxArticles: 8 }), 8);
  expect(expandedGrid.match(/class="articles-grid count-2"/g)).toHaveLength(4);
  const spotlight = check(React.createElement(ArticleSpotlight, { title: "Spotlight", posts }), 4);
  expect(spotlight).not.toMatch(/carousel|slideshow|Next slide|Previous slide|aria-roledescription/);
  expect(spotlight.match(/class="article-card-excerpt"/g)).toHaveLength(4);
  const solo = check(React.createElement(FourArticleGrid, { posts: posts.slice(0, 1) }), 1);
  expect(solo).toContain("image-position-left");
  expect(solo).toContain("four-article-grid-horizontal");
  expect(solo).toContain("article-card-excerpt");
  expect(solo).toContain("count-1-horizontal");
  expect(solo).not.toContain("four-article-grid-solo");
  expect(solo).not.toContain("large-article-preview");
  check(React.createElement(ArticleLayout, { posts: posts.slice(0, 5) }), 5);
  const fullSidebar = check(React.createElement(ArticleLayout, { posts: posts.slice(0, 6) }), 6);
  expect(fullSidebar.match(/data-fit-id=/g)).toHaveLength(2);
  expect(fullSidebar).toContain("articles-grid count-");
  const previewPosts = posts.map((post, index) => index === 2 ? { ...post, featured_media_obj: {
    id: 1, date: "", slug: "", type: "attachment", link: "", title: { rendered: "" }, author: 0,
    caption: { rendered: "" }, alt_text: "Cover", media_type: "image", mime_type: "image/jpeg",
    source_url: "https://brownpoliticalreview.org/cover.jpg", media_details: { width: 800, height: 600, file: "", sizes: {} },
  } } : post);
  const previewSidebar = check(React.createElement(ArticlePreviewGrid, { articles: previewPosts }), 8);
  expect(previewSidebar.match(/data-fit-id=/g)).toHaveLength(7);
  const measured = [180, 120, 170, 100, 200, 400].map((height, index) => ({ id: index + 1, height }));
  // Taller (image) cards claim column space first, then reading order is restored.
  expect(fitArticlesToHeight(measured, 400, 16, 2)).toEqual({ columns: [[6], [1, 5]], overflow: [2, 3, 4] });
  const taller = fitArticlesToHeight(measured, 800, 16, 2);
  expect(taller.overflow).toEqual([]);
  for (const column of taller.columns) {
    const used = column.reduce((height, id) => height + measured[id - 1].height, 0) + (column.length - 1) * 16;
    expect(used).toBeLessThanOrEqual(800);
  }

  check(React.createElement(FeaturedArticleLayout, { title: "Stories", posts, maxArticles: 7 }), 7);
  check(React.createElement(ArticleSplitShowcase, { posts, maxSecondary: 6 }), 7);
  check(React.createElement(TwoColumnArticleLayout, {
    leftColumnArticles: posts.slice(0, 1), rightColumnArticles: posts.slice(1, 5), fallbackArticles: posts.slice(5),
  }), 5);
});

test("All Issues keeps issues separate from articles and serves published WordPress content", async () => {
  const empty = renderToStaticMarkup(
    await ArchiveLayout({ children: await AllIssuesPage({ searchParams: Promise.resolve({}) }) })
  );
  expect(getIssueArchiveSources).toHaveBeenCalled();
  expect(empty).toContain("No issues are available yet.");
  expect(empty).toContain('href="/magazine/archive"');
  expect(empty).toContain('href="/magazine/issues"');
  expect(empty.match(/<h1\b/g)).toHaveLength(1);
  expect(empty).toContain('>Archive</h1>');
  expect(empty).not.toContain("Latest Articles");
  expect(empty).toContain('>Issues</a>');
  expect(empty).toContain('>Articles</a>');
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([{
    id: 1, date: "2026-01-01", title: { rendered: "Fall issue" },
    content: { rendered: '<p>Title: Fall issue<br>Published: 2026-01-01<br>PDF: https://brownpoliticalreview.org/issue.pdf</p>' },
  }]);
  const published = renderToStaticMarkup(
    await ArchiveLayout({ children: await AllIssuesPage({ searchParams: Promise.resolve({}) }) })
  );
  expect(published).toContain('href="/magazine/issues/fall-issue"');
  expect(published).toContain("Fall issue");
  expect(published).not.toContain("Magazine issues will appear here");
  expect(published).not.toContain(">PDF<");
  expect(published).not.toContain('issue-action');
});

test("sparse side columns fit vertical images without clipping text or losing articles", () => {
  const compact = { columns: [[1, 2, 3], [4, 5, 6, 7]], overflow: [8] };
  const stacked = [210, 180, 140, 300, 300, 300, 300, 120].map((height, index) => ({ id: index + 1, height }));
  const fitted = fitStackedSideColumns(compact, stacked, 600, 16);
  // Natural stacked heights (210+16+180+16+140) fit in 600, so all three stay.
  expect(fitted).toEqual({ columns: [[1, 2, 3], [4, 5, 6, 7]], overflow: [8] });
  expect(new Set([...fitted.columns.flat(), ...fitted.overflow]).size).toBe(8);
  expect(fitStackedSideColumns(compact, stacked, 1000, 16)).toEqual(compact);
  const tight = fitStackedSideColumns(compact, stacked, 400, 16);
  expect(tight.columns[0]).toEqual([1, 3]);
  expect(tight.overflow).toEqual(expect.arrayContaining([2, 8]));
});

test("Latest Articles uses the newest issue's WordPress theme colors", async () => {
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([{
    id: 1, date: "2026-01-01", title: { rendered: "Spring" },
    content: { rendered: "Title: Spring\nPublished: 2026-01-01\nPDF: https://files.test/spring.pdf\nBackground-Color: #abcdef\nText-Color: #112233" },
  }, {
    id: 2, date: "2025-01-01", title: { rendered: "Fall" },
    content: { rendered: "Title: Fall\nPublished: 2025-01-01\nPDF: https://files.test/fall.pdf\nBackground-Color: #000000\nText-Color: #ffffff" },
  }]);
  const html = renderToStaticMarkup(await MagazinePage());
  expect(html).toContain('class="page-container issue-edition"');
  expect(html).toContain(':root[data-theme="issue"]{');
  expect(html).toContain("--surface:#abcdef");
  expect(html).toContain("--text-primary:#112233");
  expect(html).not.toContain("--surface:#000000");
  expect(html).toContain("Prev Issues");
  expect(html).toMatch(/issue-edition-kicker[^>]*>Spring</);
});

test("issue article pages use the shared magazine layout, theme, and exact tag without a date cutoff", async () => {
  const posts: Post[] = Array.from({ length: 55 }, (_, index) => ({
    id: index + 1, slug: `issue-story-${index + 1}`, date: `2019-01-${String(index % 28 + 1).padStart(2, '0')}`,
    date_gmt: '2019-01-01', modified: '2019-01-01', modified_gmt: '2019-01-01', guid: { rendered: '' },
    title: { rendered: `Issue story ${index + 1}` }, content: { rendered: '', protected: false }, excerpt: { rendered: 'Summary', protected: false },
    status: 'publish', type: 'post', link: '', author: 0, featured_media: 0, format: 'standard', categories: [], tags: [42], meta: {},
  }));
  jest.mocked(getIssueArchiveSources).mockResolvedValueOnce([{
    id: 1, date: '2026-01-01', title: { rendered: 'Issue' },
    content: { rendered: 'Title: Test issue\nIssue-Tag: test-issue\nPublished: 2026-01-01\nPDF: https://files.test/issue.pdf\nBackground-Color: #123456\nText-Color: #fff' },
  }]);
  jest.mocked(getIssuePosts).mockResolvedValueOnce(posts);
  const html = renderToStaticMarkup(await IssueArticlesPage({ params: Promise.resolve({ issue: 'test-issue' }) }));
  expect(getIssuePosts).toHaveBeenCalledWith('test-issue');
  expect(html).toContain('--surface:#123456');
  expect(html).toContain('--text-primary:#fff');
  expect(html).toMatch(/issue-nav-link[^>]*>[\s\S]*Archive<\/a>/);
  expect(html).not.toContain('>Back</button>');
  expect(html).toContain('issue-pdf-skeleton');
  expect(html).not.toContain('explore-archive-container');
  const links = Array.from(html.matchAll(/href="[^"]*\/article\/issue-story-(\d+)"/g), match => match[1]);
  expect(links).toHaveLength(55);
  expect(new Set(links).size).toBe(55);
  expect(html.indexOf('Issue story 28')).toBeLessThan(html.indexOf('Issue story 1<'));
});
