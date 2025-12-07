"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { EnhancedPost } from "../../lib/types";
import he from "he";
// import { DOMParser } from "htmlparser2";
import "./ArticleView.css";
import FourArticleGrid from "../FourArticleGrid";

interface ArticleViewProps {
  post: EnhancedPost;
  relatedPosts?: EnhancedPost[];
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
    credit?: string;
    link?: string;
  };
}

interface PullQuotePosition {
  index: number;
  topOffset: number;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  // Define image patterns
  const imagePatterns = [
    // WordPress block images
    {
      regex:
        /<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>(.*?)<\/figure>/gs,
      extract: (content: string) => {
        const imgMatch = content.match(/<img[^>]*>/);
        if (!imgMatch) return null;

        const img = imgMatch[0];
        const srcMatch = img.match(/src="([^"]+)"/);
        const altMatch = img.match(/alt="([^"]*)"/);
        const widthMatch = img.match(/width="(\d+)"/);
        const heightMatch = img.match(/height="(\d+)"/);

        // Check for link wrapper
        const linkMatch = content.match(/<a[^>]*href="([^"]+)"[^>]*>/);

        // Check for caption (figcaption)
        const captionMatch = content.match(
          /<figcaption[^>]*>(.*?)<\/figcaption>/s
        );

        if (srcMatch) {
          return {
            src: he.decode(srcMatch[1]),
            alt: altMatch ? he.decode(altMatch[1]) : "",
            width: widthMatch ? parseInt(widthMatch[1]) : 800,
            height: heightMatch ? parseInt(heightMatch[1]) : 600,
            caption: captionMatch
              ? captionMatch[1].replace(/<[^>]*>/g, "").trim()
              : undefined,
            link: linkMatch ? he.decode(linkMatch[1]) : undefined,
          };
        }
        return null;
      },
    },
    // Regular img tags with figure wrapper
    {
      regex:
        /<figure[^>]*>((?:(?!<\/figure>).)*<img[^>]*>(?:(?!<\/figure>).)*)<\/figure>/gs,
      extract: (content: string) => {
        const imgMatch = content.match(/<img[^>]*>/);
        if (!imgMatch) return null;

        const img = imgMatch[0];
        const srcMatch = img.match(/src="([^"]+)"/);
        const altMatch = img.match(/alt="([^"]*)"/);
        const widthMatch = img.match(/width="(\d+)"/);
        const heightMatch = img.match(/height="(\d+)"/);

        const linkMatch = content.match(/<a[^>]*href="([^"]+)"[^>]*>/);
        const captionMatch = content.match(
          /<figcaption[^>]*>(.*?)<\/figcaption>/s
        );

        if (srcMatch) {
          return {
            src: he.decode(srcMatch[1]),
            alt: altMatch ? he.decode(altMatch[1]) : "",
            width: widthMatch ? parseInt(widthMatch[1]) : 800,
            height: heightMatch ? parseInt(heightMatch[1]) : 600,
            caption: captionMatch
              ? captionMatch[1].replace(/<[^>]*>/g, "").trim()
              : undefined,
            link: linkMatch ? he.decode(linkMatch[1]) : undefined,
          };
        }
        return null;
      },
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

      if (extracted) {
        foundImages.push({
          start: match.index!,
          end: match.index! + match[0].length,
          imageData: extracted,
          fullMatch: match[0],
        });
      }
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

// Helper function to extract illustrator from content
function extractIllustrator(content: string): string | null {
  const illustratorRegex = /illustration\s+by\s+([^<\n]+)/i;
  const match = content.match(illustratorRegex);
  return match ? match[1].trim() : null;
}

const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  relatedPosts = [],
}) => {
  const [pullQuotePositions, setPullQuotePositions] = useState<
    PullQuotePosition[]
  >([]);
  const [fetchedRelatedPosts, setFetchedRelatedPosts] = useState<
    EnhancedPost[]
  >([]);
  const contentElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const titleText =
    typeof post.title === "object" ? post.title.rendered : post.title;
  const excerptText =
    typeof post.excerpt === "object" ? post.excerpt.rendered : post.excerpt;
  const rawContent =
    typeof post.content === "object" ? post.content.rendered : post.content;

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

  // Memoize contentBlocks to prevent infinite loop in useEffect
  const contentBlocks = useMemo(
    () => extractContentBlocks(rawContent),
    [rawContent]
  );

  // Debug: print pull quotes and leading character codes
  useEffect(() => {
    const pullQuotes = contentBlocks.filter((b) => b.type === "pullquote");
    if (pullQuotes.length) {
      console.groupCollapsed(
        `[ArticleView] Pull quotes (${pullQuotes.length}) — ${
          post.id || titleText || "untitled"
        }`
      );
      pullQuotes.forEach((q, idx) => {
        const s = q.content as string;
        const head = s.slice(0, 6);
        const codes = head.split("").map((c) => c.charCodeAt(0));
        console.log(`#${idx + 1}`, { text: s, head, codes });
      });
      console.groupEnd();
    }
  }, [contentBlocks, titleText, post]);

  // Get featured image details
  const featuredImage = post.featured_media_obj;
  const hasImage = !!(featuredImage && featuredImage.source_url);
  // const imageCaption = featuredImage?.caption?.rendered || ""; // unused
  const imageAlt = featuredImage?.alt_text || titleText;

  // Get author information
  const authorName =
    post.author_name || post.author_obj?.name || "Unknown Author";

  // Extract illustrator from content
  const illustrator = extractIllustrator(rawContent) || null;

  // Calculate pull quote positions after component mounts and on resize
  useEffect(() => {
    const calculatePositions = () => {
      if (!bodyRef.current) return;

      const bodyTop = bodyRef.current.offsetTop;
      const positions: PullQuotePosition[] = [];

      contentElementRefs.current.forEach((element, index) => {
        if (element && contentBlocks[index]?.type === "pullquote") {
          const elementTop = element.offsetTop;
          const relativeTop = elementTop - bodyTop;

          positions.push({
            index: contentBlocks[index].index,
            topOffset: relativeTop,
          });
        }
      });

      setPullQuotePositions(positions);
    };

    // Calculate positions on mount and window resize
    calculatePositions();
    window.addEventListener("resize", calculatePositions);

    return () => {
      window.removeEventListener("resize", calculatePositions);
    };
  }, [contentBlocks]);

  // Render content blocks with proper spacing for pull quotes and images
  const renderContentBlocks = () => {
    return contentBlocks.map((block, index) => {
      if (block.type === "text") {
        return (
          <div
            key={block.index}
            ref={(el) => {
              contentElementRefs.current[index] = el;
            }}
            dangerouslySetInnerHTML={{ __html: block.content }}
            style={{ pointerEvents: "auto" }}
          />
        );
      } else if (block.type === "pullquote") {
        return (
          <div
            key={block.index}
            ref={(el) => {
              contentElementRefs.current[index] = el;
            }}
            className="content-pullquote-marker"
            data-quote-index={block.index}
            style={{
              height: "1px",
              visibility: "hidden",
              margin: "24px 0", // Add some spacing where the pullquote would be
            }}
          />
        );
      } else if (block.type === "image" && block.imageData) {
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
            ref={(el) => {
              contentElementRefs.current[index] = el;
            }}
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
            {imageData.caption && (
              <div className="image-caption">{imageData.caption}</div>
            )}
            {imageData.credit && (
              <div className="image-credit">{imageData.credit}</div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  console.log("Related posts:", relatedPosts);

  const postsToShow =
    relatedPosts.length > 0 ? relatedPosts : fetchedRelatedPosts;

  return (
    <article className="article-view">
      {/* Top border line */}
      <div className="article-top-border"></div>

      {/* Header with title and excerpt side by side */}
      <header className="article-header">
        <div className="header-content">
          <h1
            className="article-title-view"
            dangerouslySetInnerHTML={{ __html: titleText }}
          ></h1>
          <div
            className="article-excerpt-view"
            dangerouslySetInnerHTML={{ __html: excerptText }}
          />
        </div>
      </header>

      {/* Large featured image */}
      {hasImage && (
        <div className="article-featured-image">
          <Image
            src={featuredImage.source_url}
            alt={imageAlt}
            width={featuredImage.media_details?.width || 1310}
            height={featuredImage.media_details?.height || 712}
            priority
            className="featured-image"
          />
        </div>
      )}

      {/* Two column layout */}
      <div className="article-body" ref={bodyRef}>
        {/* Left sidebar - author info and positioned pull quotes */}
        <aside className="article-sidebar" ref={sidebarRef}>
          <div className="author-info">
            <div className="author-byline">BY {authorName.toUpperCase()}</div>
            {illustrator && (
              <div className="illustrator-info">
                ILLUSTRATION BY {illustrator.toUpperCase()}
              </div>
            )}
            <div className="article-date">
              {formatDate(post.date).toUpperCase()}
            </div>
          </div>

          <div className="sidebar-pull-quotes">
            {contentBlocks
              .filter((block) => block.type === "pullquote")
              .map((block) => {
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

        {/* Right main content */}
        <div className="article-main-content">
          <div className="article-content">{renderContentBlocks()}</div>
        </div>
      </div>

      {postsToShow.length > 0 && (
        <div className="article-related">
          <FourArticleGrid
            posts={postsToShow}
            categoryName="Related Articles"
          />
        </div>
      )}
    </article>
  );
};

export default ArticleView;
