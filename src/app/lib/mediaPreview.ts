import { decode } from "he";
import type { EnhancedPost, MediaPreview } from "./types";
import { resolveWordPressMediaUrl } from "./utils";

type MediaPost = Pick<EnhancedPost, "title" | "format" | "content" | "meta" | "categories_obj" | "media_preview">;

export type ArticleVideoEmbed = {
  provider: "youtube" | "vimeo" | "file";
  src: string;
  poster?: string;
};

function youtubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1];
  else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
    id = /^\/(embed|shorts|live)\//.test(url.pathname)
      ? url.pathname.split("/")[2]
      : url.searchParams.get("v");
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[1];
    return id && /^\d+$/.test(id) ? id : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? id : null;
  }
  return null;
}

function parseVideoCandidate(candidate: string): ArticleVideoEmbed | null {
  try {
    const url = new URL(candidate, "https://brownpoliticalreview.org");
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const yt = youtubeId(url);
    if (yt) {
      return {
        provider: "youtube",
        src: `https://www.youtube.com/embed/${yt}`,
        poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      };
    }
    const vimeo = vimeoId(url);
    if (vimeo) {
      return {
        provider: "vimeo",
        src: `https://player.vimeo.com/video/${vimeo}`,
      };
    }
  } catch {}
  return null;
}

function iframeEmbedCandidates(html: string): string[] {
  const candidates: string[] = [];
  for (const match of html.matchAll(/<(?:iframe|embed)\b([^>]*)>/gi)) {
    const attrs = match[1] || "";
    const values = Array.from(
      attrs.matchAll(/\b(?:data-src|src)\s*=\s*["']([^"']+)["']/gi),
      (item) => decode(item[1])
    );
    values.sort((a, b) => Number(/^https?:/i.test(b)) - Number(/^https?:/i.test(a)));
    candidates.push(...values);
  }
  return candidates;
}

function resolveContentMediaUrl(value: string): string {
  const decoded = decode(value).trim();
  if (!decoded || decoded.startsWith("data:") || /^about:/i.test(decoded)) return value;
  try {
    const absolute = new URL(decoded, "https://brownpoliticalreview.org").href;
    if (!["http:", "https:"].includes(new URL(absolute).protocol)) return value;
    return resolveWordPressMediaUrl(absolute);
  } catch {
    return value;
  }
}

function rewriteSrcset(value: string): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return part;
      const match = trimmed.match(/^(\S+)(\s+.*)?$/);
      if (!match) return part;
      const resolved = resolveContentMediaUrl(match[1]);
      return `${resolved}${match[2] || ""}`;
    })
    .join(", ");
}

export function hydrateLazyEmbeds(html: string): string {
  const next = html.replace(
    /<(iframe|embed|audio|video|source|img)\b([^>]*)>/gi,
    (tag, name: string, attrs: string) => {
      let nextAttrs = attrs;
      const dataSrc = attrs.match(/(?<![\w-])data-src\s*=\s*["']([^"']+)["']/i)?.[1];
      if (dataSrc) {
        const real = resolveContentMediaUrl(dataSrc);
        if (/^https?:\/\//i.test(decode(real))) {
          if (/(?<![\w-])src\s*=/i.test(nextAttrs)) {
            nextAttrs = nextAttrs.replace(/(?<![\w-])src\s*=\s*["'][^"']*["']/i, `src="${real}"`);
          } else {
            nextAttrs += ` src="${real}"`;
          }
          nextAttrs = nextAttrs.replace(/\sclass=(["'])([^"']*)\1/i, (_, quote: string, className: string) => {
            const cleaned = className
              .split(/\s+/)
              .filter((item) => item && item !== "lazyload")
              .join(" ");
            return cleaned ? ` class=${quote}${cleaned}${quote}` : "";
          });
        }
      }

      nextAttrs = nextAttrs.replace(
        /(?<![\w-])(src|poster)\s*=\s*(["'])([^"']*)\2/gi,
        (match, attr: string, quote: string, value: string) => {
          const resolved = resolveContentMediaUrl(value);
          return resolved === value ? match : `${attr}=${quote}${resolved}${quote}`;
        }
      );
      nextAttrs = nextAttrs.replace(
        /(?<![\w-])(srcset|data-srcset)\s*=\s*(["'])([^"']*)\2/gi,
        (match, attr: string, quote: string, value: string) => {
          const resolved = rewriteSrcset(value);
          return resolved === value ? match : `${attr}=${quote}${resolved}${quote}`;
        }
      );

      return nextAttrs === attrs ? tag : `<${name}${nextAttrs}>`;
    }
  );

  return next.replace(/<a\b([^>]*)>/gi, (tag, attrs: string) => {
    const nextAttrs = attrs.replace(/\bhref\s*=\s*(["'])([^"']*)\1/gi, (match: string, quote: string, value: string) => {
      if (!/wp-content\//i.test(value)) return match;
      const resolved = resolveContentMediaUrl(value);
      return resolved === value ? match : `href=${quote}${resolved}${quote}`;
    });
    return nextAttrs === attrs ? tag : `<a${nextAttrs}>`;
  });
}

export function getArticleVideoEmbed(post: MediaPost): ArticleVideoEmbed | null {
  const content = post.content?.protected ? "" : post.content?.rendered || "";
  if (!content) return null;

  for (const candidate of iframeEmbedCandidates(content)) {
    const embed = parseVideoCandidate(candidate);
    if (embed) return embed;
  }

  const videoTag = content.match(/<video\b[^>]*>/i)?.[0];
  if (videoTag) {
    const src =
      videoTag.match(/\b(?:src|data-src)\s*=\s*["']([^"']+)["']/i)?.[1] ||
      content.match(/<video\b[^>]*>[\s\S]*?<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const poster = videoTag.match(/\bposter\s*=\s*["']([^"']+)["']/i)?.[1];
    if (src) {
      try {
        const url = new URL(decode(src), "https://brownpoliticalreview.org");
        if (["http:", "https:"].includes(url.protocol)) {
          let posterUrl: string | undefined;
          if (poster) {
            try {
              const parsed = new URL(decode(poster), "https://brownpoliticalreview.org");
              if (["http:", "https:"].includes(parsed.protocol)) posterUrl = parsed.href;
            } catch {}
          }
          return {
            provider: "file",
            src: resolveWordPressMediaUrl(url.href),
            poster: posterUrl ? resolveWordPressMediaUrl(posterUrl) : undefined,
          };
        }
      } catch {}
    }
  }

  return null;
}

export function stripArticleVideoEmbed(html: string, embed: ArticleVideoEmbed): string {
  let next = html;
  if (embed.provider === "youtube" || embed.provider === "vimeo") {
    const host =
      embed.provider === "youtube"
        ? String.raw`(?:www\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)`
        : String.raw`(?:www\.)?(?:player\.)?vimeo\.com`;
    const wrapped = new RegExp(
      String.raw`<figure\b[^>]*\bwp-block-embed[^>]*>[\s\S]*?<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["'][^"']*${host}[^"']*["'][^>]*>\s*</iframe>[\s\S]*?</figure>`,
      "i"
    );
    const iframe = new RegExp(
      String.raw`<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["'][^"']*${host}[^"']*["'][^>]*>\s*</iframe>`,
      "i"
    );
    if (wrapped.test(next)) next = next.replace(wrapped, "");
    else next = next.replace(iframe, "");
  } else {
    const wrapped = /<figure\b[^>]*>[\s\S]*?<video\b[^>]*>[\s\S]*?<\/video>[\s\S]*?<\/figure>/i;
    const video = /<video\b[^>]*>[\s\S]*?<\/video>/i;
    if (wrapped.test(next)) next = next.replace(wrapped, "");
    else next = next.replace(video, "");
  }
  return next.replace(/^(?:\s|<p>(?:\s|&nbsp;)*<\/p>)+/i, "");
}

export function getMediaPreview(post: MediaPost): MediaPreview | null {
  if (post.media_preview) return post.media_preview;
  const content = post.content?.protected ? "" : post.content?.rendered || "";
  const title = decode(typeof post.title === "string" ? post.title : post.title?.rendered || "");
  const categories = post.categories_obj?.map(category => category.slug) || [];
  const embeds = iframeEmbedCandidates(content);
  const hasVideoTag = /<video\b/i.test(content);
  const isVideo = post.format === "video" || /\[video\]/i.test(title) || hasVideoTag;
  const candidates = [
    ...embeds,
    ...(isVideo ? Array.from(content.matchAll(/https?:\/\/[^\s<>"']+/gi), (match) => decode(match[0])) : []),
  ];
  let embeddedVideo = false;
  for (const candidate of candidates) {
    const embed = parseVideoCandidate(candidate);
    if (embed?.provider === "youtube") {
      return { type: "video", thumbnail: embed.poster };
    }
    if (embed?.provider === "vimeo") embeddedVideo = true;
  }
  if (isVideo || embeddedVideo) {
    const poster = content.match(/<video\b[^>]*\bposter\s*=\s*["']([^"']+)["']/i)?.[1];
    if (poster) {
      try {
        const url = new URL(decode(poster), "https://brownpoliticalreview.org");
        if (["http:", "https:"].includes(url.protocol)) {
          return { type: "video", thumbnail: resolveWordPressMediaUrl(url.href) };
        }
      } catch {}
    }
    return { type: "video" };
  }
  if (post.format === "audio" || post.meta?.spotify_url || /<audio\b/i.test(content)
    || embeds.some(url => /^(?:https?:)?\/\/(?:open\.)?spotify\.com\//i.test(url) || /^(?:https?:)?\/\/(?:w\.)?soundcloud\.com\//i.test(url))
    || categories.some(slug => ["bpradio", "bpr-prodcast", "podcast", "podcasts"].includes(slug))) return { type: "audio" };
  if (post.format === "gallery" || /photo\s*essay/i.test(title)
    || categories.some(slug => /photo-?essays?/.test(slug))) return { type: "gallery" };
  if (categories.includes("data") || /\[data commentary\]/i.test(title) || /^infographic\b/i.test(title)) return { type: "data" };
  if (categories.some(slug => ["media", "bpr-media", "multimedia"].includes(slug))) return { type: "media" };
  return null;
}
