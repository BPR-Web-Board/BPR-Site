import { decode } from "he";

export type IssueSource = {
  id: number;
  date: string;
  link?: string;
  title: { rendered: string };
  content: { rendered: string; protected?: boolean };
  _embedded?: { "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[] };
};

export type Issue = {
  id: string;
  title: string;
  slug: string;
  issueTag: string | number;
  published: string | null;
  timestamp: number;
  pdf: string | null;
  background: string;
  color: string;
  cover?: { url: string; alt: string };
};

type ContentImage = { offset: number; url: string; alt: string };
const fields = new Set(["title", "published", "pdf", "background-color", "text-color", "cover", "issue-tag"]);

function httpUrl(value: string, base?: string): string | undefined {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
    return url.href;
  } catch { return; }
}

function readHtml(html: string, base: string) {
  let text = "";
  let editorNotes = false;
  const images: ContentImage[] = [];
  const clean = html.replace(/<!--([\s\S]*?)-->/g, (_, note: string) => /EDITOR\s+INSTRUCTIONS/i.test(note) ? note : "").replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  for (const token of clean.matchAll(/<[^>]*>|[^<]+/g)) {
    let value = token[0];
    if (!value.startsWith("<")) {
      value = decode(value);
      const marker = /(?:END\s+)?EDITOR\s+INSTRUCTIONS/gi;
      let visible = "";
      let cursor = 0;
      for (const match of value.matchAll(marker)) {
        if (!editorNotes) visible += value.slice(cursor, match.index);
        editorNotes = !/^END\s/i.test(match[0]);
        cursor = match.index! + match[0].length;
      }
      if (!editorNotes) visible += value.slice(cursor);
      text += visible.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ");
      continue;
    }
    if (editorNotes) continue;
    if (value.startsWith("<")) {
      if (/^<img\b/i.test(value)) {
        const attrs: Record<string, string> = {};
        for (const attr of value.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
          attrs[attr[1].toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? "");
        }
        if (parseInt(attrs.width, 10) <= 2 || parseInt(attrs.height, 10) <= 2 || /\b(avatar|emoji|wp-smiley)\b/i.test(attrs.class || "")) continue;
        const url = [attrs["data-orig-file"], attrs["data-src"], attrs["data-lazy-src"], attrs.src]
          .filter(Boolean).map(src => httpUrl(src, base)).find(Boolean);
        if (url) images.push({ offset: text.length, url, alt: attrs.alt || "" });
      }
      if (/^<br\b|^<\/?(?:p|div|section|article|h[1-6]|li|ul|ol|blockquote|pre|tr|table|figure|figcaption)\b/i.test(value)) text += "\n";
    }
  }
  return { text, images };
}

export function issueHtmlToText(html: string): string {
  return readHtml(html, "https://brownpoliticalreview.org/").text;
}

export function validIssueDate(value: string): { published: string; timestamp: number } | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, zone] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)
    || Number(hour || 0) > 23 || Number(minute || 0) > 59 || Number(second || 0) > 59) return null;
  const timestamp = Date.parse(hour ? value + (zone ? "" : "Z") : `${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? { published: value.slice(0, 10), timestamp } : null;
}

export function validIssuePdf(value: string): string | undefined {
  const safe = httpUrl(value);
  if (!safe) return;
  try {
    if (/\.pdf$/i.test(decodeURIComponent(new URL(safe).pathname))) return safe;
  } catch {}
}

/** Site paper/ink defaults from globals.css — used when WordPress omits issue colors. */
export const DEFAULT_ISSUE_BACKGROUND = "#fffefa";
export const DEFAULT_ISSUE_COLOR = "#0d0b00";

function validHex(value: string | undefined, fallback: string): string {
  return value && /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value) ? value : fallback;
}

/** Builds tags like `bpr-fall2026-issue2` or `bpr-winter2014-issue` from issue titles. */
export function issueTagFromTitle(title: string, fallback: string): string {
  const normalized = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const match = normalized.match(/\b(spring|summer|fall|autumn|winter)\s*(\d{4})\b(?:.*?\bissue\s*(\d+)\b)?/);
  if (!match) return fallback;
  const season = match[1] === "autumn" ? "fall" : match[1];
  return match[3] ? `bpr-${season}${match[2]}-issue${match[3]}` : `bpr-${season}${match[2]}-issue`;
}

/** Display heading like `Spring 2026 · Issue 2` from CMS titles such as `BPR Spring 2026 Issue 2`. */
export function formatIssueHeading(title: string): string {
  const normalized = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const match = normalized.match(/\b(spring|summer|fall|autumn|winter)\s+(\d{4})\b(?:.*?\bissue\s*(\d+)\b)?/i);
  if (!match) return title.replace(/^BPR\s+/i, "").trim() || title;
  const seasonKey = match[1].toLowerCase() === "autumn" ? "fall" : match[1].toLowerCase();
  const season = seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1);
  return match[3] ? `${season} ${match[2]} · Issue ${match[3]}` : `${season} ${match[2]}`;
}

export function parseIssueSource(source: IssueSource): Issue[] {
  if (source.content.protected) return [];
  const base = httpUrl(source.link || "") || "https://brownpoliticalreview.org/";
  const { text, images } = readHtml(source.content.rendered, base);
  const blocks: { values: Record<string, string>; start: number; end: number }[] = [];
  let current = { values: {} as Record<string, string>, start: 0, end: 0 };
  let offset = 0;
  for (const line of text.split("\n")) {
    const colon = line.indexOf(":");
    const key = line.slice(0, colon).trim().toLowerCase();
    if (colon >= 0 && fields.has(key)) {
      if (Object.prototype.hasOwnProperty.call(current.values, key) || (key === "title" && Object.keys(current.values).length)) {
        blocks.push(current);
        current = { values: {}, start: offset, end: offset };
      }
      if (!Object.keys(current.values).length) current.start = offset;
      current.values[key] = line.slice(colon + 1).trim();
      current.end = offset + line.length;
    }
    offset += line.length + 1;
  }
  if (Object.keys(current.values).length) blocks.push(current);
  const featured = source._embedded?.["wp:featuredmedia"]?.[0];
  const featuredUrl = featured?.source_url ? httpUrl(featured.source_url, base) : undefined;
  const fallbackTitle = issueHtmlToText(source.title.rendered).trim().replace(/\s+/g, " ") || "Untitled Issue";
  return blocks.flatMap((block, index) => {
    const pdf = validIssuePdf(block.values.pdf || "") || null;
    const assignedBackground = validHex(block.values["background-color"], "");
    const assignedColor = validHex(block.values["text-color"], "");
    // Keep archive rows with a title or theme colors even before a PDF is added.
    if (!pdf && !block.values.title && !assignedBackground && !assignedColor) return [];
    const date = validIssueDate(block.values.published || "") || validIssueDate(source.date);
    const title = block.values.title || fallbackTitle;
    const slugified = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `issue-${source.id}-${index}`;
    const defaultSlug = issueTagFromTitle(title, slugified);
    const identifier = block.values["issue-tag"] || defaultSlug;
    const numericTag = /^\d+$/.test(identifier) && Number.isSafeInteger(Number(identifier)) && Number(identifier) > 0;
    const issueTag = numericTag ? Number(identifier) : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(identifier) ? identifier : defaultSlug;
    const slug = typeof issueTag === "string" ? issueTag : defaultSlug;
    const previousEnd = index ? blocks[index - 1].end : -1;
    const preceding = images.filter(image => image.offset >= previousEnd && image.offset <= block.start);
    const within = images.find(image => image.offset >= block.start && image.offset <= block.end);
    const after = index === blocks.length - 1 ? images.find(image => image.offset >= block.end) : undefined;
    const explicitCover = httpUrl(block.values.cover || "");
    const cover = explicitCover ? { url: explicitCover, alt: "" } : preceding[preceding.length - 1] || within || after;
    return [{
      id: `${source.id}-${index}`, title, slug, issueTag,
      published: date?.published || null, timestamp: date?.timestamp || 0, pdf,
      background: assignedBackground || DEFAULT_ISSUE_BACKGROUND,
      color: assignedColor || DEFAULT_ISSUE_COLOR,
      cover: featuredUrl && !explicitCover && (blocks.length === 1 || !cover) ? { url: featuredUrl, alt: featured?.alt_text || "" } : cover ? { url: cover.url, alt: cover.alt } : undefined,
    }];
  });
}

export function parseIssues(sources: IssueSource[]): Issue[] {
  const seen = new Set<string>();
  return sources.flatMap(parseIssueSource).sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id)).filter(issue => {
    if (!issue.pdf) return true;
    const key = new URL(issue.pdf);
    key.hash = "";
    if (seen.has(key.href)) return false;
    seen.add(key.href);
    return true;
  });
}


export function getIssueThemeCss(issue: Issue): string {
  const background = validHex(issue.background, "");
  const text = validHex(issue.color, "");
  // Site defaults are for archive chrome only — omit page theme CSS unless WordPress set custom colors.
  if (!background || !text || (background === DEFAULT_ISSUE_BACKGROUND && text === DEFAULT_ISSUE_COLOR)) return "";
  const rules = [
    `--surface:${background}`,
    `--foreground:${text}`,
    `--text-primary:${text}`,
    `--text-secondary:${text}`,
    `--text-muted:${text}`,
    "--surface-muted:color-mix(in srgb,var(--foreground) 6%,var(--surface))",
    "--surface-hover:color-mix(in srgb,var(--foreground) 10%,var(--surface))",
    "--surface-skeleton:color-mix(in srgb,var(--foreground) 12%,var(--surface))",
    "--divider-color:color-mix(in srgb,var(--foreground) 25%,var(--surface))",
  ];
  return `:root[data-theme="issue"]{${rules.join(";")}}`;
}
