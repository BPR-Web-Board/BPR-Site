import { getArticleLink, getAuthorName, getCategoryLink } from "../utils";
import { enhancePost, enhancePosts, toArticlePreview } from "../enhancePost";
import { getMediaPreview } from "../mediaPreview";
import type { EnhancedPost, Post } from "../types";

const link = (slugs: string[]) => getArticleLink({ id: 1, slug: "test-story", categories_obj: slugs.map(slug => ({ slug })) });

test("category pills link to subsection pages when they exist, else the section root", () => {
  expect(getCategoryLink({ slug: "education" })).toBe("/united-states/education");
  expect(getCategoryLink({ slug: "africa" })).toBe("/world/africa");
  expect(getCategoryLink({ slug: "bpradio" })).toBe("/multimedia/bpradio");
  expect(getCategoryLink({ slug: "usa" })).toBe("/united-states");
  expect(getCategoryLink({ slug: "world" })).toBe("/world");
  expect(getCategoryLink({ slug: "photo-essays" })).toBe("/multimedia");
  expect(getCategoryLink({ slug: "video-essays" })).toBe("/multimedia");
  expect(getCategoryLink({ slug: "unknown-tag" })).toBeNull();
});

test("article routing is stable across category order and recognizes CMS aliases", () => {
  expect(link(["education", "usa"])).toBe("/united-states/education/article/test-story");
  expect(link(["usa", "education"])).toBe(link(["education", "usa"]));
  expect(link(["mag"])).toBe("/magazine/article/test-story");
  expect(link(["unrecognized"])).toBe("/world/article/test-story");
});

test("an explicit section wins over unrelated subsection categories", () => {
  expect(link(["education", "world", "africa"])).toBe("/world/africa/article/test-story");
  expect(link(["world", "europe", "africa"])).toBe(link(["africa", "world", "europe"]));
  expect(link(["us-interviews"])).toBe("/interviews/us-interviews/article/test-story");
});

test("preview payload excludes body and private metadata but preserves podcast playback", async () => {
  const body = '<p>' + 'Article body '.repeat(1000) + '</p><iframe src="https://open.spotify.com/embed/episode/abc123"></iframe>';
  const post: EnhancedPost = { date: "2026-01-01", date_gmt: "2026-01-01", modified: "2026-01-01", modified_gmt: "2026-01-01", guid: { rendered: "" }, status: "publish", type: "post", link: "", author: 1, featured_media: 0, format: "audio", categories: [], tags: [], id: 1, slug: "podcast", title: { rendered: "Podcast" }, excerpt: { rendered: "Summary", protected: false }, content: { rendered: body, protected: false }, meta: { private_field: "private", duration: "30 min" }, author_name: "Writer" };
  const preview = toArticlePreview(post);
  const withoutExcerpt = toArticlePreview({ ...post, excerpt: { rendered: "<p> </p>", protected: false },
    content: { rendered: "<style>hidden</style><p>Article description &amp; context.</p><iframe>Embed text</iframe>", protected: false } });
  expect(withoutExcerpt.excerpt.rendered).toBe("Article description &#x26; context.");
  expect(withoutExcerpt.content.rendered).toBe("");
  expect(toArticlePreview({ ...post, excerpt: { rendered: "", protected: false }, content: { rendered: body, protected: true } }).excerpt.rendered).toBe("");
  expect(preview.title).toEqual(post.title);
  expect(preview.author_name).toBe("Writer");
  expect(preview.content.rendered).toBe("");
  expect(preview.meta?.spotify_url).toBe("https://open.spotify.com/embed/episode/abc123");
  expect(preview.meta?.private_field).toBeUndefined();
  expect(JSON.stringify(preview).length).toBeLessThan(JSON.stringify(post).length / 10);
  expect(post.content.rendered).toBe(body);
  const article = { ...post, meta: {}, author: 0, content: { rendered: '<img src="/pixel.gif" width="1" height="1"><img class="emoji" src="/emoji.png"><img src="data:image/gif;base64,placeholder" data-src="/wp-content/uploads/chart.png?x=1&amp;y=2" width="1200" height="700" alt="Polling chart">', protected: false } };
  const fallback = toArticlePreview(article);
  expect(fallback.featured_media_obj?.source_url).toBe("https://cms.brownpoliticalreview.org/wp-content/uploads/chart.png?x=1&y=2");
  expect(fallback.featured_media_obj?.alt_text).toBe("Polling chart");
  expect(fallback.featured_media_obj?.media_details.width).toBe(1200);
  expect(fallback.content.rendered).toBe("");
  expect(toArticlePreview({ ...article, featured_media_obj: { ...fallback.featured_media_obj!, source_url: "https://brownpoliticalreview.org/cover.jpg" } }).featured_media_obj?.source_url).toBe("https://cms.brownpoliticalreview.org/cover.jpg");
  expect((await enhancePosts([article]))[0].featured_media_obj?.source_url).toBe(fallback.featured_media_obj?.source_url);
  expect((await enhancePost(article)).featured_media_obj?.source_url).toBe(fallback.featured_media_obj?.source_url);
  expect(toArticlePreview({ ...article, content: { rendered: '<img src="javascript:alert(1)">', protected: false } }).featured_media_obj).toBeNull();

});

test("unknown author names use Anonymous while valid attribution is retained", () => {
  for (const author_name of [undefined, "", "   ", "LASTNAME", "LAST NAME", "Unknown Author"]) {
    expect(getAuthorName({ author_name })).toBe("Anonymous");
  }
  expect(getAuthorName({ author_name: "LASTNAME", author_obj: { name: "Henry Knight" } })).toBe("Henry Knight");
  expect(getAuthorName({ author_name: " Henry Knight " })).toBe("Henry Knight");
});

test("media previews detect standard-format video embeds and retain thumbnails after pruning the body", async () => {
  const post: Post = {
    date_gmt: "2026-01-01", modified: "2026-01-01", modified_gmt: "2026-01-01", guid: { rendered: "" },
    status: "publish", type: "post", link: "", tags: [],
    id: 46442, slug: "what-now-episode-2", date: "2026-01-01", author: 0, featured_media: 0,
    format: "standard", title: { rendered: "What Now? Episode 2" },
    content: { rendered: '<iframe src="https://www.youtube.com/embed/RCC7PZfoUTs?feature=oembed"></iframe>', protected: false },
    excerpt: { rendered: "Summary", protected: false }, categories: [], meta: {},
  };
  const expected = { type: "video", thumbnail: "https://i.ytimg.com/vi/RCC7PZfoUTs/hqdefault.jpg" };
  expect(getMediaPreview(post)).toEqual(expected);
  const preview = toArticlePreview(post);
  expect(preview.content.rendered).toBe("");
  expect(getMediaPreview(preview)).toEqual(expected);
  expect(preview.featured_media_obj?.source_url).toBe(expected.thumbnail);
  expect((await enhancePosts([post]))[0].featured_media_obj?.source_url).toBe(expected.thumbnail);
  expect((await enhancePost(post)).featured_media_obj?.source_url).toBe(expected.thumbnail);
  expect(toArticlePreview({ ...post, featured_media_obj: { ...preview.featured_media_obj!, source_url: "https://brownpoliticalreview.org/cover.jpg" } }).featured_media_obj?.source_url).toBe("https://cms.brownpoliticalreview.org/cover.jpg");
  for (const url of ["https://youtu.be/RCC7PZfoUTs", "https://www.youtube-nocookie.com/embed/RCC7PZfoUTs", "https://youtube.com/shorts/RCC7PZfoUTs", "https://youtube.com/watch?v=RCC7PZfoUTs"]) {
    expect(getMediaPreview({ ...post, content: { rendered: `<iframe src="${url}"></iframe>`, protected: false } })).toEqual(expected);
  }
  expect(getMediaPreview({ ...post, content: { rendered: '<iframe src="https://youtube.com.evil.test/embed/RCC7PZfoUTs"></iframe>', protected: false } })).toBeNull();
  expect(getMediaPreview({ ...post, content: { rendered: '<a href="https://youtube.com/watch?v=RCC7PZfoUTs">Source</a>', protected: false } })).toBeNull();
  expect(getMediaPreview({ ...post, content: { ...post.content, protected: true } })).toBeNull();
  expect(getMediaPreview({ ...post, content: { rendered: '<video poster="/wp-content/uploads/video-cover.jpg"></video>', protected: false } })).toEqual({ type: "video", thumbnail: "https://cms.brownpoliticalreview.org/wp-content/uploads/video-cover.jpg" });
  expect(getMediaPreview({ ...post, content: { rendered: '<iframe src="https://player.vimeo.com/video/12345"></iframe>', protected: false } })).toEqual({ type: "video" });
  expect(getMediaPreview({ ...post, content: { rendered: '<audio src="/interview.mp3"></audio>', protected: false } })).toEqual({ type: "audio" });
  expect(getMediaPreview({ ...post, content: { rendered: '<iframe src="https://open.spotify.com/embed/episode/abc123"></iframe>', protected: false } })).toEqual({ type: "audio" });
  expect(getMediaPreview({
    ...post,
    title: { rendered: "Spray-Painting Politics: From Bed-Stuy to La Boca" },
    content: { rendered: "", protected: false },
    categories_obj: [
      { id: 1, count: 1, description: "", link: "", name: "Media", slug: "media", taxonomy: "category", parent: 0, meta: [] },
      { id: 2, count: 1, description: "", link: "", name: "Photo Essays and Infographics", slug: "photo-essays", taxonomy: "category", parent: 0, meta: [] },
    ],
  })).toEqual({ type: "gallery" });
  expect(getMediaPreview({
    ...post,
    title: { rendered: "Infographic: Special Elections" },
    content: { rendered: "", protected: false },
    categories_obj: [{ id: 1, count: 1, description: "", link: "", name: "Media", slug: "media", taxonomy: "category", parent: 0, meta: [] }],
  })).toEqual({ type: "data" });
});
