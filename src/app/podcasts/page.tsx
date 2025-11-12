import React from "react";
import { Metadata } from "next";
import {
  getAllCategories,
  getPostsByCategorySlug,
} from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import FeaturedPodcast from "../components/FeaturedPodcast";
import PodcastGrid from "../components/PodcastGrid";
import BeyondTheArticleSection from "../components/BeyondTheArticleSection";
import "./podcasts.css";

export const metadata: Metadata = {
  title: "Podcasts | Brown Political Review",
  description:
    "Listen to the latest podcasts from Brown Political Review. Featuring in-depth conversations, news analysis, and interviews with experts.",
};

async function getPodcastsByCategory(slug: string, limit: number = 12) {
  try {
    const posts = await getPostsByCategorySlug(slug, limit);
    return posts || [];
  } catch (error) {
    console.error(`Error fetching podcasts for category ${slug}:`, error);
    return [];
  }
}

export default async function PodcastsPage() {
  try {
    // Fetch all categories first
    const allCategories = await getAllCategories();

    // Fetch podcasts from main BPR Radio category and related categories
    // According to Figma design: Hero, Beyond the Article, Interviews, US
    const [bprRadioPosts, interviewsPodcasts, usPodcasts] =
      await Promise.all([
        getPodcastsByCategory("bpradio", 12),
        getPodcastsByCategory("interviews", 8),
        getPodcastsByCategory("united-states", 8),
      ]);

    // Enhance all posts with metadata
    const enhancedBprRadio = await enhancePosts(bprRadioPosts, allCategories);
    const enhancedInterviews = await enhancePosts(interviewsPodcasts, allCategories);
    const enhancedUS = await enhancePosts(usPodcasts, allCategories);

    // Get featured podcast (latest from BPR Radio)
    const featuredPodcast =
      enhancedBprRadio.length > 0 ? enhancedBprRadio[0] : null;

    // Get podcasts for "Beyond the Article" section (next 3 from BPR Radio)
    const beyondTheArticlePodcasts =
      enhancedBprRadio.length > 1 ? enhancedBprRadio.slice(1, 4) : [];

    return (
      <div className="podcasts-page">
        {/* Hero Section */}
        <section className="podcasts-hero">
          <div className="podcasts-hero-content">
            <h1 className="podcasts-hero-title">Podcast</h1>
            <p className="podcasts-hero-subtitle">
              Explore in-depth conversations, analysis, and interviews from
              Brown Political Review
            </p>
          </div>
        </section>

        {/* Featured Podcast Section */}
        {featuredPodcast && (
          <section className="podcasts-featured-section">
            <FeaturedPodcast podcast={featuredPodcast} />
          </section>
        )}

        {/* Beyond the Article Section - 2 column layout */}
        {beyondTheArticlePodcasts.length > 0 && (
          <BeyondTheArticleSection
            podcasts={beyondTheArticlePodcasts}
            title="Beyond the Article"
            showMoreButton={true}
            moreButtonLink="#"
          />
        )}

        {/* Interviews Section - 4 column grid */}
        {enhancedInterviews.length > 0 && (
          <section className="podcasts-section">
            <div className="section-container">
              <PodcastGrid
                podcasts={enhancedInterviews}
                title="Interviews"
                numberOfRows={1}
                className="podcasts-interviews-grid"
              />
              <a href="#" className="more-episodes-link">
                More episodes
              </a>
            </div>
          </section>
        )}

        {/* US Section - 4 column grid */}
        {enhancedUS.length > 0 && (
          <section className="podcasts-section">
            <div className="section-container">
              <PodcastGrid
                podcasts={enhancedUS}
                title="US"
                numberOfRows={1}
                className="podcasts-us-grid"
              />
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading podcasts page:", error);
    return (
      <div className="podcasts-page">
        <section className="podcasts-error">
          <div className="error-container">
            <h1>Podcasts</h1>
            <p>
              Unable to load podcasts at this time. Please try again later.
            </p>
          </div>
        </section>
      </div>
    );
  }
}
