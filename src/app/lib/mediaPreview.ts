import { decode } from "he";
import type { EnhancedPost, MediaPreview } from "./types";

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

export function getArticleVideoEmbed(post: MediaPost): ArticleVideoEmbed | null {
  const content = post.content?.protected ? "" : post.content?.rendered || "";
  if (!content) return null;

  const embeds = Array.from(
    content.matchAll(/<(?:iframe|embed)\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/gi),
    (match) => decode(match[1])
  );
  for (const candidate of embeds) {
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
          return { provider: "file", src: url.href, poster: posterUrl };
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
  const embeds = Array.from(content.matchAll(/<(?:iframe|embed)\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/gi), match => decode(match[1]));
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
        if (["http:", "https:"].includes(url.protocol)) return { type: "video", thumbnail: url.href };
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
