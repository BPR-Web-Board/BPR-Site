"use client";

import { PullQuote, EmbeddedImage } from "@/app/types/article";

/**
 * Parses WordPress content to extract pull quotes and format content
 *
 * @param contentHtml The HTML content from WordPress
 * @returns An object containing the parsed content and extracted elements
 */
export function parseWordPressContent(contentHtml: string) {
  // Create temporary DOM element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = contentHtml;

  // Extract pull quotes
  const pullQuotes: PullQuote[] = extractPullQuotes(tempDiv);

  // Process images and enhance with proper structure
  const embeddedImages: EmbeddedImage[] = processEmbeddedImages(tempDiv);

  // Format remaining content
  const formattedContent = tempDiv.innerHTML;

  return {
    content: formattedContent,
    pullQuotes,
    embeddedImages,
  };
}

/**
 * Extracts pull quotes from content
 */
function extractPullQuotes(contentElement: HTMLElement): PullQuote[] {
  const pullQuotes: PullQuote[] = [];

  // Look for various pull quote formats in WordPress content
  // Format 1: blockquote.pull-quote
  const pullQuoteElements = contentElement.querySelectorAll(
    "blockquote.pull-quote, blockquote.wp-block-quote"
  );

  pullQuoteElements.forEach((quoteEl) => {
    const quoteContent =
      quoteEl.querySelector("p")?.innerHTML || quoteEl.innerHTML;
    const citation = quoteEl.querySelector("cite")?.textContent || undefined;
    const alignment = quoteEl.classList.contains("right")
      ? "right"
      : quoteEl.classList.contains("left")
      ? "left"
      : "center";

    pullQuotes.push({
      content: quoteContent,
      citation,
      alignment,
    });

    // Remove the pull quote from main content
    quoteEl.remove();
  });

  // Format 2: div with pullquote class (BPR specific format)
  const divQuotes = contentElement.querySelectorAll(
    "div.bpr-pullquote, div.pullquote"
  );

  divQuotes.forEach((quoteEl) => {
    // Preserve the HTML structure including emphasis tags
    let quoteContent = quoteEl.innerHTML;

    // Remove role and aria attributes from the content for cleaner display
    quoteContent = quoteContent.replace(
      /role="presentation"|aria-hidden="true"/g,
      ""
    );

    // Make sure emphasis and line breaks are preserved correctly
    // Replace escaped quotes with proper quotes
    quoteContent = quoteContent.replace(/\\"/g, '"').replace(/&quot;/g, '"');

    // Capture citation if it exists
    let citation;
    // For BPR style, look for text after the last closing quote
    const lastQuoteIndex = quoteContent.lastIndexOf('"');
    if (lastQuoteIndex !== -1 && lastQuoteIndex < quoteContent.length - 1) {
      citation = quoteContent.substring(lastQuoteIndex + 1).trim();
      // Keep only the quoted content
      quoteContent = quoteContent.substring(0, lastQuoteIndex + 1);
    }

    // Determine alignment
    const alignment = quoteEl.classList.contains("right")
      ? "right"
      : quoteEl.classList.contains("left")
      ? "left"
      : "center";

    pullQuotes.push({
      content: quoteContent,
      citation,
      alignment,
    });

    // Remove from main content
    quoteEl.remove();
  });

  return pullQuotes;
}

/**
 * Processes embedded images to ensure proper rendering
 */
function processEmbeddedImages(contentElement: HTMLElement): EmbeddedImage[] {
  const embeddedImages: EmbeddedImage[] = [];

  // Process WordPress image blocks
  const imageBlocks = contentElement.querySelectorAll(
    "figure.wp-block-image, .wp-caption, .image-container"
  );

  imageBlocks.forEach((figure, index) => {
    const img = figure.querySelector("img");

    if (img) {
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || "";
      const caption =
        figure.querySelector("figcaption, .wp-caption-text")?.innerHTML || "";
      const width = parseInt(img.getAttribute("width") || "0", 10) || undefined;
      const height =
        parseInt(img.getAttribute("height") || "0", 10) || undefined;

      // Extract illustrator/photographer credit if available
      let credit = "";
      const creditEl = figure.querySelector(".image-credit, .credit");
      if (creditEl) {
        credit = creditEl.textContent || "";
      } else {
        // Look for credit in caption with specific format
        const captionText =
          figure.querySelector("figcaption, .wp-caption-text")?.textContent ||
          "";
        const creditMatch = captionText.match(
          /\b(?:Photo|Illustration)\s+by\s+([^\.]+)/i
        );
        if (creditMatch) {
          credit = creditMatch[1].trim();
        }
      }

      embeddedImages.push({
        id: `embedded-image-${index}`,
        src,
        alt,
        caption,
        credit,
        width,
        height,
      });

      // Add data attributes to help with client-side processing
      img.setAttribute("data-bpr-image-id", `embedded-image-${index}`);
    }
  });

  return embeddedImages;
}

/**
 * Sanitizes WordPress content
 * Removes unwanted elements and attributes
 */
export function sanitizeWordPressContent(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Remove unwanted scripts
  const scripts = tempDiv.querySelectorAll("script");
  scripts.forEach((script) => script.remove());

  // Remove inline styles for cleaner rendering
  const elementsWithStyle = tempDiv.querySelectorAll("[style]");
  elementsWithStyle.forEach((el) => el.removeAttribute("style"));

  // Process links to open external ones in new tab
  const links = tempDiv.querySelectorAll("a");
  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("http") && !href.includes(window.location.hostname)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  return tempDiv.innerHTML;
}
