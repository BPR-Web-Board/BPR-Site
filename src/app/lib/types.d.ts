type NavProps = {
  className?: string;
  children?: React.ReactNode;
  id?: string;
};

export type Post = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  meta: any; // Changed from any[] to any to support both array and object forms
  categories: number[];
  tags: number[];
  // Add new properties as optional to avoid TypeScript errors
  class_list?: string[] | string; // Updated to support both array and string formats
  coauthors?: number[] | number; // Updated to support both array and single number
};

// Keep the rest of your types as they are
export type Category = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "category";
  parent: number;
  meta: any[];
};

export type Tag = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "post_tag";
  meta: any[];
};

export type Page = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  template: string;
  meta: any[];
};

export type Author = {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
  meta: any[];
};

export type BlockType = {
  api_version: number;
  title: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  keywords: string[];
  parent: string[];
  supports: {
    [key: string]: any;
  };
  styles: {
    name: string;
    label: string;
    isDefault: boolean;
  }[];
  textdomain: string;
  example: {
    [key: string]: any;
  };
  attributes: {
    [key: string]: any;
  };
  provides_context: {
    [key: string]: string;
  };
  uses_context: string[];
  editor_script: string;
  script: string;
  editor_style: string;
  style: string;
};

export type EditorBlock = {
  id: string;
  name: string;
  attributes: {
    [key: string]: any;
  };
  innerBlocks: EditorBlock[];
  innerHTML: string;
  innerContent: string[];
};

export type TemplatePart = {
  id: string;
  slug: string;
  theme: string;
  type: string;
  source: string;
  origin: string;
  content: string | EditorBlock[];
  title: {
    raw: string;
    rendered: string;
  };
  description: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  wp_id: number;
  has_theme_file: boolean;
  author: number;
  area: string;
};

export type SearchResult = {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
  _links: {
    self: {
      embeddable: boolean;
      href: string;
    }[];
    about: {
      href: string;
    }[];
  };
};

export type FeaturedMedia = {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  source_url: string;
};

type FilterBarProps = {
  authors: Author[];
  tags: Tag[];
  categories: Category[];
  selectedAuthor?: string;
  selectedTag?: string;
  selectedCategory?: string;
};

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
