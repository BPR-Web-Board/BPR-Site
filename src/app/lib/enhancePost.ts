import { decode, encode } from "he";
import { getAuthorName, resolveWordPressMediaUrl } from "./utils";
import { getMediaPreview } from "./mediaPreview";
import {
  getFeaturedMediaById,
  getAuthorById,
  getAuthorsByIds,
  getMediaByIds,
  getPostContentByIds,
} from "./wordpress";
import { Post, Category, EnhancedPost, Author, FeaturedMedia } from "./types";

function withResolvedMediaUrl(media: FeaturedMedia | null): FeaturedMedia | null {
  if (!media?.source_url) return media;
  const source_url = resolveWordPressMediaUrl(media.source_url);
  if (source_url === media.source_url) return media;
  return { ...media, source_url, link: media.link ? resolveWordPressMediaUrl(media.link) : source_url };
}

function resolvePostMedia(post: Post | EnhancedPost, featured: FeaturedMedia | null): FeaturedMedia | null {
  if (featured?.source_url) return withResolvedMediaUrl(featured);
  const base = /^https?:\/\//i.test(post.link) ? post.link : process.env.WORDPRESS_URL || "https://brownpoliticalreview.org/";
  for (const match of (post.content?.rendered || "").matchAll(/<img\b[^>]*>/gi)) {
    const attributes: Record<string, string> = {};
    for (const attribute of match[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attributes[attribute[1].toLowerCase()] = decode(attribute[2] ?? attribute[3] ?? attribute[4] ?? "");
    }
    const width = parseInt(attributes.width || "", 10);
    const height = parseInt(attributes.height || "", 10);
    if (width <= 2 || height <= 2 || /\b(avatar|emoji|wp-smiley)\b/i.test(attributes.class || "")) continue;
    const srcset = (attributes["data-srcset"] || attributes.srcset || "").split(",")
      .map(candidate => candidate.trim().split(/\s+/))
      .sort((a, b) => (parseFloat(b[1]) || 0) - (parseFloat(a[1]) || 0))
      .map(candidate => candidate[0]);
    const candidates = [attributes["data-orig-file"], attributes["data-src"], attributes["data-lazy-src"], attributes.src, ...srcset];
    for (const candidate of candidates) {
      if (!candidate?.trim()) continue;
      try {
        const url = new URL(candidate.trim(), base);
        if (!["https:", "http:"].includes(url.protocol)) continue;
        return withResolvedMediaUrl({
          id: 0, date: post.date, slug: "", type: "attachment", link: url.href,
          title: { rendered: "" }, author: post.author, caption: { rendered: "" },
          alt_text: attributes.alt || "", media_type: "image", mime_type: "",
          source_url: url.href,
          media_details: { width: width > 2 ? width : 800, height: height > 2 ? height : 600, file: "", sizes: {} },
        });
      } catch {}
    }
  }
  const thumbnail = getMediaPreview(post)?.thumbnail;
  if (thumbnail) return withResolvedMediaUrl({
    id: 0, date: post.date, slug: "", type: "attachment", link: thumbnail,
    title: { rendered: "" }, author: post.author, caption: { rendered: "" },
    alt_text: "Video thumbnail", media_type: "image", mime_type: "image/jpeg", source_url: thumbnail,
    media_details: { width: 480, height: 360, file: "", sizes: {} },
  });
  return null;
}

type EmbeddedPost = Post & {
  _embedded?: Post["_embedded"];
};

/**
 * Enhances a single post with additional data (featured media, author info, categories)
 * Note: For multiple posts, use enhancePosts() which is more efficient with batch fetching
 */
export async function enhancePost(
  post: Post,
  categories?: Category[]
): Promise<EnhancedPost> {
  const embedded = (post as EmbeddedPost)._embedded;
  let featured_media_obj = null;
  const embeddedMedia = embedded?.["wp:featuredmedia"]?.[0];
  if (embeddedMedia?.source_url) {
    featured_media_obj = {
      id: embeddedMedia.id,
      date: "",
      slug: "",
      type: "attachment",
      link: embeddedMedia.source_url,
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      alt_text: embeddedMedia.alt_text || "",
      media_type: embeddedMedia.media_type || "image",
      mime_type: embeddedMedia.mime_type || "",
      source_url: embeddedMedia.source_url,
      media_details: {
        width: embeddedMedia.media_details?.width || 800,
        height: embeddedMedia.media_details?.height || 600,
        file: embeddedMedia.media_details?.file || "",
        sizes: (embeddedMedia.media_details?.sizes || {}) as FeaturedMedia["media_details"]["sizes"],
      },
    } as FeaturedMedia;
  } else if (post.featured_media && typeof post.featured_media === "number") {
    try {
      featured_media_obj = await getFeaturedMediaById(post.featured_media);
    } catch (error) {
      console.error("Error fetching featured media:", error);
    }
  }

  let author_obj = null;
  let author_name = "Anonymous";
  const embeddedAuthor = embedded?.author?.[0];
  if (embeddedAuthor?.id) {
    author_obj = embeddedAuthor as Author;
    author_name = getAuthorName({ author_obj });
  } else if (post.author && typeof post.author === "number") {
    try {
      author_obj = await getAuthorById(post.author);
      author_name = getAuthorName({ author_obj });
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }

  let resolvedPost = post;
  if (!featured_media_obj && !post.content?.rendered) {
    try {
      const [body] = await getPostContentByIds([post.id]);
      if (body?.content) resolvedPost = { ...post, content: body.content };
    } catch (error) {
      console.error("Error fetching post content for media fallback:", error);
    }
  }

  // Match categories
  let categories_obj: Category[] = [];
  if (categories && resolvedPost.categories && resolvedPost.categories.length > 0) {
    categories_obj = categories.filter((cat) =>
      resolvedPost.categories.includes(cat.id)
    );
  }

  return {
    ...resolvedPost,
    featured_media_obj: resolvePostMedia(resolvedPost, featured_media_obj),
    author_obj,
    author_name,
    media_preview: getMediaPreview({ ...resolvedPost, categories_obj }),
    categories_obj,
  };
}

/**
 * Enhances multiple posts with additional data using optimized batch fetching
 * This solves the N+1 problem by fetching all authors and media in 2 requests
 * instead of 2 requests per post
 */
export async function enhancePosts(
  posts: Post[],
  categories?: Category[]
): Promise<EnhancedPost[]> {
  if (posts.length === 0) return [];

  const authorMap = new Map<number, Author>();
  const mediaMap = new Map<number, FeaturedMedia>();
  const authorIds = new Set<number>();
  const mediaIds = new Set<number>();
  const contentFallbackIds: number[] = [];

  for (const post of posts as EmbeddedPost[]) {
    const embeddedAuthor = post._embedded?.author?.[0];
    if (embeddedAuthor?.id) authorMap.set(embeddedAuthor.id, embeddedAuthor as Author);
    else if (post.author && typeof post.author === "number") authorIds.add(post.author);

    const embeddedMedia = post._embedded?.["wp:featuredmedia"]?.[0];
    if (embeddedMedia?.id && embeddedMedia.source_url) {
      mediaMap.set(embeddedMedia.id, {
        id: embeddedMedia.id,
        date: "",
        slug: "",
        type: "attachment",
        link: embeddedMedia.source_url,
        title: { rendered: "" },
        author: 0,
        caption: { rendered: "" },
        alt_text: embeddedMedia.alt_text || "",
        media_type: embeddedMedia.media_type || "image",
        mime_type: embeddedMedia.mime_type || "",
        source_url: embeddedMedia.source_url,
        media_details: {
          width: embeddedMedia.media_details?.width || 800,
          height: embeddedMedia.media_details?.height || 600,
          file: embeddedMedia.media_details?.file || "",
          sizes: (embeddedMedia.media_details?.sizes || {}) as FeaturedMedia["media_details"]["sizes"],
        },
      });
    } else if (post.featured_media && typeof post.featured_media === "number") {
      mediaIds.add(post.featured_media);
    }

    if (!post.content?.rendered) {
      contentFallbackIds.push(post.id);
    }
  }

  const [authors, mediaItems, contentPosts] = await Promise.all([
    authorIds.size > 0
      ? getAuthorsByIds(Array.from(authorIds)).catch((error) => {
          console.error("Error batch fetching authors:", error);
          return [] as Author[];
        })
      : Promise.resolve([] as Author[]),
    mediaIds.size > 0
      ? getMediaByIds(Array.from(mediaIds)).catch((error) => {
          console.error("Error batch fetching media:", error);
          return [] as FeaturedMedia[];
        })
      : Promise.resolve([] as FeaturedMedia[]),
    contentFallbackIds.length > 0
      ? getPostContentByIds(contentFallbackIds).catch((error) => {
          console.error("Error batch fetching post content for media fallback:", error);
          return [] as Array<Pick<Post, "id" | "content">>;
        })
      : Promise.resolve([] as Array<Pick<Post, "id" | "content">>),
  ]);

  authors.forEach((author) => authorMap.set(author.id, author));
  mediaItems.forEach((media) => mediaMap.set(media.id, media));
  const contentById = new Map(contentPosts.map((entry) => [entry.id, entry.content]));
  const hydratedPosts = posts.map((post) => {
    const content = contentById.get(post.id);
    return content ? { ...post, content } : post;
  });

  // Enhance all posts using the lookup maps
  return hydratedPosts.map((post) => {
    // Get author info from map
    let author_obj = null;
    let author_name = "Anonymous";
    if (post.author && typeof post.author === "number") {
      author_obj = authorMap.get(post.author) || null;
      if (author_obj) {
        author_name = getAuthorName({ author_obj });
      }
    }

    // Get featured media from map
    let featured_media_obj = null;
    if (post.featured_media && typeof post.featured_media === "number") {
      featured_media_obj = mediaMap.get(post.featured_media) || null;
    }

    // Match categories
    let categories_obj: Category[] = [];
    if (categories && post.categories && post.categories.length > 0) {
      categories_obj = categories.filter((cat) =>
        post.categories.includes(cat.id)
      );
    }

    return {
      ...post,
      featured_media_obj: resolvePostMedia(post, featured_media_obj),
      author_obj,
      author_name,
      media_preview: getMediaPreview({ ...post, categories_obj }),
      categories_obj,
    };
  });
}

export function toArticlePreview(post: EnhancedPost): EnhancedPost {
  const media = resolvePostMedia(post, post.featured_media_obj || null);
  const hasExcerpt = decode((post.excerpt?.rendered || "").replace(/<[^>]*>/g, "")).trim();
  const bodyText = !hasExcerpt && !post.content.protected
    ? decode(post.content.rendered
      .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim()
    : "";
  const excerpt = hasExcerpt ? post.excerpt : {
    rendered: encode(bodyText.length > 500 ? `${bodyText.slice(0, 500).replace(/\s+\S*$/, "")}…` : bodyText),
    protected: post.excerpt?.protected || false,
  };
  const spotify =
    post.content.rendered.match(
      /<(?:iframe|embed)\b[^>]*\b(?:data-src|src)=["']([^"']*spotify\.com[^"']*)["']/i
    )?.[1]?.replace(/&amp;/g, "&") ||
    post.content.rendered.match(
      /https?:\/\/(?:open\.)?spotify\.com\/(?:embed\/)?(?:episode|show|track)\/[a-zA-Z0-9]+(?:\?[^\s"<>)]*)?/i
    )?.[0];
  return {
    id: post.id, slug: post.slug, date: post.date, date_gmt: post.date_gmt,
    modified: post.modified, modified_gmt: post.modified_gmt,
    guid: { rendered: "" }, status: post.status, type: post.type, link: post.link,
    media_preview: getMediaPreview(post),
    title: post.title, excerpt, content: { rendered: "", protected: false },
    author: post.author, featured_media: post.featured_media, format: post.format,
    categories: post.categories, tags: post.tags || [],
    meta: { duration: post.meta?.duration, spotify_url: post.meta?.spotify_url || spotify },
    author_name: getAuthorName(post), illustrator: post.illustrator,
    categories_obj: post.categories_obj?.map(({ id, slug, name, parent }) =>
      ({ id, slug, name, parent, count: 0, description: "", link: "", taxonomy: "category", meta: [] })),
    featured_media_obj: media ? {
      id: media.id,
      date: "", slug: "", type: "attachment", link: "",
      title: { rendered: "" }, author: 0, caption: { rendered: "" },
      alt_text: media.alt_text,
      media_type: media.media_type,
      mime_type: media.mime_type,
      source_url: media.source_url,
      media_details: {
        width: media.media_details?.width || 800,
        height: media.media_details?.height || 600,
        file: "", sizes: {},
      },
    } : null,
  };
}

export async function enhancePreviewPosts(posts: Post[], categories?: Category[]) {
  return (await enhancePosts(posts, categories)).map(toArticlePreview);
}
