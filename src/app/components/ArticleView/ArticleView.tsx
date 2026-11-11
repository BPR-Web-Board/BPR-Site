"use client";
import { getAuthorName, formatArchiveDate, withExternalLinkTargets, resolveWordPressMediaUrl } from "../../lib/utils";
import type { ArticleIssueRef } from "../../lib/articleIssue";
import {
  getArticleVideoEmbed,
  hydrateLazyEmbeds,
  stripArticleVideoEmbed,
} from "../../lib/mediaPreview";
import ArticleTitle from "../shared/ArticleTitle/ArticleTitle";
import CategoryPills from "../shared/CategoryPills/CategoryPills";
import React, { useRef, useEffect, useLayoutEffect, useState, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUp, Expand, X } from "lucide-react";
import { EnhancedPost } from "../../lib/types";
import he from "he";
import "./ArticleView.css";
import FourArticleGrid from "../FourArticleGrid";

const ARTICLE_SECTION_ROOTS = [
  "magazine",
  "culture",
  "world",
  "united-states",
  "interviews",
  "multimedia",
] as const;

function getArticleBackLink(pathname: string): { href: string; label: "Back" } {
  const section = pathname.split("/").filter(Boolean)[0];
  if (section === "magazine") {
    return { href: "/magazine/issues", label: "Back" };
  }
  if (section && ARTICLE_SECTION_ROOTS.includes(section as (typeof ARTICLE_SECTION_ROOTS)[number])) {
    return { href: `/${section}`, label: "Back" };
  }
  return { href: "/", label: "Back" };
}

function goArticleBack(fallbackHref: string) {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.assign(fallbackHref);
}

interface ArticleViewProps {
  post: EnhancedPost;
  relatedPosts?: EnhancedPost[];
  issue?: ArticleIssueRef | null;
  specialFeature?: boolean;
}

interface ContentBlock {
  type: "text" | "pullquote" | "image";
  content: string;
  index: number;
  citation?: string;
  imageData?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
    link?: string;
  };
}

interface PullQuotePosition {
  index: number;
  topOffset: number;
}

// Clean up leading punctuation/quotes specifically for pull quotes
function cleanPullQuote(text: string): string {
  let t = stripHtml(text);

  // Remove any leading quotation marks (straight or typographic)
  t = t.replace(
    /^["'\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A\s]+/,
    ""
  );

  // If text starts with a solitary punctuation like . , ; : ! ? followed by a space and then a letter, drop it
  t = t.replace(/^[\.,;:!?]\s+(?=[A-Za-z])/, "");

  // As a last guard, strip any remaining non-alphanumeric run at start if it precedes a letter/number
  t = t.replace(/^[^A-Za-z0-9]+(?=[A-Za-z0-9])/, "");

  return t.trim();
}

function extractContentBlocks(htmlContent: string): ContentBlock[] {
  // Define all quote patterns with their extraction logic
  const quotePatterns = [
    // WordPress block pull quotes
    {
      regex: /<!-- wp:pullquote.*?-->(.*?)<!-- \/wp:pullquote -->/gs,
      extract: (content: string) => {
        const textMatch = content.match(
          /<(?:blockquote|p)[^>]*>(.*?)<\/(?:blockquote|p)>/s
        );
        const citeMatch = content.match(/<cite[^>]*>(.*?)<\/cite>/s);
        return textMatch
          ? {
              text: textMatch[1].replace(/<[^>]*>/g, "").trim(),
              citation: citeMatch
                ? citeMatch[1].replace(/<[^>]*>/g, "").trim()
                : undefined,
            }
          : null;
      },
    },
    // WordPress quote blocks
    {
      regex: /<!-- wp:quote.*?-->(.*?)<!-- \/wp:quote -->/gs,
      extract: (content: string) => {
        const textMatch = content.match(
          /<(?:blockquote|p)[^>]*>(.*?)<\/(?:blockquote|p)>/s
        );
        const citeMatch = content.match(/<cite[^>]*>(.*?)<\/cite>/s);
        return textMatch
          ? {
              text: textMatch[1].replace(/<[^>]*>/g, "").trim(),
              citation: citeMatch
                ? citeMatch[1].replace(/<[^>]*>/g, "").trim()
                : undefined,
            }
          : null;
      },
    },
    // CSS class-based pullquotes
    {
      regex: /<div[^>]*class="[^"]*pullquote[^"]*"[^>]*>(.*?)<\/div>/gs,
      extract: (content: string) => ({
        text: content
          .replace(/<[^>]*>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .trim(),
        citation: undefined,
      }),
    },
    // Standalone blockquotes (selective)
    {
      regex: /<blockquote(?:[^>]*)>(.*?)<\/blockquote>/gs,
      extract: (content: string) => {
        const textMatch = content.match(/<p[^>]*>(.*?)<\/p>/s) || [
          null,
          content,
        ];
        const citeMatch = content.match(/<cite[^>]*>(.*?)<\/cite>/s);
        if (textMatch && textMatch[1]) {
          const text = textMatch[1].replace(/<[^>]*>/g, "").trim();
          return text.length > 30
            ? {
                text,
                citation: citeMatch
                  ? citeMatch[1].replace(/<[^>]*>/g, "").trim()
                  : undefined,
              }
            : null;
        }
        return null;
      },
    },
  ];

  const extractFigureImage = (content: string) => {
    const imgMatch = content.match(/<img[^>]*>/);
    if (!imgMatch) return null;

    const img = imgMatch[0];
    const srcMatch = img.match(/src="([^"]+)"/);
    if (!srcMatch) return null;

    const altMatch = img.match(/alt="([^"]*)"/);
    const widthMatch = img.match(/width="(\d+)"/);
    const heightMatch = img.match(/height="(\d+)"/);
    const linkMatch = content.match(/<a[^>]*href="([^"]+)"[^>]*>/);
    const captionMatch = content.match(/<figcaption[^>]*>(.*?)<\/figcaption>/s);
    const link = linkMatch ? he.decode(linkMatch[1]) : undefined;

    return {
      src: resolveWordPressMediaUrl(he.decode(srcMatch[1])),
      alt: altMatch ? he.decode(altMatch[1]) : "",
      width: widthMatch ? parseInt(widthMatch[1]) : 800,
      height: heightMatch ? parseInt(heightMatch[1]) : 600,
      caption: captionMatch
        ? he.decode(captionMatch[1].replace(/<[^>]*>/g, "")).trim()
        : undefined,
      link: link && /wp-content\//i.test(link)
        ? resolveWordPressMediaUrl(link)
        : link,
    };
  };

  const imagePatterns = [
    {
      regex:
        /<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>(.*?)<\/figure>/gs,
      extract: extractFigureImage,
    },
    {
      regex:
        /<figure[^>]*>((?:(?!<\/figure>).)*<img[^>]*>(?:(?!<\/figure>).)*)<\/figure>/gs,
      extract: extractFigureImage,
    },
  ];

  // Find all quotes and their positions
  const foundQuotes: Array<{
    start: number;
    end: number;
    text: string;
    citation?: string;
    fullMatch: string;
  }> = [];

  quotePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.regex.exec(htmlContent)) !== null) {
      const extracted = pattern.extract(match[1]);

      if (extracted && extracted.text.length > 20) {
        // Check if this quote already exists (avoid duplicates)
        const isDuplicate = foundQuotes.some((q) => q.text === extracted.text);

        if (!isDuplicate) {
          foundQuotes.push({
            start: match.index!,
            end: match.index! + match[0].length,
            text: extracted.text,
            citation: extracted.citation,
            fullMatch: match[0],
          });
        }
      }
    }
    // Reset regex for next pattern
    pattern.regex.lastIndex = 0;
  });

  // Find all images and their positions
  const foundImages: Array<{
    start: number;
    end: number;
    imageData: {
      src: string;
      alt: string;
      width: number;
      height: number;
      caption?: string;
      credit?: string;
      link?: string;
    };
    fullMatch: string;
  }> = [];

  imagePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.regex.exec(htmlContent)) !== null) {
      const extracted = pattern.extract(match[1]);
      if (!extracted) continue;

      const start = match.index!;
      const end = start + match[0].length;
      // wp-block-image figures also match the generic <figure> pattern — keep one.
      const overlapsExisting = foundImages.some(
        (image) => !(end <= image.start || start >= image.end)
      );
      if (overlapsExisting) continue;

      foundImages.push({
        start,
        end,
        imageData: extracted,
        fullMatch: match[0],
      });
    }
    // Reset regex for next pattern
    pattern.regex.lastIndex = 0;
  });

  // Combine all found elements and sort by position
  const allElements = [
    ...foundQuotes.map((q) => ({ ...q, type: "pullquote" as const })),
    ...foundImages.map((i) => ({ ...i, type: "image" as const })),
  ].sort((a, b) => a.start - b.start);

  // If no special elements found, return entire content as text
  if (allElements.length === 0) {
    return [
      {
        type: "text",
        content: htmlContent,
        index: 0,
      },
    ];
  }

  // Build result array with text, pullquotes, and images in order
  const result: ContentBlock[] = [];
  let currentIndex = 0;
  let lastPosition = 0;

  allElements.forEach((element) => {
    // Add text content before this element (if any)
    if (element.start > lastPosition) {
      const textBefore = htmlContent.substring(lastPosition, element.start);
      if (textBefore.trim()) {
        result.push({
          type: "text",
          content: textBefore, // Keep HTML for links
          index: currentIndex++,
        });
      }
    }

    // Add the element (pullquote or image)
    if (element.type === "pullquote") {
      result.push({
        type: "pullquote",
        content: cleanPullQuote(element.text),
        index: currentIndex++,
        citation: element.citation,
      });
    } else if (element.type === "image") {
      result.push({
        type: "image",
        content: "", // Content not used for images
        index: currentIndex++,
        imageData: element.imageData,
      });
    }

    lastPosition = element.end;
  });

  // Add any remaining content after the last element
  if (lastPosition < htmlContent.length) {
    const remainingContent = htmlContent.substring(lastPosition);
    if (remainingContent.trim()) {
      result.push({
        type: "text",
        content: remainingContent, // Keep HTML for links
        index: currentIndex++,
      });
    }
  }

  return result;
}

// Helper function to strip HTML
function stripHtml(html: string): string {
  if (!html) return "";

  let cleaned = html;

  // First strip HTML tags (including self-closing ones)
  cleaned = cleaned.replace(/<[^>]*\/>?/g, "");

  // Decode HTML entities using he first (handles named & numeric)
  cleaned = he.decode(cleaned);

  // Handle common invisible/spacing controls and punctuation after decoding
  const replacements: Array<[RegExp, string]> = [
    [
      /\u00A0|\u2000|\u2001|\u2002|\u2003|\u2004|\u2005|\u2006|\u2007|\u2008|\u2009|\u200A/g,
      " ",
    ],
    [/\u200B|\u200C|\u200D|\u00AD/g, ""], // zero-width joiners & soft hyphen
    [/\u2026/g, "..."], // ellipsis
    [/\u2014/g, "—"], // em dash
    [/\u2013/g, "–"], // en dash
  ];
  replacements.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  // Remove leading/trailing typographic quotes (curly and straight)
  cleaned = cleaned
    .replace(/^[\s\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A"']+/, "")
    .replace(/[\s\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A"']+$/, "");

  // Clean up WordPress-specific artifacts
  cleaned = cleaned
    // Remove WordPress shortcodes [shortcode] or [shortcode attr="value"]
    .replace(/\[[^\]]+\]/g, "")
    // Remove WordPress block comments <!-- wp:... -->
    .replace(/<!--\s*wp:.*?-->/g, "")
    // Remove other HTML comments
    .replace(/<!--.*?-->/g, "")
    // Clean up multiple whitespace characters
    .replace(/\s+/g, " ")
    // Remove leading/trailing whitespace
    .trim();

  return cleaned;
}



const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  relatedPosts = [],
  issue = null,
  specialFeature = false,
}) => {
  const pathname = usePathname();
  const backLink = getArticleBackLink(pathname);
  const [pullQuotePositions, setPullQuotePositions] = useState<
    PullQuotePosition[]
  >([]);
  const [fetchedRelatedPosts, setFetchedRelatedPosts] = useState<
    EnhancedPost[]
  >([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const contentElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);

  const scrollToTop = () => {
    const top = articleRef.current?.offsetTop ?? 0;
    window.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
  };

  const titleText =
    typeof post.title === "object" ? post.title.rendered : post.title;
  const rawContent =
    typeof post.content === "object" ? post.content.rendered : post.content;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, post.id]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const title = titleRef.current;
    if (!header || !title) return;

    let frame = 0;
    let disposed = false;
    let lastKey = "";
    const minTitlePx = 20;

    const resolveMaxHeight = () => {
      const raw = getComputedStyle(header)
        .getPropertyValue("--article-header-max-height")
        .trim();
      if (!raw) {
        return window.innerHeight - 92;
      }
      const probe = document.createElement("div");
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${raw}`;
      document.body.appendChild(probe);
      const height = probe.getBoundingClientRect().height;
      probe.remove();
      return height > 0 ? height : window.innerHeight - 92;
    };

    const fit = () => {
      frame = 0;
      if (disposed || !header.isConnected || !title.isConnected) return;

      const maxHeight = resolveMaxHeight();
      const width = Math.round(header.getBoundingClientRect().width);
      const key = `${width}:${Math.round(maxHeight)}`;
      if (key === lastKey) return;

      title.style.removeProperty("--article-title-fit-size");
      if (maxHeight <= 0 || header.scrollHeight <= maxHeight + 1) {
        lastKey = key;
        return;
      }

      const startSize = parseFloat(getComputedStyle(title).fontSize);
      if (!Number.isFinite(startSize) || startSize <= minTitlePx) {
        lastKey = key;
        return;
      }

      let low = minTitlePx;
      let high = startSize;
      for (let i = 0; i < 18; i += 1) {
        const mid = (low + high) / 2;
        title.style.setProperty("--article-title-fit-size", `${mid}px`);
        if (header.scrollHeight <= maxHeight + 1) {
          low = mid;
        } else {
          high = mid;
        }
      }
      title.style.setProperty("--article-title-fit-size", `${low}px`);
      lastKey = key;
    };

    const schedule = (force = false) => {
      if (force) lastKey = "";
      if (!disposed && !frame) frame = requestAnimationFrame(fit);
    };
    const scheduleForced = () => schedule(true);

    const observer = new ResizeObserver(() => schedule());
    observer.observe(header);
    window.addEventListener("resize", scheduleForced);
    document.fonts?.addEventListener("loadingdone", scheduleForced);
    document.fonts?.ready.then(scheduleForced);
    fit();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleForced);
      document.fonts?.removeEventListener("loadingdone", scheduleForced);
      title.style.removeProperty("--article-title-fit-size");
    };
  }, [titleText, post.id]);

  // Fetch related posts if not provided
  useEffect(() => {
    if (
      relatedPosts.length === 0 &&
      post.categories &&
      post.categories.length > 0
    ) {
      const categoryId = post.categories[0];
      fetch(
        `/api/related-posts?categoryId=${categoryId}&excludePostId=${post.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.posts) {
            setFetchedRelatedPosts(data.posts);
          }
        })
        .catch((err) => console.error("Failed to fetch related posts:", err));
    }
  }, [post.id, post.categories, relatedPosts.length]);

  const videoEmbed = useMemo(() => getArticleVideoEmbed(post), [post]);

  // Memoize contentBlocks to prevent infinite loop in useEffect
  const contentBlocks = useMemo(() => {
    const hydrated = hydrateLazyEmbeds(rawContent);
    const html = videoEmbed
      ? stripArticleVideoEmbed(hydrated, videoEmbed)
      : hydrated;
    return extractContentBlocks(withExternalLinkTargets(html));
  }, [rawContent, videoEmbed]);

  const featuredImage = post.featured_media_obj;
  const featuredImageUrl = featuredImage?.source_url
    ? resolveWordPressMediaUrl(featuredImage.source_url)
    : "";
  const hasImage = !videoEmbed && !!featuredImageUrl;
  const hasMedia = hasImage || !!videoEmbed;
  const imageAlt = featuredImage?.alt_text || titleText;
  const authorName = getAuthorName(post);
  const formattedDate = formatArchiveDate(post.date || "");

  useEffect(() => {
    if (!lightboxOpen) return;
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    lightboxCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  // Align pull quotes with their markers, and grow the sidebar so late quotes
  // cannot spill into Related Articles.
  useEffect(() => {
    const body = bodyRef.current;
    const sidebar = sidebarRef.current;
    if (!body || !sidebar) return;

    let frame = 0;
    const quotesRoot = sidebar.querySelector<HTMLElement>(".sidebar-pull-quotes");

    const measure = () => {
      frame = 0;
      if (lightboxOpen) return;
      if (window.matchMedia("(max-width: 1024px)").matches) {
        sidebar.style.removeProperty("--article-sidebar-min-height");
        setPullQuotePositions((previous) => (previous.length ? [] : previous));
        return;
      }
      if (!quotesRoot) {
        sidebar.style.removeProperty("--article-sidebar-min-height");
        return;
      }

      const rootTop = quotesRoot.getBoundingClientRect().top;
      const positions: PullQuotePosition[] = [];

      contentElementRefs.current.forEach((element, index) => {
        if (!element || contentBlocks[index]?.type !== "pullquote") return;
        const marker =
          element.querySelector<HTMLElement>(".content-pullquote-marker") || element;
        positions.push({
          index: contentBlocks[index].index,
          topOffset: Math.max(0, marker.getBoundingClientRect().top - rootTop),
        });
      });

      setPullQuotePositions((previous) => {
        if (
          previous.length === positions.length
          && previous.every((entry, index) => (
            entry.index === positions[index].index
            && Math.abs(entry.topOffset - positions[index].topOffset) < 0.5
          ))
        ) {
          return previous;
        }
        return positions;
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    document.fonts?.ready.then(schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      sidebar.style.removeProperty("--article-sidebar-min-height");
    };
  }, [contentBlocks, lightboxOpen]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const quotesRoot = sidebar?.querySelector<HTMLElement>(".sidebar-pull-quotes");
    if (!sidebar || !quotesRoot) return;

    const frame = requestAnimationFrame(() => {
      const quoteBottom = Array.from(
        quotesRoot.querySelectorAll<HTMLElement>(".positioned-quote")
      ).reduce((max, quote) => Math.max(max, quote.offsetTop + quote.offsetHeight), 0);

      const minHeight = Math.ceil(quotesRoot.offsetTop + quoteBottom);
      if (minHeight > 0) {
        sidebar.style.setProperty("--article-sidebar-min-height", `${minHeight}px`);
      } else {
        sidebar.style.removeProperty("--article-sidebar-min-height");
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [pullQuotePositions, contentBlocks]);

  const setContentElementRef = useCallback((index: number, el: HTMLDivElement | null) => {
    contentElementRefs.current[index] = el;
  }, []);

  const postsToShow =
    relatedPosts.length > 0 ? relatedPosts : fetchedRelatedPosts;
  const pullQuotes = contentBlocks.filter((block) => block.type === "pullquote");

  const lightbox = lightboxOpen && hasImage && typeof document !== "undefined"
    ? createPortal(
        <div
          className="article-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={imageAlt}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            ref={lightboxCloseRef}
            type="button"
            className="article-lightbox-close"
            aria-label="Close image"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <div
            className="article-lightbox-figure"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={featuredImageUrl}
              alt={imageAlt}
              width={featuredImage?.media_details?.width || 1600}
              height={featuredImage?.media_details?.height || 900}
              className="article-lightbox-image"
              sizes="100vw"
              priority
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <article className="article-view" ref={articleRef}>
      <header
        ref={headerRef}
        className={`article-header${hasMedia ? " article-header--with-image" : ""}`}
      >
        <div className="article-header-copy">
          <nav className="article-back-nav" aria-label="Article navigation">
            <Link
              href={backLink.href}
              className="article-back-link"
              onClick={(event) => {
                if (
                  event.defaultPrevented ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                event.preventDefault();
                goArticleBack(backLink.href);
              }}
            >
              <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
              {backLink.label}
            </Link>
          </nav>
          <div className="article-header-copy-body">
          <div className="article-header-lead">
            {issue || specialFeature ? (
              issue ? (
                <Link
                  href={`/magazine/issues/${encodeURIComponent(issue.slug)}`}
                  className="article-issue-kicker"
                >
                  {issue.heading}
                  {specialFeature ? (
                    <span className="article-special-feature"> (Special Feature)</span>
                  ) : null}
                </Link>
              ) : (
                <p className="article-issue-kicker">
                  <span className="article-special-feature">(Special Feature)</span>
                </p>
              )
            ) : null}
            <h1 ref={titleRef} className="article-title-view">
              <ArticleTitle html={titleText} />
            </h1>
          </div>
          <div className="author-info">
            <div className="author-byline">
              <span className="author-byline-author">{authorName.toUpperCase()}</span>
              {formattedDate ? (
                <>
                  <span className="author-byline-divider" aria-hidden="true">·</span>
                  <time className="author-byline-date" dateTime={post.date}>
                    {formattedDate}
                  </time>
                </>
              ) : null}
            </div>
            <CategoryPills categories={post.categories_obj} clickable />
          </div>
          </div>
        </div>
        {videoEmbed ? (
          <div className="article-featured-image article-featured-video">
            {videoEmbed.provider === "file" ? (
              <video
                className="featured-video"
                src={videoEmbed.src}
                poster={videoEmbed.poster}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <iframe
                className="featured-video"
                src={videoEmbed.src}
                title={`${titleText} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        ) : hasImage ? (
          <div className="article-featured-image">
            <Image
              src={featuredImageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 62vw"
              priority
              className="featured-image"
            />
            <button
              type="button"
              className="article-image-expand"
              aria-label="View full image"
              onClick={() => setLightboxOpen(true)}
            >
              <Expand size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </header>

      <div className="article-body" ref={bodyRef}>
        <aside className="article-sidebar" ref={sidebarRef}>
          <div className="sidebar-pull-quotes">
            {pullQuotes.map((block) => {
              const position = pullQuotePositions.find(
                (pos) => pos.index === block.index
              );

              return (
                <div
                  key={block.index}
                  className="pull-quote-container positioned-quote"
                  style={{
                    position: "absolute",
                    top: position ? `${position.topOffset}px` : "auto",
                    left: 0,
                    right: 0,
                  }}
                >
                  <div className="pull-quote-divider"></div>
                  <blockquote className="sidebar-pull-quote">
                    {block.content}
                  </blockquote>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="article-main-content">
          <div className="article-content">
            <StableArticleContent
              contentBlocks={contentBlocks}
              setContentElementRef={setContentElementRef}
            />
          </div>
        </div>
      </div>

      <div className="article-back-to-top">
        <button
          type="button"
          className="article-back-to-top-button"
          onClick={scrollToTop}
        >
          <span>Back to Top</span>
          <ArrowUp size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {postsToShow.length > 0 && (
        <div className="article-related">
          <FourArticleGrid
            posts={postsToShow}
            categoryName="Related Articles"
          />
        </div>
      )}

      {lightbox}
    </article>
  );
};

const StableArticleContent = memo(function StableArticleContent({
  contentBlocks,
  setContentElementRef,
}: {
  contentBlocks: ContentBlock[];
  setContentElementRef: (index: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <>
      {contentBlocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <div
              key={block.index}
              ref={(el) => setContentElementRef(index, el)}
              dangerouslySetInnerHTML={{ __html: block.content }}
              style={{ pointerEvents: "auto" }}
            />
          );
        }
        if (block.type === "pullquote") {
          return (
            <div
              key={block.index}
              ref={(el) => setContentElementRef(index, el)}
              className="content-pullquote-slot"
              data-quote-index={block.index}
            >
              <div className="content-pullquote-marker" aria-hidden="true" />
              <div className="pull-quote-container content-pullquote">
                <div className="pull-quote-divider" />
                <blockquote className="sidebar-pull-quote">
                  {block.content}
                </blockquote>
              </div>
            </div>
          );
        }
        if (block.type === "image" && block.imageData) {
          const { imageData } = block;
          const imageElement = (
            <Image
              src={imageData.src}
              alt={imageData.alt}
              width={imageData.width}
              height={imageData.height}
              className="content-image"
            />
          );
          return (
            <div
              key={block.index}
              ref={(el) => setContentElementRef(index, el)}
              className="article-content-image"
            >
              {imageData.link ? (
                <a
                  href={imageData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {imageElement}
                </a>
              ) : (
                imageElement
              )}
              {imageData.caption ? (
                <div className="image-caption">{imageData.caption}</div>
              ) : null}
            </div>
          );
        }
        return null;
      })}
    </>
  );
});

export default ArticleView;
