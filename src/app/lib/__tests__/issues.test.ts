import AxiosMockAdapter from "axios-mock-adapter";
import { issueHtmlToText, parseIssueSource, parseIssues, validIssueDate, validIssuePdf, getIssueThemeCss, formatIssueHeading, DEFAULT_ISSUE_BACKGROUND, DEFAULT_ISSUE_COLOR, IssueSource } from "../issues";
import { api, getIssueArchiveSources, getIssuePosts } from "../wordpress";
import { cache, cacheInvalidation } from "../cache";
import { formatArchiveDate, uniqueArticles } from "../utils";

const source = (html: string, id = 1): IssueSource => ({
  id, date: "2026-11-05T09:59:08", title: { rendered: "WordPress &amp; title" }, content: { rendered: html },
});

test("issue HTML keeps line breaks, decodes entities, and splits metadata only at its first colon", () => {
  const html = '<p><strong>Title:</strong> Theme: Translation &amp; Meaning<br>Published: 2012-10-28<br>PDF: <a href="https://files.test:8443/fall.pdf?ref=https://bpr.test">https://files.test:8443/fall.pdf?ref=https://bpr.test</a><br>Background-Color: #abc<br>Text-Color: #123456</p><script>PDF: https://bad.test/evil.pdf</script>';
  expect(issueHtmlToText(html)).toContain("Meaning\nPublished: 2012-10-28\nPDF:");
  const [issue] = parseIssueSource(source(html));
  expect(issue.title).toBe("Theme: Translation & Meaning");
  expect(issue.pdf).toBe("https://files.test:8443/fall.pdf?ref=https://bpr.test");
  expect(issue.published).toBe("2012-10-28");
  expect(issue.background).toBe("#abc");
  expect(issue.color).toBe("#123456");
});

test("missing or invalid fields fall back to WordPress metadata and default hex colors", () => {
  const [issue] = parseIssueSource(source('<div>Published: 2026-02-30</div><div>PDF: https://files.test/issue.pdf</div><div>Background-Color: red;display:none</div><div>Text-Color: #12xz45</div>'));
  expect(issue.title).toBe("WordPress & title");
  expect(issue.published).toBe("2026-11-05");
  expect(issue.background).toBe(DEFAULT_ISSUE_BACKGROUND);
  expect(issue.color).toBe(DEFAULT_ISSUE_COLOR);
  const untitled = parseIssueSource(source('<p>Title: No PDF</p>'))[0];
  expect(untitled.pdf).toBeNull();
  expect(untitled.background).toBe(DEFAULT_ISSUE_BACKGROUND);
  expect(untitled.color).toBe(DEFAULT_ISSUE_COLOR);
  const colored = parseIssueSource(source('<p>Title: Palette only<br>Published: 2026-06-21<br>PDF:<br>Background-Color: #3d4660<br>Text-Color: #da9985</p>'))[0];
  expect(colored.pdf).toBeNull();
  expect(colored.background).toBe("#3d4660");
  expect(colored.color).toBe("#da9985");
  expect(parseIssueSource({ ...source('PDF: https://files.test/issue.pdf'), content: { rendered: 'PDF: https://files.test/issue.pdf', protected: true } })).toEqual([]);
});

test.each(["2026-02-29", "2026-13-01", "2026-11-31", "2026-01-01T24:00:00", "yesterday"])("rejects invalid issue date %s", value => {
  expect(validIssueDate(value)).toBeNull();
});

test("valid dates and PDF URLs preserve their full values", () => {
  expect(validIssueDate("2024-02-29")?.published).toBe("2024-02-29");
  expect(validIssueDate("2026-11-05T23:59:00-05:00")?.published).toBe("2026-11-05");
  expect(validIssuePdf("https://files.test/My%20Issue.PDF?download=1#page=2")).toBe("https://files.test/My%20Issue.PDF?download=1#page=2");
  for (const value of ["javascript:alert(1)", "ftp://files.test/issue.pdf", "https://files.test/article", "https://user:pass@files.test/issue.pdf", "not a URL"]) expect(validIssuePdf(value)).toBeUndefined();
});

test("multiple issues retain their own covers, sort newest first, and deduplicate PDF links", () => {
  const html = '<figure><img src="/old.jpg" alt="Old cover"></figure><p>Title: Old<br>Published: 2012-10-28<br>PDF: https://files.test/old.pdf</p><figure><img data-src="/new.jpg" src="data:image/gif;base64,abc" alt="New cover"></figure><p>Title: New<br>Published: 2026-11-05<br>PDF: https://files.test/new.pdf</p>';
  const issues = parseIssues([source(html), source('Title: Duplicate\nPublished: 2012-10-28\nPDF: https://files.test/old.pdf#page=2', 2)]);
  expect(issues.map(issue => issue.title)).toEqual(["New", "Old"]);
  expect(issues[0].cover?.url).toBe("https://brownpoliticalreview.org/new.jpg");
  expect(issues[1].cover?.url).toBe("https://brownpoliticalreview.org/old.jpg");
  const featured = parseIssueSource({ ...source('PDF: https://files.test/feature.pdf'), _embedded: { "wp:featuredmedia": [{ source_url: "https://files.test/cover.jpg", alt_text: "Cover" }] } });
  expect(featured[0].cover).toEqual({ url: "https://files.test/cover.jpg", alt: "Cover" });
  expect(parseIssueSource(source('PDF: https://files.test/issue.pdf\nCover: https://files.test/explicit-cover.jpg'))[0].cover?.url).toBe("https://files.test/explicit-cover.jpg");
});

test("issue loader combines the archive page and every page of categorized posts", async () => {
  await cache.clear();
  const mock = new AxiosMockAdapter(api);
  mock.onGet("/wp-json/wp/v2/pages").reply(200, [source('PDF: https://files.test/page.pdf')]);
  mock.onGet("/wp-json/wp/v2/categories").reply(200, [{ id: 99 }]);
  mock.onGet("/wp-json/wp/v2/posts").reply(config => [200, [source(`PDF: https://files.test/post-${config.params.page}.pdf`, config.params.page + 1)], { "x-wp-totalpages": "2" }]);
  try {
    const sources = await getIssueArchiveSources();
    expect(parseIssues(sources)).toHaveLength(3);
    expect(mock.history.get.filter(request => request.url === "/wp-json/wp/v2/posts")).toHaveLength(2);
    await cacheInvalidation.invalidatePages();
    expect(await cache.get("getIssueArchiveSources", {})).toBeNull();
  } finally { mock.restore(); await cache.clear(); }
});

test("archive dates are compact and merged article pages keep only one copy of each post", () => {
  expect(formatArchiveDate("2026-11-09T00:30:00-05:00")).toBe("NOV 9, 2026");
  expect(formatArchiveDate("2026-02-30")).toBe("");
  expect(uniqueArticles([{ id: 1 }, { id: 1 }], [{ id: 1 }, { id: 2 }, { id: 2 }], [{ id: 2 }, { id: 3 }])).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
});

test("editor instruction blocks cannot supply issue fields, covers, or visible text", () => {
  const html = '<p>— EDITOR INSTRUCTIONS —<br>Title: Fake issue<br>PDF: https://files.test/fake.pdf<img src="/fake.jpg"><br>— END EDITOR INSTRUCTIONS —</p><p>Title: Real issue<br>Published: 2020-01-01<br>PDF: https://files.test/real.pdf<br>Issue-Tag: real-issue</p>';
  const issues = parseIssueSource(source(html));
  expect(issues).toHaveLength(1);
  expect(issues[0].title).toBe("Real issue");
  expect(issues[0].cover).toBeUndefined();
  expect(issues[0].issueTag).toBe("real-issue");
  expect(issueHtmlToText(html)).not.toMatch(/Fake issue|fake.pdf|EDITOR INSTRUCTIONS/);
  expect(parseIssueSource(source('<!-- EDITOR INSTRUCTIONS -->Title: Fake\nPDF: https://files.test/fake.pdf<!-- END EDITOR INSTRUCTIONS --><p>Title: Real<br>PDF: https://files.test/real.pdf</p>'))[0].title).toBe("Real");
});

test("issue headings shorten CMS titles for the edition chrome", () => {
  expect(formatIssueHeading("BPR Spring 2026 Issue 2")).toBe("Spring 2026 · Issue 2");
  expect(formatIssueHeading("BPR Fall 2026 Issue 2")).toBe("Fall 2026 · Issue 2");
  expect(formatIssueHeading("BPR Winter 2014 Issue")).toBe("Winter 2014");
});

test("issue identifiers remain stable when WordPress blocks are reordered and honor explicit tags", () => {
  const block = 'Title: BPR Spring 2026 Issue 2\nPDF: https://files.test/spring.pdf';
  expect(parseIssueSource(source(block))[0].issueTag).toBe("bpr-spring2026-issue2");
  expect(parseIssueSource(source('Title: Other\nPDF: https://files.test/other.pdf\n' + block))[1].slug).toBe("bpr-spring2026-issue2");
  expect(parseIssueSource(source('Title: BPR Fall 2026 Issue 2\nPDF: https://files.test/fall.pdf'))[0].issueTag).toBe("bpr-fall2026-issue2");
  expect(parseIssueSource(source('Title: BPR Winter 2014 Issue\nPDF: https://files.test/winter.pdf'))[0].issueTag).toBe("bpr-winter2014-issue");
  expect(parseIssueSource(source(block + '\nIssue-Tag: bpr-fall2026-issue2'))[0].slug).toBe("bpr-fall2026-issue2");
  expect(parseIssueSource(source(block + '\nIssue-Tag: 42'))[0].issueTag).toBe(42);
  const issue = parseIssueSource(source(block + '\nBackground-Color: #123456\nText-Color: #fff'))[0];
  expect(getIssueThemeCss(issue)).toContain(':root[data-theme="issue"]{');
  expect(getIssueThemeCss(issue)).toContain("--surface:#123456");
  expect(getIssueThemeCss(issue)).toContain("--text-primary:#fff");
  expect(getIssueThemeCss(issue)).toContain("--surface-skeleton:");
  expect(getIssueThemeCss(parseIssueSource(source(block))[0])).toBe("");
  expect(parseIssueSource(source(block))[0].background).toBe(DEFAULT_ISSUE_BACKGROUND);
  expect(parseIssueSource(source(block))[0].color).toBe(DEFAULT_ISSUE_COLOR);
});

test("issue articles use only the issue tag, paginate, deduplicate, and sort independently of release dates", async () => {
  await cache.clear();
  const mock = new AxiosMockAdapter(api);
  const article = (id: number, date: string, tags = [42]) => ({ ...source('', id), date, tags });
  mock.onGet("/wp-json/wp/v2/tags").reply(config => [200, config.params.slug === 'spring-2026-two' ? [{ id: 42 }] : []]);
  mock.onGet("/wp-json/wp/v2/posts").reply(config => [200, config.params.page === 1
    ? [article(1, '2019-01-01'), article(2, '2025-06-01'), article(3, '2026-06-01', [99])]
    : [article(2, '2025-06-01'), article(4, '2026-01-01')], { 'x-wp-totalpages': '2' }]);
  try {
    expect((await getIssuePosts('spring-2026-two')).map(post => post.id)).toEqual([4, 2, 1]);
    expect(mock.history.get.filter(request => request.url === '/wp-json/wp/v2/posts').every(request => request.params.tags === 42 && !request.params.before && !request.params.after)).toBe(true);
    expect(await getIssuePosts('missing-tag')).toEqual([]);
    expect(await getIssuePosts('')).toEqual([]);
    expect(mock.history.get.filter(request => request.url === '/wp-json/wp/v2/posts')).toHaveLength(2);
  } finally { mock.restore(); await cache.clear(); }
});
