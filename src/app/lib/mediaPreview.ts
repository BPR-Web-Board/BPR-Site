import { decode } from "he";
import type { EnhancedPost, MediaPreview } from "./types";

type MediaPost = Pick<EnhancedPost, "title" | "format" | "content" | "meta" | "categories_obj" | "media_preview">;

export function getMediaPreview(post: MediaPost): MediaPreview | null {
  if (post.media_preview) return post.media_preview;
  const content = post.content?.protected ? "" : post.content?.rendered || "";
  const title = decode(typeof post.title === "string" ? post.title : post.title?.rendered || "");
  const categories = post.categories_obj?.map(category => category.slug) || [];
  const embeds = Array.from(content.matchAll(/<(?:iframe|embed)\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/gi), match => decode(match[1]));
  const isVideo = post.format === "video" || /\[video\]/i.test(title) || /<video\b/i.test(content);
  const candidates = isVideo
    ? [...embeds, ...Array.from(content.matchAll(/https?:\/\/[^\s<>"']+/gi), match => decode(match[0]))]
    : embeds;
  let embeddedVideo = false;
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate, "https://brownpoliticalreview.org");
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      let id: string | null = null;
      if (host === "youtu.be") id = url.pathname.split("/")[1];
      else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
        id = /^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split("/")[2] : url.searchParams.get("v");
      }
      if (id && /^[\w-]{11}$/.test(id)) return { type: "video", thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
      if (host === "player.vimeo.com" || host === "vimeo.com") embeddedVideo = true;
    } catch {}
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
