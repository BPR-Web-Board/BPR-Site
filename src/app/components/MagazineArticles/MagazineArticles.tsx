import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ArticleSpotlight from "../ArticleSpotlight";
import ArticleLayout from "../ArticleLayout";
import Hero from "../Hero";
import TwoColumnArticleLayout from "../TwoColumnArticleLayout";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import "../Hero/Hero.css";
import "../../mainStyle.css";
import "../../magazine/magazine.css";
import { PageContentManager } from "../../lib/contentManager";
import { EnhancedPost } from "../../lib/types";

const HUB_SECTIONS = [
  { key: "united-states", title: "United States" },
  { key: "world", title: "World" },
  { key: "culture", title: "Culture" },
  { key: "interviews", title: "Interviews" },
] as const;

const SUBSECTION_TO_HUB: Record<string, string> = {
  education: "united-states",
  elections: "united-states",
  environment: "united-states",
  "foreign-policy": "united-states",
  health: "united-states",
  housing: "united-states",
  law: "united-states",
  "security-and-defense-usa": "united-states",
  africa: "world",
  "asia-pacific": "world",
  europe: "world",
  "latin-america": "world",
  "middle-east": "world",
  "south-america": "world",
  arts: "culture",
  gender: "culture",
  "health-culture": "culture",
  "lgbtq-politics": "culture",
  race: "culture",
  religion: "culture",
  science: "culture",
  technology: "culture",
  "professor-podcasts": "interviews",
  "rhode-island-interviews": "interviews",
  "ri-interviews": "interviews",
  "us-interviews": "interviews",
  "congress-interviews": "interviews",
  congress: "interviews",
  "world-interviews": "interviews",
};

const ALIASES: Record<string, string> = { usa: "united-states", mag: "magazine" };

function getHubKey(post: EnhancedPost): string | null {
  const slugs = (post.categories_obj || []).map(({ slug }) => ALIASES[slug] || slug);
  const hubs = HUB_SECTIONS.map((section) => section.key);
  return hubs.find((hub) => slugs.includes(hub))
    || hubs.find((hub) => slugs.some((slug) => SUBSECTION_TO_HUB[slug] === hub))
    || null;
}

function byDate(a: EnhancedPost, b: EnhancedPost) {
  return (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0) || b.id - a.id;
}

export default function MagazineArticles({ posts, title = "Magazine", intro, afterHero, archiveHref = "/magazine/archive", emptyMessage = "No articles are available yet.", specialFeaturePosts = [], coverHero }: {
  posts: EnhancedPost[];
  title?: string;
  intro?: ReactNode;
  afterHero?: ReactNode;
  archiveHref?: string | null;
  emptyMessage?: string;
  specialFeaturePosts?: EnhancedPost[];
  coverHero?: { url: string; alt?: string } | null;
}) {
  const specialIds = new Set(specialFeaturePosts.map((post) => post.id));
  const magazinePosts = [...posts]
    .filter((post) => !specialIds.has(post.id))
    .sort(byDate);
  const specialFeatures = [...specialFeaturePosts].sort(byDate);
  const hasCoverHero = Boolean(coverHero?.url);

  const contentManager = new PageContentManager();
  const heroArticles = contentManager.selectArticles(magazinePosts, 1, { allowPartial: true });

  const unused = magazinePosts.filter((post) => !contentManager.isUsed(post.id));
  const buckets = Object.fromEntries(HUB_SECTIONS.map((section) => [section.key, [] as EnhancedPost[]])) as Record<string, EnhancedPost[]>;
  const leftovers: EnhancedPost[] = [];

  for (const post of unused) {
    const hub = getHubKey(post);
    if (hub) buckets[hub].push(post);
    else leftovers.push(post);
  }

  const usPosts = buckets["united-states"];
  const worldPosts = buckets["world"];
  const culturePosts = buckets["culture"];
  const interviewsPosts = buckets["interviews"];

  const coverIntro = hasCoverHero ? (
    <section className="hero-section issue-cover-hero" aria-label={`${title} cover`}>
      <div className="hero-background">
        <OptimizedImage
          src={coverHero!.url}
          alt={coverHero!.alt || `${title} cover`}
          fill
          sizes="100vw"
          priority
          className="hero-bg-image issue-cover-image"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          showPlaceholder={true}
        />
        <div className="hero-gradient-overlay" />
      </div>
      <div className="issue-cover-content">{intro}</div>
    </section>
  ) : null;

  return (
    <div className="main-content">
      {coverIntro}
      {!magazinePosts.length && !specialFeatures.length && (
        <div className="site-state width-constrained">{emptyMessage}</div>
      )}

      {!hasCoverHero && heroArticles.length > 0 && (
        <Hero posts={heroArticles} preferredCategory="magazine" priority topChrome={intro} />
      )}

      {!hasCoverHero && heroArticles.length === 0 && intro}

      {afterHero}

      {specialFeatures.length > 0 && (
        <ArticleLayout posts={specialFeatures} categoryName="Special Feature" />
      )}

      {hasCoverHero && heroArticles.length > 0 && (
        <Hero posts={heroArticles} preferredCategory="magazine" />
      )}

      {usPosts.length > 0 && worldPosts.length > 0 && usPosts.length <= 4 && worldPosts.length <= 4 ? (
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="United States"
            leftColumnArticles={usPosts}
            rightColumnTitle="World"
            rightColumnArticles={worldPosts}
          />
        </div>
      ) : (
        <>
          {usPosts.length > 0 && (
            <ArticleLayout posts={usPosts} categoryName="United States" />
          )}
          {worldPosts.length > 0 && (
            <ArticleLayout posts={worldPosts} categoryName="World" />
          )}
        </>
      )}

      {culturePosts.length > 0 && (
        <ArticleLayout posts={culturePosts} categoryName="Culture" />
      )}

      {interviewsPosts.length > 0 && (
        <ArticleLayout posts={interviewsPosts} categoryName="Interviews" />
      )}

      {leftovers.length > 0 && (
        <ArticleSpotlight
          title="Featured Stories"
          posts={leftovers}
          maxArticles={leftovers.length}
        />
      )}

      {archiveHref ? (
        <div className="explore-archive-container">
          <Link href={archiveHref} className="site-action">
            Archive <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
