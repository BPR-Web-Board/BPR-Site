import React from "react";
import FeaturedArticle from "../components/shared/FeaturedArticle";
import LargeArticlePreview from "../components/shared/LargeArticlePreview";
import SmallArticlePreview from "../components/shared/SmallArticlePreview";
import ArticleCard from "../components/shared/ArticleCard";
import PodcastCard from "../components/shared/PodcastCard";
import SpotifyEmbed from "../components/shared/SpotifyEmbed";
import LoadingSkeleton from "../components/shared/LoadingSkeleton/LoadingSkeleton";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FeaturedArticleLayout from "../components/FeaturedArticleLayout";
import FeaturedPodcast from "../components/FeaturedPodcast";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import PodcastGrid from "../components/PodcastGrid";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import { EnhancedPost, Category, FeaturedMedia } from "../lib/types";

// Simple in-page mock data for showcasing preview components.
// This avoids network calls and keeps the page self-contained.

function createMockMedia(id: number): FeaturedMedia {
  return {
    id,
    date: new Date().toISOString(),
    slug: `image-${id}`,
    type: "attachment",
    link: `https://example.com/image-${id}`,
    title: { rendered: `Mock Image ${id}` },
    author: 1,
    caption: { rendered: "" },
    alt_text: "Mock image alt",
    media_type: "image",
    mime_type: "image/jpeg",
    media_details: {
      width: 1200,
      height: 800,
      file: `image-${id}.jpg`,
      sizes: {
        medium: {
          file: `image-${id}-medium.jpg`,
          width: 600,
          height: 400,
          mime_type: "image/jpeg",
          source_url: `https://picsum.photos/seed/mock-${id}/600/400`,
        },
      },
    },
    source_url: `https://picsum.photos/seed/mock-${id}/1200/800`,
  };
}

function createMockCategory(slug: string): Category {
  return {
    id: Math.floor(Math.random() * 10000),
    count: 1,
    description: "Mock category",
    link: `/${slug}`,
    name: slug.toUpperCase(),
    slug,
    taxonomy: "category",
    parent: 0,
    meta: [],
  };
}

function createMockPost(
  id: number,
  overrides: Partial<EnhancedPost> = {}
): EnhancedPost {
  const slug = overrides.slug || `mock-post-${id}`;
  return {
    id,
    date: new Date().toISOString(),
    date_gmt: new Date().toISOString(),
    guid: { rendered: `https://example.com/${slug}` },
    modified: new Date().toISOString(),
    modified_gmt: new Date().toISOString(),
    slug,
    status: "publish",
    type: "post",
    link: `https://example.com/${slug}`,
    title: {
      rendered: `Mock Post Title ${id} — A Demonstration of Component Rendering`,
    },
    content: { rendered: "<p>Mock content body.</p>", protected: false },
    excerpt: {
      rendered:
        "<p>This is a short mock excerpt to demonstrate layout behavior.</p>",
      protected: false,
    },
    author: 1,
    featured_media: id,
    format: "standard",
    meta: {},
    categories: [1],
    tags: [],
    class_list: [],
    coauthors: [],
    author_name: "John Doe",
    featured_media_obj: createMockMedia(id),
    categories_obj: [createMockCategory("world")],
    ...overrides,
  };
}

const mockPosts: EnhancedPost[] = [
  createMockPost(1),
  createMockPost(2, { author_name: "Jane Smith" }),
  createMockPost(3, { author_name: "Alex Johnson" }),
  createMockPost(4, { author_name: "Taylor Lee" }),
];

export const metadata = {
  title: "Preview Components Showcase",
};

export default function PreviewComponentsPage() {
  const [p1, p2, p3, p4] = mockPosts;

  return (
    <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "2.25rem", fontWeight: 600, marginBottom: "1.5rem" }}
      >
        Components Showcase
      </h1>
      <p style={{ marginBottom: "2.5rem", color: "#555" }}>
        This page demonstrates all the components with mocked data. Excludes
        Footer and ArticleView.
      </p>

      {/* Hero */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          Hero
        </h2>
        <Hero posts={mockPosts} priority={true} />
      </section>

      {/* ArticleCarousel */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticleCarousel
        </h2>
        <ArticleCarousel
          title="Latest Stories"
          posts={mockPosts}
          maxArticles={4}
        />
      </section>

      {/* ArticleGrid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticleGrid
        </h2>
        <ArticleGrid posts={mockPosts} categoryName="World" maxArticles={4} />
      </section>

      {/* ArticleLayout */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticleLayout
        </h2>
        <ArticleLayout posts={mockPosts} categoryName="Popular Articles" />
      </section>

      {/* ArticlePreviewGrid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticlePreviewGrid
        </h2>
        <ArticlePreviewGrid articles={mockPosts.concat(mockPosts)} />
      </section>

      {/* ArticleSplitShowcase */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticleSplitShowcase
        </h2>
        <ArticleSplitShowcase
          posts={mockPosts.concat(mockPosts)}
          sectionTitle="Featured Stories"
          mainPlacement="left"
          maxSecondary={6}
        />
      </section>

      {/* FeaturedArticleLayout */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          FeaturedArticleLayout
        </h2>
        <FeaturedArticleLayout
          title="Featured"
          posts={mockPosts.concat(mockPosts)}
          maxArticles={7}
        />
      </section>

      {/* FourArticleGrid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          FourArticleGrid
        </h2>
        <FourArticleGrid
          posts={mockPosts}
          categoryName="Recent Articles"
          showCategoryTitle={true}
          numberOfRows={1}
          className="width-constrained"
        />
      </section>

      {/* TwoColumnArticleLayout */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          TwoColumnArticleLayout
        </h2>
        <TwoColumnArticleLayout
          leftColumnTitle="United States"
          leftColumnArticles={mockPosts}
          rightColumnTitle="World"
          rightColumnArticles={mockPosts}
          showMainArticle={true}
        />
      </section>

      {/* FeaturedPodcast */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          FeaturedPodcast
        </h2>
        <FeaturedPodcast
          podcast={createMockPost(10, { author_name: "BPR Podcast Team" })}
          spotifyUrl="https://open.spotify.com/episode/0ofHAoxe9vBkTCp2U9u0ZV"
          duration="42:15"
        />
      </section>

      {/* PodcastGrid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          PodcastGrid
        </h2>
        <PodcastGrid
          podcasts={mockPosts}
          title="Latest Podcasts"
          showTitle={true}
          numberOfRows={1}
        />
      </section>

      <hr
        style={{
          margin: "3rem 0",
          border: "none",
          borderTop: "2px solid #e0e0e0",
        }}
      />

      {/* Shared Components: FeaturedArticle Variants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          FeaturedArticle (Shared)
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <FeaturedArticle article={p1} variant="default" />
          <FeaturedArticle article={p2} variant="large" />
          <FeaturedArticle article={p3} variant="compact" />
        </div>
      </section>

      {/* LargeArticlePreview Variants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          LargeArticlePreview (Shared)
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          }}
        >
          <LargeArticlePreview
            article={p1}
            variant="default"
            imagePosition="top"
          />
          <LargeArticlePreview
            article={p2}
            variant="default"
            imagePosition="left"
          />
          <LargeArticlePreview
            article={p3}
            variant="compact"
            imagePosition="right"
          />
        </div>
      </section>

      {/* SmallArticlePreview Variants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          SmallArticlePreview (Shared)
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <SmallArticlePreview article={p1} variant="default" />
          <SmallArticlePreview article={p2} variant="compact" />
          <SmallArticlePreview article={p3} variant="sidebar" />
          <SmallArticlePreview article={p4} variant="preview-grid" />
        </div>
      </section>

      {/* ArticleCard Variants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          ArticleCard (Shared)
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <ArticleCard article={p1} variant="standard" />
          <ArticleCard article={p2} variant="compact" />
          <ArticleCard article={p3} variant="featured" />
        </div>
      </section>

      {/* PodcastCard & SpotifyEmbed */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          PodcastCard & SpotifyEmbed (Shared)
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <PodcastCard podcast={createMockPost(10)} />
          <SpotifyEmbed spotifyUrl="https://open.spotify.com/episode/0ofHAoxe9vBkTCp2U9u0ZV" />
        </div>
      </section>

      {/* Loading Skeleton Variants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          LoadingSkeleton (Shared)
        </h2>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Article
            </h3>
            <LoadingSkeleton variant="article" />
          </div>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Hero
            </h3>
            <LoadingSkeleton variant="hero" />
          </div>
          <div style={{ flex: 1, minWidth: "320px" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Grid (count=3)
            </h3>
            <LoadingSkeleton variant="grid" count={3} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Text (count=5)
            </h3>
            <LoadingSkeleton variant="text" count={5} />
          </div>
        </div>
      </section>

      <footer
        style={{ marginTop: "4rem", fontSize: "0.875rem", color: "#666" }}
      >
        <p>
          All components from the components folder are displayed above. Footer
          and ArticleView are excluded as requested.
        </p>
      </footer>
    </main>
  );
}
