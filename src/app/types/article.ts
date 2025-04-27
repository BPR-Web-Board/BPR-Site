// Types for article content parsing and rendering
export interface PullQuote {
  content: string;
  citation?: string;
  alignment?: "left" | "right" | "center";
}

export interface EmbeddedImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  credit?: string;
  width?: number;
  height?: number;
}

export interface ParsedArticleContent {
  content: string;
  pullQuotes: PullQuote[];
  embeddedImages: EmbeddedImage[];
}

// Props for article components
export interface ArticleProps {
  slug: string;
}

export interface ArticleRendererProps {
  post: any; // WordPress post type
  className?: string;
}

export interface ImageWithCaptionProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  credit?: string;
  priority?: boolean;
  className?: string;
}

export interface PullQuoteProps {
  content: string;
  citation?: string;
  alignment?: "left" | "right" | "center";
  className?: string;
}

export interface ArticleMetaProps {
  author: {
    name: string;
    slug?: string;
  };
  coAuthors?: Array<{
    name: string;
    slug?: string;
  }>;
  date: string;
  illustrator?: string;
  categories?: string[];
  tags?: string[];
  className?: string;
}
