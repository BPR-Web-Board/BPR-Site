"use client";

import React, { useEffect, useState } from "react";
import { Post, Author, FeaturedMedia, Category } from "@/app/lib/types";
import {
  getAuthorById,
  getFeaturedMediaById,
  getCategoryById,
} from "@/app/lib/wordpress";
import { getAuthorBySlug } from "@/app/lib/wordpress"; // For co-authors
import {
  PullQuote,
  EmbeddedImage,
  ParsedArticleContent,
} from "@/app/types/article";
import {
  ImageWithCaption,
  PullQuote as PullQuoteComponent,
  ArticleMeta,
  ArticleContent,
} from "@/app/components/ArticleRenderer/ArticleComponents";
import {
  parseWordPressContent,
  sanitizeWordPressContent,
} from "@/app/utils/contentParser";
import "./ArticleRenderer.css";

interface ArticleRendererProps {
  post: Post;
  className?: string;
}

const ArticleRenderer: React.FC<ArticleRendererProps> = ({
  post,
  className = "",
}) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [coAuthors, setCoAuthors] = useState<Author[]>([]);
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [parsedContent, setParsedContent] = useState<ParsedArticleContent>({
    content: "",
    pullQuotes: [],
    embeddedImages: [],
  });
  const [illustrator, setIllustrator] = useState<string | null>(null);
  const [isContentParsed, setIsContentParsed] = useState<boolean>(false);

  const safeLog = (label: string, obj: any) => {
    try {
      // Create a simplified version to prevent circular reference issues
      const simplify = (obj: any, depth = 0): any => {
        if (depth > 2) return "[Object]"; // Limit nesting depth
        if (!obj || typeof obj !== "object") return obj;

        const result: any = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Skip functions and complex objects at deep levels
            if (typeof obj[key] === "function") {
              result[key] = "[Function]";
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
              result[key] = simplify(obj[key], depth + 1);
            } else {
              result[key] = obj[key];
            }
          }
        }

        return result;
      };

      console.log(`[DEBUG] ${label}:`, simplify(obj));
    } catch (error) {
      console.error("Error in safeLog:", error);
    }
  };

  // Add this to your component to debug the post structure
  useEffect(() => {
    safeLog("Post Structure", {
      id: post.id,
      meta: post.meta,
      coauthors: post.coauthors,
      class_list: post.class_list,
      tags: post.tags,
    });
  }, [post]);

  // Extract illustrator from meta if available
  useEffect(() => {
    // Safely handle different meta data structures
    const getIllustratorFromMeta = () => {
      // Check if meta exists and is an array
      if (post.meta && Array.isArray(post.meta)) {
        const illustratorMeta = post.meta.find(
          (meta) => meta.key === "illustrator" || meta.key === "_illustrator"
        );
        if (illustratorMeta) {
          return illustratorMeta.value;
        }
      }
      // Check if meta is an object with direct properties
      else if (post.meta && typeof post.meta === "object") {
        // Try common illustrator field names
        return (
          post.meta.illustrator ||
          post.meta._illustrator ||
          post.meta.illustrator_name
        );
      }

      // If no illustrator found in meta, try to extract from featured image caption
      if (featuredMedia?.caption?.rendered) {
        // Try to extract illustrator from featured image caption
        const caption = featuredMedia.caption.rendered;
        const match = caption.match(/illustration\s+by\s+([^<.]+)/i);
        if (match) {
          return match[1].trim();
        }
      }

      return null;
    };

    setIllustrator(getIllustratorFromMeta());
  }, [post.meta, featuredMedia]);

  // Fetch author data
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorData = await getAuthorById(post.author);
        setAuthor(authorData);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    if (post.author) {
      fetchAuthor();
    }
  }, [post.author]);

  // Fetch co-authors if present
  useEffect(() => {
    const fetchCoAuthors = async () => {
      try {
        // Handle array of co-author IDs
        if (
          post.coauthors &&
          Array.isArray(post.coauthors) &&
          post.coauthors.length > 0
        ) {
          const coAuthorPromises = post.coauthors.map((id: number) =>
            getAuthorById(id)
          );
          const fetchedCoAuthors = await Promise.all(coAuthorPromises);
          setCoAuthors(fetchedCoAuthors.filter(Boolean));
        }
        // Handle single co-author ID
        else if (post.coauthors && typeof post.coauthors === "number") {
          try {
            const coAuthor = await getAuthorById(post.coauthors);
            if (coAuthor) {
              setCoAuthors([coAuthor]);
            }
          } catch (err) {
            console.error("Error fetching single co-author:", err);
          }
        }
        // Check if we have co-author info in the class_list
        else if (post.class_list) {
          if (Array.isArray(post.class_list)) {
            const coAuthorClasses: string[] = post.class_list.filter(
              (cls: string) =>
                typeof cls === "string" && cls.startsWith("coauthor-")
            );
            if (coAuthorClasses.length > 0) {
              console.log(
                "Found co-author classes in class_list:",
                coAuthorClasses
              );
              // Process co-author classes if needed
            }
          } else if (typeof post.class_list === "string") {
            const classes: string[] = post.class_list.split(" ");
            const coAuthorClasses: string[] = classes.filter((cls: string) =>
              cls.startsWith("coauthor-")
            );
            if (coAuthorClasses.length > 0) {
              console.log(
                "Found co-author classes in class_list string:",
                coAuthorClasses
              );
              // Process co-author classes if needed
            }
          }
        }
      } catch (error) {
        console.error("Error fetching co-authors:", error);
      }
    };

    fetchCoAuthors();
  }, [post.coauthors, post.class_list]);

  // Fetch featured media
  useEffect(() => {
    const fetchFeaturedMedia = async () => {
      try {
        const mediaData = await getFeaturedMediaById(post.featured_media);
        setFeaturedMedia(mediaData);
      } catch (error) {
        console.error("Error fetching featured media:", error);
      }
    };

    if (post.featured_media) {
      fetchFeaturedMedia();
    }
  }, [post.featured_media]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryPromises = post.categories.map((id) =>
          getCategoryById(id)
        );
        const fetchedCategories = await Promise.all(categoryPromises);
        setCategories(fetchedCategories.filter(Boolean));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (post.categories?.length > 0) {
      fetchCategories();
    }
  }, [post.categories]);

  // Extract tags from class list or tags array
  useEffect(() => {
    const extractTags = () => {
      try {
        const extractedTags: string[] = [];

        // If there's a tags array, use that (optional processing)
        if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
          // Process tag IDs if needed
        }

        // Extract tags from class list (common in WordPress)
        if (post.class_list) {
          // Handle array type class_list
          if (Array.isArray(post.class_list)) {
            const tagClasses: string[] = post.class_list.filter(
              (cls: string) => typeof cls === "string" && cls.startsWith("tag-")
            );

            const tagsFromClasses: string[] = tagClasses.map((cls: string) => {
              return cls
                .replace("tag-", "")
                .split("-")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ");
            });

            extractedTags.push(...tagsFromClasses);
          }
          // Handle string type class_list (space-separated)
          else if (typeof post.class_list === "string") {
            const classes: string[] = post.class_list.split(" ");
            const tagClasses: string[] = classes.filter((cls: string) =>
              cls.startsWith("tag-")
            );

            const tagsFromClasses: string[] = tagClasses.map((cls: string) => {
              return cls
                .replace("tag-", "")
                .split("-")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ");
            });

            extractedTags.push(...tagsFromClasses);
          }
        }

        setTags(extractedTags);
      } catch (error) {
        console.error("Error processing tags:", error);
        setTags([]);
      }
    };

    extractTags();
  }, [post.tags, post.class_list]);

  // Parse content to extract pull quotes and format the main content
  useEffect(() => {
    if (!post.content?.rendered || isContentParsed) return;

    try {
      const sanitizedContent = sanitizeWordPressContent(post.content.rendered);
      const parsed = parseWordPressContent(sanitizedContent);
      setParsedContent(parsed);
      setIsContentParsed(true);
    } catch (error) {
      console.error("Error parsing content:", error);
      // Fallback to original content
      setParsedContent({
        content: post.content.rendered,
        pullQuotes: [],
        embeddedImages: [],
      });
      setIsContentParsed(true);
    }
  }, [post.content, isContentParsed]);

  // Determine if we should display the excerpt
  const shouldShowExcerpt =
    !!post.excerpt?.rendered && post.excerpt.rendered.length > 10;
  const isTitleLong = post.title.rendered.length > 70;
  const useFullWidthTitleLayout = isTitleLong || !shouldShowExcerpt;

  // Get formatted category names
  const categoryNames = categories.map((cat) => cat.name);

  // Prepare co-author data for display
  const coAuthorData = coAuthors.map((author) => ({
    name: author.name,
    slug: author.slug,
  }));

  return (
    <article className={`article-container ${className}`}>
      <div
        className={`article-header ${
          useFullWidthTitleLayout ? "full-width-title" : ""
        }`}
      >
        <div className="article-title-container">
          <h1
            className={`article-title ${
              !shouldShowExcerpt ? "large-title" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </div>

        {shouldShowExcerpt && (
          <div className="article-excerpt-container">
            <div
              className="article-excerpt"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          </div>
        )}
      </div>

      {featuredMedia && (
        <ImageWithCaption
          src={featuredMedia.source_url}
          alt={featuredMedia.alt_text || post.title.rendered}
          width={featuredMedia.media_details.width}
          height={featuredMedia.media_details.height}
          caption={featuredMedia.caption?.rendered}
          credit={illustrator || undefined}
          priority
          className="featured-image-container"
        />
      )}

      <div className="article-content-wrapper">
        <aside className="article-sidebar">
          {author && (
            <ArticleMeta
              author={{
                name: author.name,
                slug: author.slug,
              }}
              coAuthors={coAuthorData}
              date={post.date}
              illustrator={illustrator || undefined}
              categories={categoryNames}
              tags={tags}
              className="sidebar-meta"
            />
          )}
          {parsedContent.pullQuotes.length > 0 && (
            <div className="pull-quotes-container">
              {parsedContent.pullQuotes.map((quote, index) => (
                <PullQuoteComponent
                  key={index}
                  content={quote.content}
                  citation={quote.citation}
                  alignment={quote.alignment}
                  className={`sidebar-quote-${index}`}
                />
              ))}
            </div>
          )}
        </aside>

        <div className="article-main-content">
          <ArticleContent
            content={parsedContent.content}
            className="main-article-content"
          />
        </div>
      </div>
    </article>
  );
};

export default ArticleRenderer;
